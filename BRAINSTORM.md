# BRAINSTORM: Meta CRM Lab

## 1. What a Tester Needs to Judge AI Behavior
A tester evaluating an automated conversational agent in Meta customer channels needs rapid, unambiguous diagnostic visibility into internal reasoning, operational reliability, and domain-specific state transitions. The UI must expose:

1. **Input & Exact Context**:
   - The verbatim customer input (including multi-message bursts merged with timestamps).
   - The exact system instruction and serialized context window (history array) dispatched to the LLM.
2. **Output & Latency**:
   - The raw model response text before any sanitization or channel wrapper.
   - End-to-end execution latency in milliseconds (`latencyMs`), visual speed indicators, and token metrics (input tokens, output tokens, total cost estimate).
3. **Autonomous Handoff Decision**:
   - Binary flag (`handoffSuggested: boolean`) and the explicit reason provided by the model (e.g., user requested human agent, angry customer complaint, legal liability, out-of-scope question).
   - Visual cue showing when the thread shifts from `bot` to `waiting` for a human.
4. **Lead State & Semantic Extraction**:
   - Suggested lead temperature (`cold` | `warm` | `hot`) with rationale explaining state delta (e.g., `cold -> warm: Customer inquired about finance requirements for Mazda 3`).
   - Extracted entity fields: customer name, specific vehicle/product interest, stated budget, and purchase urgency level.
5. **Channel Constraints & Fallbacks**:
   - Meta 24-hour customer service window status (open vs expired).
   - Retry counts, error categories (rate limits, timeouts, 500s, malformed JSON), and fallback execution paths.

---

## 2. Mockup Deconstruction: What to Remove & Why
The initial mockup suffered from "sales CRM bloat" and UI state contradictions (e.g., active "Analytics" tab while displaying inbox, channel filter mismatching open thread). To build a focused testing lab, we remove:

- **Analytics Tab & Metrics Dashboard**: Distracts from conversational testing. Performance is measured per message and in the Test Lab test runner, not macro vanity graphs.
- **Leads & Accounts Screen**: This is not Salesforce; customer records are lightweight metadata attached directly to the thread.
- **Settings Maze**: Replaced by a single clean, high-signal "Bot Config" screen.
- **Deal Value & Arbitrary Score / 100**: Artificial qualification numbers create false precision. We use standard 3-tier lead temperature (`cold`, `warm`, `hot`) with an explicit "Set by AI / Set by you" provenance label.
- **Email, Tags, & Multiple Assigned Agents**: Meta messaging relies on phone numbers (WhatsApp) and social handles (IG/Messenger). Multiple agent assignments add unnecessary operational overhead for an AI testing tool.
- **Generic Activity Log**: Replaced by a high-fidelity, append-only **Event Log** tracking system actions, webhook payloads, LLM calls, handoffs, and delivery state changes.
- **SLA Badges**: Unnecessary for AI evaluation; replaced with real delivery ticks (`sending`, `sent`, `delivered`, `read`, `failed`).

---

## 3. User Flows: Success & Failure Paths

### Flow A: Customer Message In -> AI Auto-Reply
- **Success Path**: Customer sends message -> Webhook receives event -> Channel adapter normalizes message -> Deduplication check passes -> AI service generates response in <1.5s -> Delivery ticks update: `sent` -> `delivered` -> `read` -> Contact lead temperature and extracted entities update smoothly.
- **Failure Path (AI Error / 429 / Timeout)**: AI service throws timeout or rate limit -> Message displays failed status in thread -> Automated exponential backoff retry (up to 2 attempts) -> If still failing, conversation automatically flags as "Needs human" / status `waiting`, thread displays human-actionable banner, and an alert toast is queued. Never send raw JSON or error dumps to customer.

### Flow B: AI Unsure or Handoff Trigger
- **Success Path**: Customer expresses frustration ("pésimo servicio quiero hablar con una persona") or asks an off-policy question -> Model detects trigger -> Returns `handoffSuggested: true` with reason -> Status changes from `bot` to `waiting` -> Yellow warning badge appears -> Bot is silenced -> Human agent takes over via "Take over" button.
- **Failure Path**: Agent attempts to reply while bot is active or vice versa -> Handshake state lock ensures instantaneous takeover: when human takes over, pending AI debounces or in-flight requests are immediately aborted.

