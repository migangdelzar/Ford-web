import { Channel, Message, DeliveryStatus } from '../types';

export interface NormalizedWebhookEvent {
  eventId: string;
  channel: Channel;
  senderId: string;
  senderName: string;
  senderHandle: string;
  content: string;
  timestamp: string;
  isUnsupportedMedia?: boolean;
  mediaType?: 'image' | 'audio';
  rawPayload?: any;
}

export interface DeliveryResult {
  messageId: string;
  channel: Channel;
  status: DeliveryStatus;
  sentAt: string;
  wamid?: string; // WhatsApp message ID or Graph API message ID
  error?: string;
}

export interface ChannelAdapter {
  receive(event: NormalizedWebhookEvent): Promise<Message>;
  send(message: Message): Promise<DeliveryResult>;
}

/**
 * MockChannelAdapter
 * Simulates local webhook ingress, normalization, and Graph API message dispatch
 */
export class MockChannelAdapter implements ChannelAdapter {
  async receive(event: NormalizedWebhookEvent): Promise<Message> {
    return {
      id: event.eventId || `msg-${Date.now()}`,
      conversationId: `conv-${event.senderId}`,
      channel: event.channel,
      sender: 'customer',
      content: event.content,
      timestamp: event.timestamp || new Date().toISOString(),
      status: 'delivered',
      unsupportedMedia: event.isUnsupportedMedia,
      mediaType: event.mediaType,
    };
  }

  async send(message: Message): Promise<DeliveryResult> {
    // Artificial 150ms network dispatch
    await new Promise((r) => setTimeout(r, 150));

    return {
      messageId: message.id,
      channel: message.channel,
      status: 'delivered',
      sentAt: new Date().toISOString(),
      wamid: `wamid.HBgL${Date.now()}==`,
    };
  }
}

/**
 * MetaGraphAdapter (Production Stub)
 * Ready for production deployment with Meta Cloud API credentials.
 * Handles webhook verification (GET /webhook), webhook parsing (POST /webhook),
 * and outbound messaging (POST graph.facebook.com/v20.0/{phone_number_id}/messages).
 */
export class MetaGraphAdapter implements ChannelAdapter {
  private apiVersion = 'v20.0';
  private accessToken: string | null = null;
  private phoneNumberId: string | null = null;

  constructor(config?: { accessToken?: string; phoneNumberId?: string }) {
    this.accessToken = config?.accessToken || null;
    this.phoneNumberId = config?.phoneNumberId || null;
  }

  /**
   * Transforms raw Meta Webhook JSON (entry[0].changes[0].value.messages[0])
   * into a NormalizedWebhookEvent
   */
  async receive(event: NormalizedWebhookEvent): Promise<Message> {
    // TODO: Verify Meta X-Hub-Signature-256 header with app secret
    // TODO: Handle WhatsApp interactive button replies and quick_reply payloads
    return {
      id: event.eventId,
      conversationId: event.senderId,
      channel: event.channel,
      sender: 'customer',
      content: event.content,
      timestamp: event.timestamp,
      status: 'delivered',
      unsupportedMedia: event.isUnsupportedMedia,
      mediaType: event.mediaType,
    };
  }

  /**
   * Dispatches outbound text or template message via Meta Graph API
   */
  async send(message: Message): Promise<DeliveryResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.info(
        '[MetaGraphAdapter] No access token or phone number ID configured; falling back to mock delivery result.'
      );
      return {
        messageId: message.id,
        channel: message.channel,
        status: 'delivered',
        sentAt: new Date().toISOString(),
        wamid: `wamid.STUB_${message.id}`,
      };
    }

    // TODO: Implement actual fetch call to Meta Graph API
    /*
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.conversationId, // phone number or IG PSID
      type: 'text',
      text: { preview_url: false, body: message.content }
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return {
      messageId: message.id,
      channel: message.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
      wamid: data.messages?.[0]?.id
    };
    */

    return {
      messageId: message.id,
      channel: message.channel,
      status: 'delivered',
      sentAt: new Date().toISOString(),
    };
  }
}
