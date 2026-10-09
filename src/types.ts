export type Channel = 'whatsapp' | 'instagram' | 'messenger';
export type LeadTemperature = 'cold' | 'warm' | 'hot';
export type ThreadStatus = 'bot' | 'human' | 'waiting' | 'failed';
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageSender = 'customer' | 'bot' | 'human' | 'system';

export interface ExtractedLeadFields {
  name?: string;
  interest?: string;
  budget?: string;
  urgency?: 'baja' | 'media' | 'alta' | string;
  tradeInCar?: string;
  creditPreApproved?: boolean;
  testDriveScheduled?: string;
  monthlyPaymentEst?: string;
}

export interface AdvisorProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: 'available' | 'in_meeting' | 'away';
  avatarUrl?: string;
  assignedCount: number;
}

export interface AiDebugData {
  model: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  temperature: number; // creativity parameter
  suggestedTemperature: LeadTemperature;
  handoffSuggested: boolean;
  handoffReason?: string;
  systemPromptSent: string;
  contextWindowSent: Array<{ role: 'user' | 'model' | 'system'; content: string }>;
  extractedFields: ExtractedLeadFields;
  rawResponse: any;
  error?: string;
  timestamp?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  channel: Channel;
  sender: MessageSender;
  content: string;
  timestamp: string; // ISO string
  status: DeliveryStatus;
  isInternalNote?: boolean;
  unsupportedMedia?: boolean;
  mediaType?: 'image' | 'audio' | 'document';
  aiDebug?: AiDebugData;
}

export interface Conversation {
  id: string;
  version?: number;
  channel: Channel;
  customerName: string;
  customerHandle: string; // Phone for WA, @handle for IG, Name for Messenger
  avatarUrl: string;
  status: ThreadStatus;
  leadTemperature: LeadTemperature;
  temperatureSource: 'ai' | 'human';
  extractedFields: ExtractedLeadFields;
  firstSeen: string;
  lastMessageAt: string;
  lastCustomerMessageAt: string;
  unreadCount: number;
  isWindowOpen: boolean; // Meta 24-hour customer service window
  assignedTo?: string;
}

export interface BotConfig {
  systemPrompt: string;
  model: string;
  creativity: number; // 0.0 - 1.0 (labeled Creativity, not temperature)
  mode: 'auto_reply' | 'suggest_only' | 'off';
  handoffKeywords: string[];
  handoffOnUnsure: boolean;
  responseDelayMs: number;
}

export type SystemEventType =
  | 'incoming_message'
  | 'deduplicated'
  | 'ai_request'
  | 'ai_reply'
  | 'handoff_triggered'
  | 'human_takeover'
  | 'message_sent'
  | 'delivery_update'
  | 'retry_triggered'
  | 'window_expired'
  | 'error';

export interface SystemEvent {
  id: string;
  timestamp: string;
  conversationId?: string;
  conversationName?: string;
  channel?: Channel;
  eventType: SystemEventType;
  status: 'success' | 'warning' | 'error' | 'info';
  latencyMs?: number;
  summary: string;
  details: Record<string, any>;
}

export interface FailureInjectors {
  aiTimeout: boolean;
  aiError500: boolean;
  rateLimit429: boolean;
  malformedOutput: boolean;
  channelSendFailure: boolean;
  duplicateWebhook: boolean;
  outOfOrder: boolean;
  offline: boolean;
}

export interface ScriptedScenario {
  id: string;
  title: string;
  description: string;
  channel: Channel;
  customerName: string;
  customerHandle: string;
  messages: string[];
  isMedia?: boolean;
  mediaType?: 'image' | 'audio';
  expectedHandoff: boolean;
  expectedTemperature?: LeadTemperature;
  expectedMaxLatencyMs: number;
}

export interface ScenarioTestResult {
  scenarioId: string;
  title: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  latencyMs: number;
  handoffTriggered: boolean;
  leadTemperature: LeadTemperature;
  replyText?: string;
  reasons: string[];
}