### Flow C: Human Takeover & Hand Back
- **Success Path**: Human agent clicks "Take over" -> Composer unlocks blue Human Agent mode -> Agent types reply and sends -> Message renders as blue agent bubble -> Human clicks "Hand back to bot" -> Status returns to `bot` with subtle toast confirmation.
- **Failure Path**: Human leaves thread in `human` state indefinitely; incoming customer messages queue without bot response until agent replies or toggles back.

### Flow D: Channel Delivery Failure
- **Success Path**: Adapter dispatches payload to Meta Graph API -> Returns 200 OK with `wamid` or message ID -> Status marked `sent` -> Delivery webhook marks `delivered`.
- **Failure Path**: Network drop or Meta API 500 -> Message bubble shows red `failed` badge and inline "Reintentar" (Retry) button -> Clicking Retry replays the adapter send without re-running the AI prompt.

### Flow E: Fast Multi-Message Burst (Debounce)
- **Success Path**: Customer sends 3 rapid messages within 3 seconds ("Hola", "Oye una pregunta", "¿Qué precio tiene el Mazda?") -> Debounce buffer captures all 3 -> Aggregates into a unified context prompt -> Dispatches single comprehensive reply addressing all points.
- **Failure Path**: Rapid messages arrive during active AI generation -> Ongoing generation completes; subsequent messages trigger an immediate follow-up response with cumulative context.

### Flow F: Unsupported Media Content
- **Success Path**: Customer sends audio note or image -> Adapter flags `unsupported_media` -> Bot provides polite standard reply ("He recibido tu imagen/audio. Un asesor humano la revisará en breve") -> Thread automatically switches to `waiting` for human review.
- **Failure Path**: Media payload corrupted or invalid URL -> Logged in Event Log as warning; graceful message sent to customer.

---

## 4. Meta Platform Rules & Edge Cases

1. **24-Hour Messaging Window**:
   - Meta limits free-form business messaging to 24 hours from the customer's last incoming message.
   - When the window closes: Composer disables regular text input, displays a warning banner ("Ventana de 24h cerrada por inactividad del cliente"), and switches WhatsApp to pre-approved Template Messages only.
   - Test Lab provides a "Fast-forward 24h" simulation button to test this edge case immediately.
2. **Channel Identifier Differences**:
   - WhatsApp: Formatted E.164 phone number (`+52 55 4192 8831`).
   - Instagram DM: Handle with `@` prefix (`@carlos_mendoza92`).
   - Messenger: Profile display name and PSID (`Mariana Silva`).
   - All channels map into a single normalized identity model with channel badge icons.
3. **Bot Identity Disclosure**:
   - If asked "¿Eres un bot?" or "¿Hablo con una persona?", the prompt policy strictly prohibits claiming human identity; it must clearly state it is an automated assistant.
4. **Duplicate Webhook Delivery**:
   - Meta guarantees at-least-once delivery, meaning duplicate webhook notifications are common.
   - Idempotency key / message ID deduplication cache drops duplicate payloads and logs a `deduplicated` event.

---

## 5. Open Questions & Decided Assumptions

1. **Live Gemini API vs Mock Offline Engine**:
   - *Decision*: Support hybrid operation. When `GEMINI_API_KEY` is present on the server, use `@google/genai` with `gemini-3.8-flash` to query the live model. When missing or when Test Lab failure injectors are enabled (e.g., Timeout, 500, Rate Limit), use a deterministic local mock engine. This guarantees the app is 100% testable out of the box while fully capable of live LLM testing.
2. **Persistence Strategy**:
   - *Decision*: Client-side persistence in `localStorage` with initial seed data containing 6 pre-loaded realistic Mexican car dealership conversations across WhatsApp, Instagram, and Messenger. Includes a "Reset Data" option in Bot Config to restore pristine seed state.
3. **Internal Notes Visibility**:
   - *Decision*: Internal notes are styled with yellow tinted containers, lock icon, and explicit badge ("Nota interna - no enviada al cliente"). They are excluded from the customer conversation context passed to the external adapter, but can optionally be viewed by agents.
4. **Lead Temperature Hierarchy**:
   - *Decision*: Three distinct states: `cold` (blue/slate dot), `warm` (amber dot), `hot` (rose/red dot). Provable tracking with `temperatureSource: 'ai' | 'human'`.
