import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { soundFx } from '../shared/lib/sound';
import { sendWebPushNotification } from '../shared/lib/pwa';
import {
  Conversation,
  Message,
  BotConfig,
  FailureInjectors,
  SystemEvent,
  Channel,
  LeadTemperature,
  ThreadStatus,
  ExtractedLeadFields,
  AdvisorProfile,
} from '../types';
import {
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_EVENTS,
  INITIAL_BOT_CONFIG,
  INITIAL_FAILURE_INJECTORS,
} from './seedData';
import { BRAND_CONFIG } from '../shared/i18n';
import { logoutOperator, type OperatorSession } from '../shared/api/operatorAuth';
import { getConversation, listConversations, listConversationMessages, listOpenHandoffs, sendConversationMessage, setConversationHandback, setConversationTakeover, type ConversationRecord, type ConversationMessageRecord } from '../shared/api/operatorCrmApi';

const STORAGE_KEYS = {
  CONVERSATIONS: 'meta_crm_conversations_v1',
  MESSAGES: 'meta_crm_messages_v1',
  CONFIG: 'meta_crm_config_v1',
  INJECTORS: 'meta_crm_injectors_v1',
  EVENTS: 'meta_crm_events_v1',
  ADVISOR: 'meta_crm_advisor_v1',
};

const DEFAULT_ADVISOR: AdvisorProfile = {
  id: 'adv-01',
  name: 'Miky Delzar',
  email: `miky.delzar@${BRAND_CONFIG.emailDomain}`,
  role: 'Propietario',
  branch: BRAND_CONFIG.branch,
  status: 'available',
  assignedCount: 6,
};

// Singleton store state in memory + synced with localStorage
let state = {
  conversations: SEED_CONVERSATIONS,
  messages: SEED_MESSAGES,
  events: SEED_EVENTS,
  botConfig: INITIAL_BOT_CONFIG,
  failureInjectors: INITIAL_FAILURE_INJECTORS,
  advisorProfile: DEFAULT_ADVISOR,
  selectedConversationId: 'conv-1' as string | null,
  selectedMessageId: 'msg-104' as string | null,
  channelFilter: 'all' as 'all' | Channel,
  searchQuery: '',
  activeTab: 'inbox' as 'inbox' | 'metrics' | 'service-status' | 'config' | 'test-lab' | 'events',
  isAiTyping: false,
  isInspectorOpen: false,
  userRole: 'propietario' as 'propietario' | 'gerente' | 'asesor',
  isAuthenticated: false,
  authReady: false,
  authUnavailable: false,
  tenantIds: [] as string[],
  activeTenantId: null as string | null,
  crmDataError: null as string | null,
};

// Load initial state from localStorage if present
try {
  const savedConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  if (savedConvs) state.conversations = JSON.parse(savedConvs);

  const savedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (savedMsgs) state.messages = JSON.parse(savedMsgs);

  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (savedConfig) state.botConfig = JSON.parse(savedConfig);

  const savedInjectors = localStorage.getItem(STORAGE_KEYS.INJECTORS);
  if (savedInjectors) state.failureInjectors = JSON.parse(savedInjectors);

  const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (savedEvents) state.events = JSON.parse(savedEvents);

  const savedAdvisor = localStorage.getItem(STORAGE_KEYS.ADVISOR);
  if (savedAdvisor) state.advisorProfile = JSON.parse(savedAdvisor);

} catch (e) {
  console.warn('Could not read from localStorage, using initial seeds', e);
}

// Current snapshot for useSyncExternalStore
let currentSnapshot = { ...state };

const listeners = new Set<() => void>();

function notify() {
  currentSnapshot = { ...state };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentSnapshot;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(state.conversations));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.botConfig));
    localStorage.setItem(STORAGE_KEYS.INJECTORS, JSON.stringify(state.failureInjectors));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export function logSystemEvent(
  event: Omit<SystemEvent, 'id' | 'timestamp'>
) {
  const newEvent: SystemEvent = {
    ...event,
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };
  state.events = [newEvent, ...state.events].slice(0, 200); // keep last 200 events
  persist();
  notify();
  return newEvent;
}

