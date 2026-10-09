import { useEffect } from 'react';
import { useCrmStore } from '../../store/useCrmStore';
import { sendWebPushNotification } from './pwa';

export interface SseMessageCreatedData {
  providerMessageId: string;
  channel: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM';
  participantId: string;
  text: string;
  receivedAt: string;
}

export interface SseRealtimeEvent {
  id: string;
  tenantId: string;
  aggregateId: string | null;
  type: 'message.created';
  occurredAt: string;
  data: SseMessageCreatedData;
}

export function useSseEvents() {
  const store = useCrmStore();

  useEffect(() => {
    const tenantId = import.meta.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000001';
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://ford.emme.business';
    const cleanBaseUrl = rawBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

    const streamUrl = `${cleanBaseUrl}/api/v1/operator/events/stream?tenantId=${encodeURIComponent(tenantId)}`;

    let events: EventSource | null = null;

    try {
      events = new EventSource(streamUrl, {
        withCredentials: true,
      });

      events.addEventListener('connected', (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[SSE] Connected to Ford AI Gateway Operator Stream:', payload);
        } catch (e) {
          console.log('[SSE] Connected event received');
        }
      });

      events.addEventListener('message.created', (event: MessageEvent) => {
        try {
          const realtimeEvent: SseRealtimeEvent = JSON.parse(event.data);
          console.log('[SSE] New inbound message received:', realtimeEvent.data?.text);
          if (realtimeEvent.data?.text) {
            sendWebPushNotification(
              `Nuevo mensaje • ${realtimeEvent.data.channel || 'WhatsApp'}`,
              realtimeEvent.data.text,
              { tag: `sse-${realtimeEvent.id}` }
            );
          }
        } catch (e) {
          console.error('[SSE] Failed to parse message.created event:', e);
        }

        // AggregateId is currently null in backend spec -> Refetch authoritative conversation list
        if (store.fetchConversations) {
          store.fetchConversations();
        }
      });

      events.onerror = () => {
        console.warn('[SSE] EventSource connection retry in progress...');
      };
    } catch (err) {
      console.warn('[SSE] EventSource initialization deferred:', err);
    }

    return () => {
      if (events) {
        events.close();
      }
    };
  }, [store]);
}
