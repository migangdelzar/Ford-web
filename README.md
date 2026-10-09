# Meta CRM Lab — AI Service Monitor & Test Lab

> Minimal omnichannel inbox (WhatsApp, Instagram DM, Messenger) engineered specifically to **monitor, test, inspect, and benchmark how an AI service handles customer conversations**.

---

## 1. Overview & Architecture

Meta CRM Lab provides a restrained, high-density testbed for production conversational AI. It replaces sprawling sales CRMs with a focused workspace consisting of four dedicated views:

1. **Inbox Omnicanal**: 3-column operational cockpit (thread list with channel badges & lead temperature, active conversation timeline with delivery status & 24h window enforcement, and right-hand contact + AI Inspector).
2. **Bot Config**: Real-time control of system prompts, Gemini model selection (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview`), creativity slider, operating mode (`Auto-reply`, `Suggest-only`, `Off`), and handoff triggers.
3. **Test Lab**: Customer simulation ingress, Mexican automotive dealership scripted scenarios (price inquiries, ready-to-buy down payments, angry invoice complaints, off-topic food questions, image attachments, burst messaging), Chaos Engineering failure injectors (timeouts, 500s, 429 rate limits, malformed streams, network offline), and batch validation matrix ("Run all scenarios").
4. **Event Log**: Append-only audit trail capturing every webhook payload, constructed prompt, Gemini call, token count, tool execution, delivery tick, handoff decision, and error event, with one-click JSON export.

---

## 2. Meta Platform Invariants & Compliance

The system strictly adheres to Meta Graph API business messaging requirements:

- **24-Hour Customer Service Window**: Whenever a customer messages on WhatsApp, Instagram, or Messenger, a 24-hour rolling timer begins. After 24 hours of customer inactivity, free-form AI responses are blocked. The agent composer automatically switches into **WhatsApp Business HSM Template Message mode** (e.g. `seguimiento_cotizacion_v2`, `confirmacion_cita_v1`). A fast-forward simulator button (+24h) allows instant testing of this behavior.
- **Channel Identity Discrepancies**: WhatsApp uses validated E.164 phone numbers (`+52 55 1029 3847`), Instagram DM uses Instagram user handles (`@valeria_soto`), and Messenger uses Page-Scoped User IDs (PSID) with user profile names.
- **Transparency Mandate**: The bot is identified with a distinct purple badge and never claims to be human. If asked "¿Eres un robot?", it identifies as the Autos Premier México virtual assistant.
- **Human Takeover State Machine**: Clicking "Tomar control humano" switches the thread status to `human`, silencing the AI. Clicking "Devolver al Bot" reactivates autonomous AI generation.

---

## 3. Swapping `MockChannelAdapter` for the Real Meta Graph API

The application ships with `MockChannelAdapter` for instantaneous local testing and offline simulation. It is designed around the `ChannelAdapter` contract located in `src/services/channelAdapter.ts`.

### Step 1: Meta Developer App Configuration
1. Create an app in the [Meta for Developers Portal](https://developers.facebook.com/) with the **Business** use-case.
2. Add the **WhatsApp Business Platform**, **Instagram Graph API**, and **Messenger** products.
3. Generate a Permanent System User Token with permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_manage_messages`
4. Note your **Phone Number ID**, **WhatsApp Business Account ID (WABA)**, and **Facebook Page ID**.

### Step 2: Environment Variables
Add the following to your `.env` file (see `.env.example`):
```env
META_GRAPH_API_VERSION=v20.0
META_APP_SECRET=your_meta_app_secret_here
META_WEBHOOK_VERIFY_TOKEN=your_secure_verify_token
WHATSAPP_PHONE_NUMBER_ID=109283746501928
WHATSAPP_ACCESS_TOKEN=EAAB...
FACEBOOK_PAGE_ACCESS_TOKEN=EAAB...
GEMINI_API_KEY=your_gemini_api_key
```

### Step 3: Webhook Verification Endpoint
Meta requires a `GET /webhook` challenge handshake:
```ts
// In server.ts:
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Verification successful');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
```

### Step 4: Webhook Signature Verification & Ingress
Verify every incoming `POST /webhook` with HMAC SHA-256 using `META_APP_SECRET`:
```ts
import crypto from 'crypto';

export function verifyMetaSignature(req: express.Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET!);
  const digest = 'sha256=' + hmac.update((req as any).rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### Step 5: Webhook Payload Normalization
Transform raw Meta payloads into `NormalizedWebhookEvent`:
```ts
// WhatsApp Ingress:
const entry = req.body.entry?.[0];
const change = entry?.changes?.[0]?.value;
const messageObj = change?.messages?.[0];

if (messageObj) {
  const event: NormalizedWebhookEvent = {
    eventId: messageObj.id,
    channel: 'whatsapp',
    senderId: messageObj.from,
    senderName: change.contacts?.[0]?.profile?.name || messageObj.from,
    senderHandle: `+${messageObj.from}`,
    content: messageObj.text?.body || (messageObj.type === 'image' ? '[Foto adjunta]' : ''),
    timestamp: new Date(parseInt(messageObj.timestamp, 10) * 1000).toISOString(),
    isUnsupportedMedia: messageObj.type !== 'text',
    mediaType: messageObj.type,
    rawPayload: messageObj,
  };
  await channelAdapter.receive(event);
}
```

### Step 6: Dispatching Outbound Messages via Meta Graph API
Replace the mock send with Graph API HTTP calls:
```ts
// WhatsApp Cloud API outbound:
async send(message: Message): Promise<DeliveryResult> {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: message.conversationId.replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: false, body: message.content }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Meta API delivery failed');
  }

  return {
    messageId: message.id,
    channel: 'whatsapp',
    status: 'delivered',
    sentAt: new Date().toISOString(),
    wamid: data.messages?.[0]?.id,
  };
}
```

---

## 4. Keyboard Navigation & Accessibility

- **`J` / `ArrowDown`**: Select next conversation down the thread list.
- **`K` / `ArrowUp`**: Select previous conversation up the thread list.
- **`⌘K` / `Ctrl+K`**: Instant focus on thread search input.
- **`Enter`**: Send message or note in composer.
- **`Shift+Enter`**: Insert newline in composer without dispatching.

---

## 5. Failure Injectors & Chaos Testing

The Test Lab incorporates toggles to verify frontend graceful degradation:
- **AI Timeout**: Simulates long cold starts or upstream model lag (>10s) with auto-fallback to human takeover.
- **AI Error (500)**: Simulates gateway internal server errors.
- **Rate Limit (429)**: Simulates token bucket exhaustion.
- **Malformed AI Output**: Simulates token stream degradation.
- **Channel Send Failure**: Simulates Meta outbound webhook errors with inline retry button.
- **Duplicate Webhook**: Verifies deduplication cache prevents double-processing of identical message IDs.
- **Offline**: Simulates loss of network connectivity.

---

## 6. Development & Build Scripts

```bash
# Install dependencies
npm install

# Start Express + Vite development server (Port 3000)
npm run dev

# Lint code & verify TypeScript types
npm run lint

# Production build (bundles client SPA + CommonJS backend server)
npm run build

# Start production server
npm start
```