// In-memory deduplication cache for Meta webhooks
const processedWebhookIds = new Set<string>();
let conversationRefreshGeneration = 0;

function roleFromSession(roles: string[]): 'propietario' | 'gerente' | 'asesor' {
  if (roles.includes('ADMIN')) return 'propietario';
  if (roles.includes('MANAGER')) return 'gerente';
  return 'asesor';
}

function roleLabel(role: 'propietario' | 'gerente' | 'asesor'): string {
  if (role === 'propietario') return 'Propietario';
  if (role === 'gerente') return 'Gerente / Supervisor';
  return 'Asesor de Ventas';
}

function toUiConversation(record: ConversationRecord): Conversation {
  const timestamp = record.latestMessage?.receivedAt ?? record.updatedAt;
  const status: ThreadStatus = record.state === 'HUMAN_ACTIVE' ? 'human'
    : record.state === 'HUMAN_PENDING' ? 'waiting'
      : record.state === 'CLOSED' ? 'failed' : 'bot';
  return {
    id: record.id,
    version: record.version,
    channel: record.channel.toLowerCase() as Channel,
    customerName: record.participant.displayName || record.participant.phone || record.participant.providerId,
    customerHandle: record.participant.phone || record.participant.providerId,
    avatarUrl: '',
    status,
    leadTemperature: 'cold',
    temperatureSource: 'ai',
    extractedFields: {},
    firstSeen: record.updatedAt,
    lastMessageAt: timestamp,
    lastCustomerMessageAt: timestamp,
    unreadCount: 0,
    isWindowOpen: false,
    assignedTo: record.assignedOperatorId ?? undefined,
  };
}

function toUiMessage(record: ConversationMessageRecord, channel: Channel): Message {
  const status: Message['status'] = record.deliveryStatus === 'FAILED' ? 'failed'
    : record.deliveryStatus === 'READ' ? 'read'
      : record.deliveryStatus === 'DELIVERED' ? 'delivered'
        : record.deliveryStatus === 'SENT' ? 'sent' : 'sending';
  return {
    id: record.id,
    conversationId: record.conversationId,
    channel,
    sender: record.direction === 'INBOUND' ? 'customer' : 'human',
    content: record.content,
    timestamp: record.sentAt ?? record.receivedAt,
    status,
  };
}

