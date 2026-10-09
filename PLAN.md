# PLAN: Meta CRM Lab

## 1. Screen List
1. **Inbox (`/inbox`)**:
   - Left: Segmented channel filter (`All`, `WhatsApp`, `Instagram`, `Messenger`), Search bar, Thread List with avatar badges, lead temp dots, status chips, unread count badge.
   - Center: Conversation pane with contact header, Bot/Human toggle (`Take over` / `Hand back`), message history (Customer, Bot [purple], Agent [blue], Internal note [yellow]), delivery status ticks, 24-hour window banner, typing indicator, composer with "Message" and "Internal note" tabs.
   - Right: Contact details (slim block with editable lead temperature and AI-extracted fields) + AI Inspector (selected message telemetry, model, latency, tokens, system prompt, context window, raw JSON, handoff reason, copy debug JSON).
2. **Bot Config (`/config`)**:
   - System prompt editor with variables preview.
   - Model selector (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview`).
   - Creativity slider (0.0 to 1.0, labeled "Creativity" to avoid lead temperature confusion).
   - Operation Mode: `Auto-reply` | `Suggest-only` | `Off`.
   - Handoff trigger configuration (keywords list + "AI is unsure" toggle).
   - Artificial response delay slider (0ms to 3000ms) for realistic customer feel.
   - "Reset to default" action with confirmation.
3. **Test Lab (`/test-lab`)**:
   - Customer Simulator: Channel selector, persona picker, text input with "Send as customer" dispatching into the message pipeline.
   - 8 Scripted Scenarios (Mexican auto dealership domain):
     1. *Pregunta de precio general* (mazda 3)
     2. *Compra hoy / con enganche* (interés alto)
     3. *Queja enojada* (reclamación de factura/garantía -> handoff inmediato)
     4. *Pregunta fuera de lugar* (receta de tacos al pastor)
     5. *Respuesta ambigua de una sola palabra* ("ok", "va")
     6. *Spam / Enlace sospechoso* (publicidad externa)
     7. *Envío de imagen / audio no soportado* (adjunto multimedia)
     8. *Ráfaga de mensajes rápidos* (3 mensajes consecutivos)
     9. *Cliente inactivo (Avance 24h)* -> Expira la ventana de atención
   - Failure Injector Toggles:
     - AI Timeout (simulated >10s)
     - AI Error / 500
     - Rate Limit (429)
     - Malformed AI Output (invalid JSON schema)
     - Channel Send Failure (network drop)
     - Duplicate Webhook (same message ID)
     - Out-of-Order Message
     - Offline Mode
   - "Run All Scenarios" Batch Runner: executes the scripted matrix, tests latency, handoff triggers, and lead temp transitions, and renders a clean pass/fail diagnostic table.
4. **Event Log (`/events`)**:
   - Real-time tabular event stream: Timestamp, Conversation, Event Type (`incoming_message`, `ai_generation`, `handoff_triggered`, `message_sent`, `delivery_update`, `error`), Status, Latency.
   - Filter by event type and status.
   - Expandable row showing formatted payload JSON.
   - "Export JSON" button.

---

## 2. Component Tree
```
App
├── Toaster (Sonner-style lightweight stacked notification system)
├── MainLayout
│   ├── NavigationSidebar
│   │   ├── BrandHeader ("Meta CRM Lab")
│   │   ├── NavItem (Inbox, Bot Config, Test Lab, Event Log)
│   │   └── SystemStatusBadge (Online/Offline indicator)
│   └── MainContentArea
│       ├── InboxView
│       │   ├── ThreadListPane
│       │   │   ├── ChannelFilterSegmented
│       │   │   ├── SearchInput (Cmd+K)
│       │   │   └── ThreadList (Virtual or mapped items with LeadTempDot & StatusChip)
│       │   ├── ConversationPane
│       │   │   ├── ConversationHeader (Avatar, Channel badge, Status, TakeoverButton)
│       │   │   ├── WindowStatusBanner (24-hour Meta service window alert)
│       │   │   ├── MessageScrollArea
│       │   │   │   ├── MessageBubble (Customer, Bot, HumanAgent, InternalNote)
│       │   │   │   │   └── DeliveryTicks (sending, sent, delivered, read, failed + Retry)
│       │   │   │   └── TypingIndicator (staggered animated dots)
│       │   │   └── MessageComposer
│       │   │       ├── ModeTabs ("Mensaje" | "Nota interna")
│       │   │       ├── TemplatePicker (when 24h window is closed)
│       │   │       └── Textarea & SendButton
│       │   └── InspectorPane
│       │       ├── ContactCard (slim identity, lead temp segmented control, extracted fields editor)
│       │       └── AiInspectorCard (telemetry pills, tokens, latency, prompt viewer, copy JSON)
│       ├── BotConfigView
│       │   ├── SystemPromptSection
│       │   ├── ModelAndParametersSection
│       │   ├── HandoffRulesSection
│       │   └── ActionsBar (Save, Reset)
│       ├── TestLabView
│       │   ├── CustomerSimulatorPane
│       │   ├── ScriptedScenariosGrid
│       │   ├── FailureInjectorsPanel
│       │   └── BatchTestRunnerModal / ResultsPane
│       └── EventLogView
│           ├── EventFilterBar
│           ├── EventTable
│           └── ExpandableJsonViewer
```

---

## 3. TypeScript Data Model (`/src/types.ts`)
```ts
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
}

