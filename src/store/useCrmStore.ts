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

const STORAGE_KEYS = {
  CONVERSATIONS: 'meta_crm_conversations_v1',
  MESSAGES: 'meta_crm_messages_v1',
  CONFIG: 'meta_crm_config_v1',
  INJECTORS: 'meta_crm_injectors_v1',
  EVENTS: 'meta_crm_events_v1',
  ADVISOR: 'meta_crm_advisor_v1',
  USER_ROLE: 'meta_crm_user_role_v1',
  AUTH: 'meta_crm_auth_v1',
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

  const savedUserRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  if (savedUserRole) state.userRole = savedUserRole as 'propietario' | 'gerente' | 'asesor';

  const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (savedAuth === 'true') state.isAuthenticated = true;
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
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, state.userRole);
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

  const setTakeover = useCallback((conversationId: string, targetStatus: 'bot' | 'human') => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    if (conv.status === targetStatus) return;

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
    state.conversations = state.conversations.map((c) =>
      c.id === conversationId ? { ...c, status: newStatus } : c
    );

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
  }, []);

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
  const sendAgentMessage = useCallback((conversationId: string, content: string, isInternalNote = false) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv || !content.trim()) return;

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

    login: useCallback((role: 'propietario' | 'gerente' | 'asesor', customEmail?: string, customName?: string) => {
      state.isAuthenticated = true;
      state.userRole = role;

      let roleLabel = 'Propietario';
      let name = 'Miky Delzar';
      let email = `miky.delzar@${BRAND_CONFIG.emailDomain}`;

      if (role === 'gerente') {
        roleLabel = 'Gerente / Supervisor';
        name = 'Lic. Sofía Alarcón';
        email = `sofia.gerente@${BRAND_CONFIG.emailDomain}`;
      } else if (role === 'asesor') {
        roleLabel = 'Asesor de Ventas';
        name = 'Miky Delzar';
        email = `miky.delzar@${BRAND_CONFIG.emailDomain}`;
      }

      state.advisorProfile = {
        ...state.advisorProfile,
        role: roleLabel,
        name: customName || name,
        email: customEmail || email,
      };

      if (role === 'gerente' || role === 'asesor') {
        if (state.activeTab !== 'inbox' && state.activeTab !== 'metrics') {
          state.activeTab = 'inbox';
        }
      }

      if (role === 'asesor') {
        const advisorConvs = state.conversations.filter(
          (c: any) => c.assignedTo === state.advisorProfile.id
        );
        if (advisorConvs.length > 0 && !advisorConvs.some((c: any) => c.id === state.selectedConversationId)) {
          state.selectedConversationId = advisorConvs[0].id;
        }
      }

      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
        localStorage.setItem(STORAGE_KEYS.ADVISOR, JSON.stringify(state.advisorProfile));
      } catch (e) {
        console.warn('Failed to save auth state', e);
      }
      persist();
      notify();
    }, []),

    logout: useCallback(() => {
      state.isAuthenticated = false;
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
      } catch (e) {
        console.warn('Failed to clear auth state', e);
      }
      notify();
    }, []),

    setUserRole: useCallback((role: 'propietario' | 'gerente' | 'asesor') => {
      state.userRole = role;
      let roleLabel = 'Propietario';
      let name = 'Miky Delzar';
      let email = `miky.delzar@${BRAND_CONFIG.emailDomain}`;
      
      if (role === 'gerente') {
        roleLabel = 'Gerente / Supervisor';
        name = 'Lic. Sofía Alarcón';
        email = `sofia.gerente@${BRAND_CONFIG.emailDomain}`;
      } else if (role === 'asesor') {
        roleLabel = 'Asesor de Ventas';
        name = 'Miky Delzar';
        email = `miky.delzar@${BRAND_CONFIG.emailDomain}`;
      }

      state.advisorProfile = {
        ...state.advisorProfile,
        role: roleLabel,
        name,
        email,
      };

      // Restrict activeTab based on permissions:
      // Gerente and Asesor have access to inbox and metrics
      if (role === 'gerente' || role === 'asesor') {
        if (state.activeTab !== 'inbox' && state.activeTab !== 'metrics') {
          state.activeTab = 'inbox';
        }
      }

      // If switching to asesor, ensure selected conversation belongs to asesor
      if (role === 'asesor') {
        const advisorConvs = state.conversations.filter(
          (c: any) => c.assignedTo === state.advisorProfile.id
        );
        if (advisorConvs.length > 0 && !advisorConvs.some((c: any) => c.id === state.selectedConversationId)) {
          state.selectedConversationId = advisorConvs[0].id;
        }
      }

      persist();
      notify();
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
      try {
        const res = await fetch('/api/v1/conversations');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items)) {
            // Update conversations from backend API
            notify();
          }
        }
      } catch (e) {
        console.warn('Failed to fetch conversations via API:', e);
      }
    }, []),
    clearEvents: useCallback(() => {
      state.events = [];
      persist();
      notify();
    }, []),
    resetAllData,
  };
}