export function useCrmStore() {
  const store = useSyncExternalStore(subscribe, getSnapshot);

  const selectConversation = useCallback((id: string | null) => {
    if (!id) {
      state.selectedConversationId = null;
      state.selectedMessageId = null;
      notify();
      return;
    }

    state.selectedConversationId = id;
    // Auto-select the latest bot message in this conversation for the inspector
    const convBotMsgs = state.messages.filter(
      (m) => m.conversationId === id && m.sender === 'bot' && m.aiDebug
    );
    state.selectedMessageId = convBotMsgs.length > 0 ? convBotMsgs[convBotMsgs.length - 1].id : null;
    
    // Mark messages as read
    state.conversations = state.conversations.map((c) =>
      c.id === id ? { ...c, unreadCount: 0 } : c
    );
    state.messages = state.messages.map((m) =>
      m.conversationId === id && m.status === 'delivered' ? { ...m, status: 'read' } : m
    );

    persist();
    notify();
    const tenantId = state.activeTenantId;
    if (tenantId && state.isAuthenticated) {
      void listConversationMessages(tenantId, id).then((page) => {
        if (state.selectedConversationId !== id) return;
        const conversation = state.conversations.find((item) => item.id === id);
        if (!conversation) return;
        // The API returns newest-first for pagination; the chat timeline renders
        // oldest-first and scrolls to the end to show the newest message.
        state.messages = [...page.items].reverse().map((message) => toUiMessage(message, conversation.channel));
        state.crmDataError = null;
        notify();
      }).catch((error: unknown) => {
        if (state.selectedConversationId !== id) return;
        state.crmDataError = error instanceof Error ? error.message : 'No se pudieron cargar los mensajes';
        notify();
      });
    }
  }, []);

  const setSelectedMessageId = useCallback((id: string | null) => {
    state.selectedMessageId = id;
    notify();
  }, []);

  const setChannelFilter = useCallback((filter: 'all' | Channel) => {
    state.channelFilter = filter;
    // If the currently selected conversation doesn't match the filter, select the first match
    if (filter !== 'all') {
      const current = state.conversations.find((c) => c.id === state.selectedConversationId);
      if (!current || current.channel !== filter) {
        const firstMatch = state.conversations.find((c) => c.channel === filter);
        if (firstMatch) {
          state.selectedConversationId = firstMatch.id;
        }
      }
    }
    notify();
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    state.searchQuery = query;
    notify();
  }, []);

  const setActiveTab = useCallback((tab: 'inbox' | 'metrics' | 'service-status' | 'config' | 'test-lab' | 'events') => {
    state.activeTab = tab;
    notify();
  }, []);

  const setTakeover = useCallback(async (conversationId: string, targetStatus: 'bot' | 'human') => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    if (conv.status === targetStatus) return;

    if (state.isAuthenticated) {
      const tenantId = state.activeTenantId;
      if (!tenantId) {
        state.crmDataError = 'Selecciona una sucursal antes de cambiar el control del chat.';
        notify();
        return;
      }
      try {
        if (targetStatus === 'human') {
          await setConversationTakeover(tenantId, conversationId);
        } else {
          const openHandoffs = await listOpenHandoffs();
          const handoff = openHandoffs.items.find((item) => item.conversationId === conversationId && item.status !== 'CLOSED');
          if (!handoff) throw new Error('No hay una transferencia activa para devolver al asistente.');
          await setConversationHandback(conversationId, handoff.version);
        }
        const refreshed = await getConversation(tenantId, conversationId);
        state.conversations = state.conversations.map((item) => item.id === conversationId ? toUiConversation(refreshed) : item);
        state.crmDataError = null;
        notify();
      } catch (error) {
        state.crmDataError = error instanceof Error ? error.message : 'No se pudo actualizar el control del chat';
        notify();
      }
      return;
    }

    state.conversations = state.conversations.map((c) =>
      c.id === conversationId ? { ...c, status: targetStatus } : c
    );

    logSystemEvent({
      conversationId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: 'human_takeover',
      status: 'info',
      summary: targetStatus === 'human' ? 'Asesor humano tomó el control del chat' : 'Control devuelto al asistente virtual (Bot)',
      details: { previousStatus: conv.status, newStatus: targetStatus },
    });

    persist();
    notify();
  }, []);

  const toggleTakeover = useCallback((conversationId: string) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const newStatus: ThreadStatus = conv.status === 'human' ? 'bot' : 'human';
    if (state.isAuthenticated) {
      void setTakeover(conversationId, newStatus);
      return;
    }

    state.conversations = state.conversations.map((c) => c.id === conversationId ? { ...c, status: newStatus } : c);

    logSystemEvent({
      conversationId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: 'human_takeover',
      status: 'info',
      summary: newStatus === 'human' ? 'Asesor humano tomó el control del chat' : 'Control devuelto al asistente virtual (Bot)',
      details: { previousStatus: conv.status, newStatus },
    });

    persist();
    notify();
  }, [setTakeover]);

  const updateLeadTemperature = useCallback((conversationId: string, temp: LeadTemperature) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    state.conversations = state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, leadTemperature: temp, temperatureSource: 'human' }
        : c
    );

    logSystemEvent({
      conversationId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: 'delivery_update',
      status: 'info',
      summary: `Temperatura del lead actualizada manualmente a '${temp}'`,
      details: { previousTemp: conv.leadTemperature, newTemp: temp, source: 'human' },
    });

    persist();
    notify();
  }, []);

  const updateExtractedFields = useCallback((conversationId: string, fields: Partial<ExtractedLeadFields>) => {
    state.conversations = state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, extractedFields: { ...c.extractedFields, ...fields } }
        : c
    );
    persist();
    notify();
  }, []);

  const reassignConversation = useCallback((conversationId: string, advisorId: string, advisorName: string) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    state.conversations = state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, assignedTo: advisorId }
        : c
    );

    logSystemEvent({
      conversationId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: 'delivery_update',
      status: 'info',
      summary: `Lead reasignado a '${advisorName}' (ID: ${advisorId}) por el sistema de control`,
      details: { previousAdvisor: conv.assignedTo, newAdvisor: advisorId, advisorName },
    });

    persist();
    notify();
  }, []);

  const updateBotConfig = useCallback((newConfig: Partial<BotConfig>) => {
    state.botConfig = { ...state.botConfig, ...newConfig };
    persist();
    notify();
  }, []);

  const resetBotConfig = useCallback(() => {
    state.botConfig = { ...INITIAL_BOT_CONFIG };
    persist();
    notify();
  }, []);

  const updateFailureInjectors = useCallback((injectors: Partial<FailureInjectors>) => {
    state.failureInjectors = { ...state.failureInjectors, ...injectors };
    persist();
    notify();
  }, []);

  const resetFailureInjectors = useCallback(() => {
    state.failureInjectors = { ...INITIAL_FAILURE_INJECTORS };
    persist();
    notify();
  }, []);

  const resetAllData = useCallback(() => {
    state.conversations = SEED_CONVERSATIONS;
    state.messages = SEED_MESSAGES;
    state.events = SEED_EVENTS;
    state.botConfig = INITIAL_BOT_CONFIG;
    state.failureInjectors = INITIAL_FAILURE_INJECTORS;
    state.selectedConversationId = 'conv-1';
    state.selectedMessageId = 'msg-104';
    state.channelFilter = 'all';
    state.searchQuery = '';
    processedWebhookIds.clear();
    persist();
    notify();
  }, []);

  const retryFailedMessage = useCallback(async (messageId: string) => {
    const msg = state.messages.find((m) => m.id === messageId);
    if (!msg) return;

    // Transition to sending
    state.messages = state.messages.map((m) =>
      m.id === messageId ? { ...m, status: 'sending' } : m
    );
    notify();

    logSystemEvent({
      conversationId: msg.conversationId,
      channel: msg.channel,
      eventType: 'retry_triggered',
      status: 'info',
      summary: `Reintento manual de entrega para mensaje ${messageId.slice(-6)}`,
      details: { messageId, originalContent: msg.content },
    });

    await new Promise((r) => setTimeout(r, 600));

    // If channelSendFailure injector is on, fail again
    if (state.failureInjectors.channelSendFailure) {
      state.messages = state.messages.map((m) =>
        m.id === messageId ? { ...m, status: 'failed' } : m
      );
      logSystemEvent({
        conversationId: msg.conversationId,
        channel: msg.channel,
        eventType: 'error',
        status: 'error',
        summary: 'Reintento falló: inyector de falla de envío de canal activo',
        details: { messageId },
      });
      persist();
      notify();
      return;
    }

    state.messages = state.messages.map((m) =>
      m.id === messageId ? { ...m, status: 'delivered' } : m
    );
    persist();
    notify();
  }, []);

  const fastForward24Hours = useCallback((conversationId?: string) => {
    const targetId = conversationId || state.selectedConversationId;
    if (!targetId) return;

    const conv = state.conversations.find((c) => c.id === targetId);
    if (!conv) return;

    // Set lastCustomerMessageAt to 25 hours ago
    const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    state.conversations = state.conversations.map((c) =>
      c.id === targetId ? { ...c, isWindowOpen: false, lastCustomerMessageAt: pastDate } : c
    );

    logSystemEvent({
      conversationId: targetId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: 'window_expired',
      status: 'warning',
      summary: 'Simulación: Ventana de 24h cerrada por inactividad del cliente (>24h)',
      details: { targetId, simulatedPastDate: pastDate },
    });

    persist();
    notify();
  }, []);

  const reopen24HourWindow = useCallback((conversationId: string) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    state.conversations = state.conversations.map((c) =>
      c.id === conversationId ? { ...c, isWindowOpen: true, lastCustomerMessageAt: new Date().toISOString() } : c
    );
    persist();
    notify();
  }, []);

  // Send human agent message or internal note
  const sendAgentMessage = useCallback(async (conversationId: string, content: string, isInternalNote = false) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv || !content.trim()) return;

    if (state.isAuthenticated) {
      if (!state.activeTenantId || conv.version === undefined) {
        state.crmDataError = 'No se puede enviar el mensaje: falta sucursal o versión de conversación.';
        notify();
        return;
      }
      try {
        const receipt = await sendConversationMessage(state.activeTenantId, conversationId, conv.version, content.trim(), isInternalNote);
        state.conversations = state.conversations.map((item) => item.id === conversationId
          ? { ...item, version: receipt.conversationVersion, lastMessageAt: receipt.acceptedAt }
          : item);
        state.messages = [...state.messages, {
          id: receipt.messageId,
          conversationId,
          channel: conv.channel,
          sender: isInternalNote ? 'system' : 'human',
          content: content.trim(),
          timestamp: receipt.acceptedAt,
          status: isInternalNote ? 'delivered' : 'sending',
          isInternalNote,
        }];
        state.crmDataError = null;
        notify();
      } catch (error) {
        state.crmDataError = error instanceof Error ? error.message : 'No se pudo enviar el mensaje';
        notify();
      }
      return;
    }

    const now = new Date().toISOString();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      channel: conv.channel,
      sender: isInternalNote ? 'system' : 'human',
      content: content.trim(),
      timestamp: now,
      status: isInternalNote ? 'delivered' : 'sent',
      isInternalNote,
    };

    state.messages = [...state.messages, newMsg];
    state.conversations = state.conversations.map((c) =>
      c.id === conversationId ? { ...c, lastMessageAt: now } : c
    );

    logSystemEvent({
      conversationId,
      conversationName: conv.customerName,
      channel: conv.channel,
      eventType: isInternalNote ? 'message_sent' : 'message_sent',
      status: 'info',
      summary: isInternalNote ? 'Nota interna guardada (no visible al cliente)' : 'Mensaje enviado por asesor humano',
      details: { content, isInternalNote },
    });

    // Simulate delivery ticks for outbound human message
    if (!isInternalNote) {
      setTimeout(() => {
        state.messages = state.messages.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        );
        persist();
        notify();
      }, 500);
    }

    persist();
    notify();
  }, []);

  // Customer message in -> pipeline processing
  const sendCustomerMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      options?: {
        unsupportedMedia?: boolean;
        mediaType?: 'image' | 'audio';
        customMessageId?: string;
      }
    ) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || !content.trim()) return;

      const messageId = options?.customMessageId || `msg-cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // 1. Duplicate Webhook Check
      if (state.failureInjectors.duplicateWebhook || processedWebhookIds.has(messageId)) {
        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'deduplicated',
          status: 'warning',
          summary: `Mensaje duplicado descartado por ID idempotente (${messageId.slice(-8)})`,
          details: { messageId, content },
        });
        // If duplicate injector was one-time, we don't proceed with processing
        if (processedWebhookIds.has(messageId)) {
          return;
        }
      }
      processedWebhookIds.add(messageId);

      const now = new Date().toISOString();
      const customerMsg: Message = {
        id: messageId,
        conversationId,
        channel: conv.channel,
        sender: 'customer',
        content: content.trim(),
        timestamp: now,
        status: 'read',
        unsupportedMedia: options?.unsupportedMedia,
        mediaType: options?.mediaType,
      };

      // Customer message automatically resets 24-hour window
      soundFx.playReceive();
      sendWebPushNotification(
        `Nuevo mensaje • ${conv.customerName}`,
        content.trim(),
        { tag: `msg-${conversationId}` }
      );
      state.messages = [...state.messages, customerMsg];
      state.conversations = state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessageAt: now,
              lastCustomerMessageAt: now,
              isWindowOpen: true,
              unreadCount: state.selectedConversationId === conversationId ? 0 : c.unreadCount + 1,
            }
          : c
      );

      logSystemEvent({
        conversationId,
        conversationName: conv.customerName,
        channel: conv.channel,
        eventType: 'incoming_message',
        status: 'info',
        summary: options?.unsupportedMedia
          ? `Mensaje entrante con contenido multimedia no soportado (${options.mediaType || 'archivo'})`
          : `Mensaje de cliente recibido: "${content.slice(0, 45)}${content.length > 45 ? '...' : ''}"`,
        details: { content, channel: conv.channel, isMedia: Boolean(options?.unsupportedMedia) },
      });

      if (state.advisorProfile.status === 'away') {
        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'incoming_message',
          status: 'warning',
          summary: `Asesor ausente: Se evitó la derivación automática a ${state.advisorProfile.name} por encontrarse en modo Ausente.`,
          details: { status: 'away', currentAdvisor: state.advisorProfile.name },
        });
      }

      persist();
      notify();

      // Check if thread is controlled by human or bot is turned off
      if (conv.status === 'human') {
        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'incoming_message',
          status: 'info',
          summary: 'Hilo en modo Agente Humano: el bot permanece en silencio esperando respuesta humana.',
          details: { status: 'human' },
        });
        return;
      }

      if (state.botConfig.mode === 'off') {
        logSystemEvent({
          conversationId,
          channel: conv.channel,
          eventType: 'incoming_message',
          status: 'info',
          summary: 'Modo del bot en "Off": respuesta automática deshabilitada.',
          details: { mode: 'off' },
        });
        return;
      }

      // Handle unsupported media immediately with graceful fallback
      if (options?.unsupportedMedia) {
        state.isAiTyping = true;
        notify();
        await new Promise((r) => setTimeout(r, 600));
        state.isAiTyping = false;

        const fallbackReply: Message = {
          id: `msg-bot-${Date.now()}`,
          conversationId,
          channel: conv.channel,
          sender: 'bot',
          content: 'He recibido tu archivo multimedia. Por el momento como asistente de texto no puedo visualizarlo directamente, pero transferiré de inmediato tu mensaje a un asesor de ventas para que lo revise.',
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };

        state.messages = [...state.messages, fallbackReply];
        state.conversations = state.conversations.map((c) =>
          c.id === conversationId ? { ...c, status: 'waiting', lastMessageAt: fallbackReply.timestamp } : c
        );

        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'handoff_triggered',
          status: 'warning',
          summary: 'Transferencia automática: Contenido multimedia no soportado recibido',
          details: { mediaType: options.mediaType },
        });

        persist();
        notify();
        return;
      }

      // 2. Trigger AI Response Flow
      state.isAiTyping = true;
      notify();

      try {
        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'ai_request',
          status: 'info',
          summary: `Disparando solicitud de inferencia al servicio de IA (${state.botConfig.model})`,
          details: { model: state.botConfig.model, creativity: state.botConfig.creativity },
        });

        const convMessages = state.messages.filter((m) => m.conversationId === conversationId);

        const response = await fetch('/api/ai/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: conv,
            messages: convMessages,
            config: state.botConfig,
            failureInjectors: state.failureInjectors,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
          throw new Error(errData.error || `Error en servicio de IA: HTTP ${response.status}`);
        }

        const aiResult = await response.json();

        state.isAiTyping = false;
        if (aiResult.handoffSuggested) {
          soundFx.playHandoff();
        } else {
          soundFx.playReceive();
        }

        // Create Bot Message
        const botDeliveryStatus = state.failureInjectors.channelSendFailure ? 'failed' : 'delivered';

        const botMsg: Message = {
          id: `msg-bot-${Date.now()}`,
          conversationId,
          channel: conv.channel,
          sender: 'bot',
          content: aiResult.replyText,
          timestamp: new Date().toISOString(),
          status: botDeliveryStatus,
          aiDebug: {
            model: aiResult.model,
            latencyMs: aiResult.latencyMs,
            tokensIn: aiResult.tokensIn,
            tokensOut: aiResult.tokensOut,
            temperature: aiResult.temperature,
            suggestedTemperature: aiResult.suggestedTemperature,
            handoffSuggested: aiResult.handoffSuggested,
            handoffReason: aiResult.handoffReason,
            systemPromptSent: aiResult.systemPromptSent,
            contextWindowSent: aiResult.contextWindowSent,
            extractedFields: aiResult.extractedFields,
            rawResponse: aiResult.rawResponse,
            timestamp: new Date().toISOString(),
          },
        };

        state.messages = [...state.messages, botMsg];
        state.selectedMessageId = botMsg.id;

        // Update Conversation status and lead temperature
        const newStatus: ThreadStatus = aiResult.handoffSuggested ? 'waiting' : (botDeliveryStatus === 'failed' ? 'failed' : 'bot');

        state.conversations = state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                status: newStatus,
                leadTemperature: aiResult.suggestedTemperature || c.leadTemperature,
                temperatureSource: 'ai',
                extractedFields: {
                  ...c.extractedFields,
                  ...(aiResult.extractedFields || {}),
                },
                lastMessageAt: botMsg.timestamp,
              }
            : c
        );

        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: aiResult.handoffSuggested ? 'handoff_triggered' : 'ai_reply',
          status: aiResult.handoffSuggested ? 'warning' : 'success',
          latencyMs: aiResult.latencyMs,
          summary: aiResult.handoffSuggested
            ? `Transferencia a humano sugerida: ${aiResult.handoffReason || 'Criterio de derivación'}`
            : `Respuesta de IA generada en ${aiResult.latencyMs}ms (${aiResult.tokensIn + aiResult.tokensOut} tokens)`,
          details: aiResult,
        });

        if (botDeliveryStatus === 'failed') {
          logSystemEvent({
            conversationId,
            channel: conv.channel,
            eventType: 'error',
            status: 'error',
            summary: 'Falla en entrega del mensaje al canal (simulada por inyector)',
            details: { messageId: botMsg.id },
          });
        }

        persist();
        notify();
      } catch (err: any) {
        state.isAiTyping = false;
        console.error('AI pipeline error:', err);

        // Fallback: Flag conversation for human review
        state.conversations = state.conversations.map((c) =>
          c.id === conversationId ? { ...c, status: 'waiting' } : c
        );

        logSystemEvent({
          conversationId,
          conversationName: conv.customerName,
          channel: conv.channel,
          eventType: 'error',
          status: 'error',
          summary: `Error en pipeline de IA: ${err.message}. Hilo transferido a espera humana.`,
          details: { error: err.message, stack: err.stack },
        });

        persist();
        notify();
      }
    },
    []
  );

  // Conversations visibility based on role:
  // - propietario: sees all conversations across the dealership
  // - gerente: sees all conversations across the dealership (all people's messages)
  // - asesor: sees only their assigned follow-ups (c.assignedTo === store.advisorProfile.id)
  const roleConversations = useMemo(() => {
    if (store.userRole === 'asesor') {
      return store.conversations.filter((c: any) => c.assignedTo === store.advisorProfile.id);
    }
    return store.conversations;
  }, [store.conversations, store.userRole, store.advisorProfile.id]);

  // Ensure selectedConversationId is valid within roleConversations
  const effectiveSelectedId = useMemo(() => {
    if (store.selectedConversationId === null || store.selectedConversationId === '') {
      return null;
    }
    const exists = roleConversations.some((c: any) => c.id === store.selectedConversationId);
    if (!exists) {
      return null;
    }
    return store.selectedConversationId;
  }, [roleConversations, store.selectedConversationId]);

  return {
    conversations: roleConversations,
    allConversations: store.conversations,
    messages: store.messages,
    events: store.events,
    botConfig: store.botConfig,
    failureInjectors: store.failureInjectors,
    selectedConversationId: effectiveSelectedId,
    selectedMessageId: store.selectedMessageId,
    channelFilter: store.channelFilter,
    searchQuery: store.searchQuery,
    activeTab: store.activeTab,
    isAiTyping: store.isAiTyping,
    isInspectorOpen: store.isInspectorOpen,
    advisorProfile: store.advisorProfile,
    userRole: store.userRole,
    isAuthenticated: store.isAuthenticated,
    authReady: store.authReady,
    authUnavailable: store.authUnavailable,
    tenantIds: store.tenantIds,
    activeTenantId: store.activeTenantId,
    crmDataError: store.crmDataError,

    completeAuthCheck: useCallback((operator: OperatorSession | null, unavailable = false) => {
      state.authReady = true;
      state.authUnavailable = unavailable;
      state.isAuthenticated = operator !== null;
      state.tenantIds = operator?.tenantIds ?? [];
      state.activeTenantId = state.tenantIds.length === 1 ? state.tenantIds[0] : null;
      state.conversations = [];
      state.messages = [];
      state.selectedConversationId = null;
      state.selectedMessageId = null;
      state.crmDataError = null;
      if (operator) {
        const role = roleFromSession(operator.roles);
        state.userRole = role;
        state.advisorProfile = {
          ...state.advisorProfile,
          id: operator.operatorId,
          name: operator.displayName,
          email: operator.email,
          role: roleLabel(role),
        };
        if (role !== 'propietario' && ['config', 'test-lab', 'events'].includes(state.activeTab)) {
          state.activeTab = 'inbox';
        }
      }
      notify();
    }, []),

    logout: useCallback(async () => {
      try {
        await logoutOperator();
      } finally {
        state.isAuthenticated = false;
        state.activeTenantId = null;
        state.authReady = true;
        state.authUnavailable = false;
        state.conversations = [];
        state.messages = [];
        state.selectedConversationId = null;
        state.selectedMessageId = null;
        notify();
      }
    }, []),

    setAdvisorStatus: useCallback((status: 'available' | 'in_meeting' | 'away') => {
      state.advisorProfile = { ...state.advisorProfile, status };
      persist();
      notify();
    }, []),
    updateAdvisorProfile: useCallback((updates: Partial<AdvisorProfile>) => {
      state.advisorProfile = { ...state.advisorProfile, ...updates };
      persist();
      notify();
    }, []),

    setIsInspectorOpen: useCallback((open: boolean) => {
      state.isInspectorOpen = open;
      notify();
    }, []),
    toggleInspector: useCallback(() => {
      state.isInspectorOpen = !state.isInspectorOpen;
      notify();
    }, []),

    selectConversation,
    setSelectedMessageId,
    setChannelFilter,
    setSearchQuery,
    setActiveTab,
    setTakeover,
    toggleTakeover,
    updateLeadTemperature,
    updateExtractedFields,
    reassignConversation,
    updateBotConfig,
    resetBotConfig,
    updateFailureInjectors,
    resetFailureInjectors,
    retryFailedMessage,
    fastForward24Hours,
    reopen24HourWindow,
    sendAgentMessage,
    sendCustomerMessage,
    fetchConversations: useCallback(async () => {
      const tenantId = state.activeTenantId;
      const generation = ++conversationRefreshGeneration;
      if (!state.isAuthenticated || !tenantId) {
        state.conversations = [];
        state.messages = [];
        state.selectedConversationId = null;
        state.crmDataError = state.tenantIds.length > 1 ? 'Selecciona una sucursal para cargar la bandeja.' : null;
        notify();
        return;
      }
      try {
        const page = await listConversations(tenantId);
        if (generation !== conversationRefreshGeneration || tenantId !== state.activeTenantId) return;
        const previousSelectedId = state.selectedConversationId;
        const selectedConversationId = page.items.some((item) => item.id === previousSelectedId)
          ? previousSelectedId
          : page.items[0]?.id ?? null;
        state.conversations = page.items.map(toUiConversation);
        if (selectedConversationId !== state.selectedConversationId) state.messages = [];
        state.selectedConversationId = selectedConversationId;
        state.crmDataError = null;
        notify();
        if (state.selectedConversationId) {
          const conversationId = state.selectedConversationId;
          const messages = await listConversationMessages(tenantId, conversationId);
          if (generation === conversationRefreshGeneration && tenantId === state.activeTenantId
            && state.selectedConversationId === conversationId) {
            const conversation = state.conversations.find((item) => item.id === conversationId);
            if (conversation) {
              // Keep timeline order chronological so scroll-to-bottom lands on the latest reply.
              state.messages = [...messages.items].reverse()
                .map((message) => toUiMessage(message, conversation.channel));
            }
            notify();
          }
        }
      } catch (error) {
        if (generation !== conversationRefreshGeneration || tenantId !== state.activeTenantId) return;
        state.crmDataError = error instanceof Error ? error.message : 'No se pudieron cargar las conversaciones';
        notify();
      }
    }, []),
    selectTenant: useCallback((tenantId: string) => {
      if (!state.tenantIds.includes(tenantId)) return;
      state.activeTenantId = tenantId;
      state.conversations = [];
      state.messages = [];
      state.selectedConversationId = null;
      state.crmDataError = null;
      notify();
    }, []),
    clearEvents: useCallback(() => {
      state.events = [];
      persist();
      notify();
    }, []),
    resetAllData,
  };
}