export interface Message {
  id: string;
  conversationId: string;
  channel: Channel;
  sender: MessageSender;
  content: string;
  timestamp: string; // ISO 8601
  status: DeliveryStatus;
  isInternalNote?: boolean;
  unsupportedMedia?: boolean;
  aiDebug?: AiDebugData;
}

export interface Conversation {
  id: string;
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
  isWindowOpen: boolean; // 24-hour Meta messaging window
}

export interface BotConfig {
  systemPrompt: string;
  model: string;
  creativity: number; // 0.0 - 1.0 (do not name temperature to avoid confusion)
  mode: 'auto_reply' | 'suggest_only' | 'off';
  handoffKeywords: string[];
  handoffOnUnsure: boolean;
  responseDelayMs: number;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  conversationId?: string;
  conversationName?: string;
  channel?: Channel;
  eventType: 'webhook_received' | 'deduplicated' | 'ai_request' | 'ai_reply' | 'handoff_triggered' | 'human_takeover' | 'message_sent' | 'delivery_update' | 'error';
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
```

---

## 4. Conversation State Machine
```
            +-------------------+
            |  Customer Message |
            +---------+---------+
                      |
                      v
             [ Deduplication Check ]
                      | Passed
                      v
             [ Check Bot Mode & Status ]
               /             \
    Status == 'human'    Status in ['bot', 'waiting']
             /                 \
    (Queued for human)      (Check Window & In-flight)
                                 |
                          [ AI Service Invocation ]
                                 |
                      +----------+----------+
                      |                     |
                   Success                Failure (Timeout/429/500)
                      |                     |
           [ Check Handoff Rules ]       [ Retry with Backoff x2 ]
             /               \              |            |
   handoffSuggested==false    true        Success     Failed 2x
           /                   \            |            |
     Status: 'bot'        Status: 'waiting' |      Status: 'waiting'
     Bubble: purple       Banner: Needs human     Bubble: Failed send
     Send to channel      Bot silenced             Banner: System fallback
```

---

## 5. AI Service & Channel Adapter Interfaces

### Channel Adapter (`/src/services/channelAdapter.ts`)
```ts
export interface NormalizedEvent {
  eventId: string;
  channel: Channel;
  senderId: string;
  senderName: string;
  senderHandle: string;
  content: string;
  timestamp: string;
  isUnsupportedMedia?: boolean;
}

export interface DeliveryResult {
  messageId: string;
  status: DeliveryStatus;
  sentAt: string;
  error?: string;
}

export interface ChannelAdapter {
  receive(event: NormalizedEvent): Promise<Message>;
  send(message: Message): Promise<DeliveryResult>;
}
```

### AI Service (`/src/services/aiService.ts`)
```ts
export interface AiRequest {
  conversation: Conversation;
  messages: Message[];
  config: BotConfig;
  failureInjectors: FailureInjectors;
}

export interface AiService {
  respond(request: AiRequest): Promise<AiDebugData & { replyText: string }>;
}
```

---

## 6. Motion Specification (Emil Kowalski School)
- **Spring & Timing**:
  - UI entry: `duration: 0.18s, ease: [0.23, 1, 0.32, 1]`.
  - Message bubble enter: slide up 8px (`y: 8 -> 0`) + opacity (`0 -> 1`), duration 200ms.
  - Buttons: `:active` `scale: 0.97`, transition 80ms.
  - Scale transitions: never scale from 0; enter from `scale(0.96)`.
- **Typing Indicator**:
  - 3 dots with staggered 100ms bounce (`y: [0, -3, 0]`, loop).
- **Reduced Motion**:
  - Queries `prefers-reduced-motion`: disable translation offsets, retain opacity fades.

---

## 7. File Structure
```
/
├── server.ts                    # Express backend proxying /api/ai/respond with @google/genai
├── src/
│   ├── main.tsx                 # App mount
│   ├── App.tsx                  # App root & tab switching
│   ├── types.ts                 # Full TypeScript contracts
│   ├── store/
│   │   ├── useCrmStore.ts       # Central store with localStorage persistence & event logger
│   │   └── seedData.ts          # 6 realistic Mexican dealership threads
│   ├── services/
│   │   ├── channelAdapter.ts    # MockChannelAdapter + MetaGraphAdapter stub
│   │   ├── aiService.ts         # Client AI dispatcher calling /api/ai/respond with mock fallback
│   │   └── scenarioRunner.ts    # Batch test runner for Test Lab scenarios
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx      # Clean navigation + channel filter
│   │   │   └── Toast.tsx        # Sonner-style toast notifications
│   │   ├── Inbox/
│   │   │   ├── ThreadList.tsx   # Thread list item with channel badge & temp dot
│   │   │   ├── Conversation.tsx # Message timeline, header, 24h banner, composer
│   │   │   ├── MessageBubble.tsx# Tailored bubbles with ticks & retry button
│   │   │   ├── ContactPanel.tsx # Slim contact details & editable lead temperature
│   │   │   └── AiInspector.tsx  # Telemetry, tokens, latency, prompt inspector
│   │   ├── BotConfig/
│   │   │   └── BotConfigView.tsx# Clean prompt & parameters editor
│   │   ├── TestLab/
│   │   │   ├── CustomerSimulator.tsx
│   │   │   ├── ScenarioCards.tsx
│   │   │   ├── FailureInjectors.tsx
│   │   │   └── BatchResultsTable.tsx
│   │   └── EventLog/
│   │       └── EventLogTable.tsx# Chronological expandable event log with JSON viewer
```

---

## 8. Build Order
1. Setup `server.ts` with `/api/ai/respond` using `@google/genai` and fallback simulation.
2. Update `package.json` scripts to standard full-stack build (`tsx server.ts`).
3. Update `metadata.json` and `index.html` with proper app title and description.
4. Implement `types.ts`, `seedData.ts`, and `useCrmStore.ts` with full persistence.
5. Implement `channelAdapter.ts` and `aiService.ts`.
6. Build Inbox components (ThreadList, Conversation, MessageBubble, ContactPanel, AiInspector).
7. Build BotConfig screen.
8. Build Test Lab (Simulator, Scenarios, Failure Injectors, Batch Runner).
9. Build Event Log screen with export.
10. Add keyboard navigation (Cmd+K, J/K, Enter).
11. Polish pass and test verification via `compile_applet`.
12. Write `README.md`.
