import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createFordServiceProxy } from "./src/server/fordServiceProxy";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

const fordServiceUrl = process.env.FORD_SERVICE_URL?.trim() || 'http://127.0.0.1:8080';
const fordServiceProxy = createFordServiceProxy(fordServiceUrl);
app.use(['/api/auth', '/api/v1', '/webauthn', '/login/ott', '/login/webauthn'], fordServiceProxy);
app.post('/login', fordServiceProxy);

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check (Legacy & Canonical v1)
app.get(["/api/health", "/api/v1/health"], (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Spring Boot Actuator Endpoints (Discovery, Health, Metrics, Info)
// Supports both /actuator/* and /api/v1/actuator/* for seamless frontend consumption
let simulatedActuatorDegradation: Record<string, "UP" | "DEGRADED" | "DOWN"> = {
  whatsapp: "UP",
  instagram: "UP",
  messenger: "UP",
};

app.get(["/actuator", "/api/v1/actuator"], (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/actuator`;
  res.json({
    _links: {
      self: { href: baseUrl, templated: false },
      health: { href: `${baseUrl}/health`, templated: false },
      "health-path": { href: `${baseUrl}/health/{*path}`, templated: true },
      info: { href: `${baseUrl}/info`, templated: false },
      metrics: { href: `${baseUrl}/metrics`, templated: false },
      "metrics-requiredMetricName": { href: `${baseUrl}/metrics/{requiredMetricName}`, templated: true },
    },
  });
});

app.get(["/actuator/info", "/api/v1/actuator/info"], (_req, res) => {
  res.json({
    app: {
      name: "ford-meta-crm-gateway",
      description: "Ford Omnichannel Meta Graph API & AI Concierge Spring Boot Gateway",
      version: "2.4.1-RELEASE",
      tenantId: process.env.VITE_TENANT_ID || "00000000-0000-0000-0000-000000000001",
    },
    java: {
      version: "21.0.2",
      vendor: "Eclipse Adoptium",
      runtime: "OpenJDK Runtime Environment (Temurin-21.0.2+13)",
    },
    springBoot: {
      version: "3.2.4",
      profiles: ["prod", "meta-cloud-v19", "actuator-telemetry"],
    },
  });
});

app.post(["/actuator/simulate-state", "/api/v1/actuator/simulate-state"], (req, res) => {
  const { channel, status } = req.body || {};
  if (channel && ["whatsapp", "instagram", "messenger"].includes(channel)) {
    if (["UP", "DEGRADED", "DOWN"].includes(status)) {
      simulatedActuatorDegradation[channel] = status;
    }
  } else if (channel === "reset") {
    simulatedActuatorDegradation = { whatsapp: "UP", instagram: "UP", messenger: "UP" };
  }
  res.json({
    success: true,
    state: simulatedActuatorDegradation,
    timestamp: new Date().toISOString(),
  });
});

app.get(["/actuator/health", "/api/v1/actuator/health"], (_req, res) => {
  const jitter = () => Math.floor(Math.random() * 14) - 6;
  const waStatus = simulatedActuatorDegradation.whatsapp;
  const igStatus = simulatedActuatorDegradation.instagram;
  const msStatus = simulatedActuatorDegradation.messenger;

  const overallStatus =
    waStatus === "DOWN" || igStatus === "DOWN" || msStatus === "DOWN"
      ? "DOWN"
      : waStatus === "DEGRADED" || igStatus === "DEGRADED" || msStatus === "DEGRADED"
      ? "DEGRADED"
      : "UP";

  const waP50 = waStatus === "UP" ? 138 + jitter() : waStatus === "DEGRADED" ? 490 + jitter() * 4 : 0;
  const igP50 = igStatus === "UP" ? 184 + jitter() : igStatus === "DEGRADED" ? 560 + jitter() * 4 : 0;
  const msP50 = msStatus === "UP" ? 162 + jitter() : msStatus === "DEGRADED" ? 520 + jitter() * 4 : 0;

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    components: {
      whatsappCloudApi: {
        status: waStatus,
        details: {
          channel: "WHATSAPP",
          provider: "Meta Cloud API v19.0",
          endpoint: "https://graph.facebook.com/v19.0/10492819204/messages",
          phoneNumberId: "10492819204",
          wabaId: "waba-ford-mx-99812",
          webhookStatus: waStatus === "DOWN" ? "DISCONNECTED" : "SUBSCRIBED",
          uptime30dPct: waStatus === "UP" ? 99.98 : waStatus === "DEGRADED" ? 99.42 : 97.85,
          latencyP50Ms: Math.max(0, waP50),
          latencyP95Ms: waStatus === "UP" ? 245 + jitter() : waStatus === "DEGRADED" ? 890 : 0,
          latencyP99Ms: waStatus === "UP" ? 390 + jitter() : waStatus === "DEGRADED" ? 1420 : 0,
          errorRatePct: waStatus === "UP" ? 0.04 : waStatus === "DEGRADED" ? 3.8 : 100.0,
          rateLimitRemainingPct: waStatus === "UP" ? 94 : waStatus === "DEGRADED" ? 28 : 0,
          activeWindows24h: 24,
          lastWebhookAt: new Date(Date.now() - 18000).toISOString(),
          tlsCertificateValidDays: 284,
        },
      },
      instagramGraphApi: {
        status: igStatus,
        details: {
          channel: "INSTAGRAM",
          provider: "Instagram Graph API v19.0",
          endpoint: "https://graph.facebook.com/v19.0/me/messages",
          igBusinessAccountId: "ig-ford-mx-1784140",
          webhookStatus: igStatus === "DOWN" ? "DISCONNECTED" : "SUBSCRIBED",
          uptime30dPct: igStatus === "UP" ? 99.91 : igStatus === "DEGRADED" ? 98.95 : 96.4,
          latencyP50Ms: Math.max(0, igP50),
          latencyP95Ms: igStatus === "UP" ? 320 + jitter() : igStatus === "DEGRADED" ? 980 : 0,
          latencyP99Ms: igStatus === "UP" ? 485 + jitter() : igStatus === "DEGRADED" ? 1650 : 0,
          errorRatePct: igStatus === "UP" ? 0.12 : igStatus === "DEGRADED" ? 4.5 : 100.0,
          rateLimitRemainingPct: igStatus === "UP" ? 88 : igStatus === "DEGRADED" ? 19 : 0,
          activeWindows24h: 9,
          lastWebhookAt: new Date(Date.now() - 94000).toISOString(),
          tlsCertificateValidDays: 284,
        },
      },
      messengerPlatform: {
        status: msStatus,
        details: {
          channel: "MESSENGER",
          provider: "Messenger Platform Send API v19.0",
          endpoint: "https://graph.facebook.com/v19.0/page-messages",
          pageId: "fb-page-ford-1029384",
          webhookStatus: msStatus === "DOWN" ? "DISCONNECTED" : "SUBSCRIBED",
          uptime30dPct: msStatus === "UP" ? 99.95 : msStatus === "DEGRADED" ? 99.1 : 97.1,
          latencyP50Ms: Math.max(0, msP50),
          latencyP95Ms: msStatus === "UP" ? 280 + jitter() : msStatus === "DEGRADED" ? 920 : 0,
          latencyP99Ms: msStatus === "UP" ? 430 + jitter() : msStatus === "DEGRADED" ? 1510 : 0,
          errorRatePct: msStatus === "UP" ? 0.08 : msStatus === "DEGRADED" ? 3.2 : 100.0,
          rateLimitRemainingPct: msStatus === "UP" ? 91 : msStatus === "DEGRADED" ? 31 : 0,
          activeWindows24h: 5,
          lastWebhookAt: new Date(Date.now() - 210000).toISOString(),
          tlsCertificateValidDays: 284,
        },
      },
      sseOperatorBroker: {
        status: "UP",
        details: {
          streamPath: "/api/v1/operator/events/stream",
          activeConnections: 3,
          publishedEventsCount: 1428,
          averageDispatchMs: 8,
        },
      },
      db: {
        status: "UP",
        details: {
          database: "PostgreSQL",
          version: "16.2",
          hikariPool: {
            activeConnections: 4,
            idleConnections: 6,
            maxConnections: 20,
            usagePct: 20,
          },
          validationQuery: "isValid()",
          responseTimeMs: 4,
        },
      },
      diskSpace: {
        status: "UP",
        details: {
          total: 107374182400,
          free: 82463372083,
          threshold: 10485760,
          path: "/app/data",
          exists: true,
        },
      },
    },
  });
});

app.get(["/actuator/metrics", "/api/v1/actuator/metrics"], (_req, res) => {
  res.json({
    names: [
      "http.server.requests",
      "meta.integration.latency",
      "meta.webhook.inbound.total",
      "meta.outbound.delivery.errors",
      "process.uptime",
      "system.cpu.usage",
      "jvm.memory.used",
      "hikaricp.connections.active",
    ],
  });
});

app.get(["/actuator/metrics/:metricName", "/api/v1/actuator/metrics/:metricName"], (req, res) => {
  const { metricName } = req.params;
  const tag = (req.query.tag as string) || "";
  const jitter = () => Number((Math.random() * 0.015).toFixed(4));

  if (metricName === "process.uptime") {
    return res.json({
      name: "process.uptime",
      description: "The uptime of the Java virtual machine",
      baseUnit: "seconds",
      measurements: [{ statistic: "VALUE", value: 2592410 + Math.floor(process.uptime()) }],
      availableTags: [],
    });
  }

  if (metricName === "system.cpu.usage") {
    return res.json({
      name: "system.cpu.usage",
      description: "The recent cpu usage for the whole system",
      baseUnit: null,
      measurements: [{ statistic: "VALUE", value: 0.14 + jitter() }],
      availableTags: [],
    });
  }

  if (metricName === "jvm.memory.used") {
    return res.json({
      name: "jvm.memory.used",
      description: "The amount of used memory",
      baseUnit: "bytes",
      measurements: [{ statistic: "VALUE", value: 385875968 }],
      availableTags: [{ tag: "area", values: ["heap", "nonheap"] }],
    });
  }

  if (metricName === "http.server.requests" || metricName === "meta.integration.latency") {
    const isWa = tag.toLowerCase().includes("whatsapp");
    const isIg = tag.toLowerCase().includes("instagram");
    const meanSec = isWa ? 0.142 : isIg ? 0.188 : 0.165;
    const maxSec = isWa ? 0.395 : isIg ? 0.490 : 0.435;
    const count = isWa ? 18420 : isIg ? 6940 : 3210;

    return res.json({
      name: metricName,
      description: "Timer of Meta Graph API & Webhook HTTP exchanges",
      baseUnit: "seconds",
      measurements: [
        { statistic: "COUNT", value: count },
        { statistic: "TOTAL_TIME", value: Number((count * meanSec).toFixed(2)) },
        { statistic: "MAX", value: maxSec },
      ],
      availableTags: [
        { tag: "channel", values: ["WHATSAPP", "INSTAGRAM", "MESSENGER"] },
        { tag: "status", values: ["200", "202", "429", "500"] },
        { tag: "outcome", values: ["SUCCESS", "CLIENT_ERROR", "SERVER_ERROR"] },
      ],
    });
  }

  return res.json({
    name: metricName,
    description: `Spring Boot Micrometer metric: ${metricName}`,
    baseUnit: "operations",
    measurements: [{ statistic: "COUNT", value: 1024 }],
    availableTags: [],
  });
});

// Serve Web App Manifest in dev mode
app.get("/manifest.webmanifest", (_req, res) => {
  res.setHeader("Content-Type", "application/manifest+json");
  res.json({
    id: "/",
    name: "Ford Concierge IA - CRM Operator Portal",
    short_name: "Ford CRM",
    description: "Portal de Atención Omni-Canal e Inteligencia Artificial para Distribuidores Ford",
    theme_color: "#0071E3",
    background_color: "#F5F5F7",
    display: "standalone",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  });
});

// OpenAPI Spec Endpoints (JSON & YAML)
app.get("/api/openapi.json", (_req, res) => {
  const specPath = path.join(process.cwd(), "src", "shared", "api", "openapi.json");
  if (fs.existsSync(specPath)) {
    return res.sendFile(specPath);
  }
  return res.status(404).json({ error: "OpenAPI specification not found" });
});

app.get("/api/openapi.yaml", (_req, res) => {
  const specPath = path.join(process.cwd(), "src", "shared", "api", "openapi.yaml");
  if (fs.existsSync(specPath)) {
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    return res.sendFile(specPath);
  }
  const rootPath = path.join(process.cwd(), "openapi.yaml");
  if (fs.existsSync(rootPath)) {
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    return res.sendFile(rootPath);
  }
  return res.status(404).json({ error: "OpenAPI specification not found" });
});

// Swagger UI Documentation Endpoint
app.get("/api/docs", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ford Uruapan API Docs - OpenAPI 3.0</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; padding: 0; background: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: '/api/openapi.yaml',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis],
          });
        };
      </script>
    </body>
    </html>
  `);
});

// Mock Initial Conversations API
const mockConversations = [
  {
    id: "conv-01",
    customerName: "Carlos Mendoza",
    customerHandle: "+52 452 123 4567",
    channel: "whatsapp",
    status: "bot",
    leadTemperature: "hot",
    lastMessageText: "Quiero agendar una prueba de manejo para el Mustang GT mañana",
    lastMessageTimestamp: "10:42 AM",
    unreadCount: 1,
    assignedTo: "adv-01",
    extractedFields: {
      interest: "Ford Mustang GT V8 2024",
      budget: "$250,000 MXN Enganche",
      urgency: "alta",
      tradeInCar: "Mazda 3 Sedán 2021 (Valuación ~$185,000 MXN)",
      creditPreApproved: true,
      testDriveScheduled: "Mañana 11:00 AM - Agencia Uruapan",
    },
  },
  {
    id: "conv-02",
    customerName: "Sofía Ramírez",
    customerHandle: "@sofia.ramirez_m",
    channel: "instagram",
    status: "human",
    leadTemperature: "warm",
    lastMessageText: "¿Cuáles son los requisitos de enganche para la Bronco Badlands?",
    lastMessageTimestamp: "09:15 AM",
    unreadCount: 0,
    assignedTo: "adv-02",
    extractedFields: {
      interest: "Ford Bronco Badlands 2.3L 2024",
      budget: "$180,000 MXN Enganche",
      urgency: "media",
      tradeInCar: "No entregará auto a cuenta",
      creditPreApproved: false,
    },
  },
];

app.get("/api/conversations", (_req, res) => {
  res.json(mockConversations);
});

app.get("/api/conversations/:id", (req, res) => {
  const conv = mockConversations.find((c) => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });
  res.json(conv);
});

app.post("/api/conversations/:id/takeover", (req, res) => {
  const conv = mockConversations.find((c) => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });
  
  const targetStatus = req.body?.status || (conv.status === "bot" ? "human" : "bot");
  conv.status = targetStatus;
  res.json({
    id: conv.id,
    status: conv.status,
    message: `Atención actualizada a modo: ${conv.status}`,
  });
});

app.put("/api/conversations/:id/fields", (req, res) => {
  const conv = mockConversations.find((c) => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  conv.extractedFields = {
    ...conv.extractedFields,
    ...req.body,
  };
  res.json({
    id: conv.id,
    extractedFields: conv.extractedFields,
    message: "Ficha del prospecto actualizada exitosamente",
  });
});

app.get("/api/metrics", (req, res) => {
  const timeframe = (req.query.timeframe as string) || "month";
  res.json({
    timeframe,
    pipelineTotal: "$12.8M MXN",
    marginTotal: "$1.33M MXN",
    activeLeads: 148,
    appointmentRate: "34.5%",
    tokensTotal: "184.5k",
    aiAutonomyRate: "77.8%",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/bot/config", (_req, res) => {
  res.json({
    model: "gemini-3.8-flash",
    creativity: 0.7,
    systemPrompt: "Asistente Oficial Ford Uruapan",
    handoffKeywords: ["humano", "asesor", "queja", "gerente"],
    responseDelayMs: 400,
    handoffOnUnsure: true,
  });
});

// AI Respond endpoint
app.post("/api/ai/respond", async (req, res) => {
  const startTime = Date.now();
  const { conversation, messages, config, failureInjectors } = req.body || {};

  // 1. Check Failure Injectors
  if (failureInjectors?.offline) {
    return res.status(503).json({ error: "Network offline: connection refused by simulated injector" });
  }

  if (failureInjectors?.rateLimit429) {
    return res.status(429).json({ error: "Rate limit exceeded (HTTP 429): Quota exhausted. Retry with backoff." });
  }

  if (failureInjectors?.aiError500) {
    return res.status(500).json({ error: "Internal Model Server Error (HTTP 500): Downstream inference cluster unavailable." });
  }

  if (failureInjectors?.aiTimeout) {
    // Artificial 3.5 second delay to simulate timeout
    await new Promise((resolve) => setTimeout(resolve, 3500));
    return res.status(504).json({ error: "Gateway Timeout (HTTP 504): Model response exceeded threshold (>10s)" });
  }

  if (failureInjectors?.malformedOutput) {
    return res.json({
      replyText: "<<<MALFORMED_JSON_CHUNK_ERR_UNDEFINED_PROPERTY_ACCESS>>>",
      latencyMs: 140,
      tokensIn: 85,
      tokensOut: 12,
      model: config?.model || "gemini-3.8-flash",
      temperature: config?.creativity ?? 0.7,
      suggestedTemperature: "cold",
      handoffSuggested: false,
      handoffReason: "Unparseable stream chunk",
      systemPromptSent: config?.systemPrompt || "",
      contextWindowSent: [],
      extractedFields: {},
      rawResponse: { unclosed_bracket: true, broken_field: null },
    });
  }

  const userMessages = Array.isArray(messages) ? messages : [];
  const lastCustomerMessage = [...userMessages].reverse().find((m: any) => m.sender === "customer" && !m.isInternalNote);
  const customerText = (lastCustomerMessage?.content || "").trim();

  // Prepare system instruction and context
  const systemInstruction = config?.systemPrompt || `Eres el asistente virtual oficial de 'Ford Uruapan'.
Atiendes clientes en WhatsApp, Instagram y Messenger.
Tono: Profesional, cálido, empático, mexicano cordial (sin sonar informal en exceso).
Reglas:
1. Responde preguntas sobre inventario Ford, citas de prueba de manejo, requisitos de crédito y enganche.
2. Si te preguntan si eres humano, responde claramente que eres el asistente virtual de la agencia.
3. Si el cliente está molesto, reclama un problema mecánico/facturación, o pide explícitamente hablar con un humano, sugiere handoff.
4. Evalúa la temperatura del lead:
   - 'cold': Solo pide precio general o saluda.
   - 'warm': Pregunta por especificaciones, financiamiento o requisitos.
   - 'hot': Quiere apartar hoy, tiene enganche listo o pide prueba de manejo inmediata.
5. Extrae datos detectados: nombre, interés de auto, presupuesto, urgencia.`;

  const contextWindowSent = userMessages
    .filter((m: any) => !m.isInternalNote)
    .slice(-8)
    .map((m: any) => ({
      role: m.sender === "customer" ? "user" : "model",
      content: m.content || "",
    }));

  // Artificial response delay if configured
  if (config?.responseDelayMs && config.responseDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(config.responseDelayMs, 2000)));
  }

  // Attempt live Gemini inference if client is available
  if (aiClient) {
    try {
      const selectedModel = config?.model || "gemini-3.8-flash";
      const promptContents = [
        ...contextWindowSent.map((c: any) => ({
          role: c.role,
          parts: [{ text: c.content }],
        })),
      ];

      // Ensure last prompt has content
      if (promptContents.length === 0) {
        promptContents.push({ role: "user", parts: [{ text: customerText || "Hola" }] });
      }

      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: promptContents,
        config: {
          systemInstruction,
          temperature: config?.creativity ?? 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Respuesta al cliente en español mexicano profesional y cordial",
              },
              suggestedTemperature: {
                type: Type.STRING,
                description: "Evaluación de temperatura del lead: cold, warm o hot",
              },
              handoffSuggested: {
                type: Type.BOOLEAN,
                description: "True si se requiere transferir la conversación a un asesor humano",
              },
              handoffReason: {
                type: Type.STRING,
                description: "Razón breve de la sugerencia de transferencia, o cadena vacía",
              },
              extractedFields: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nombre del cliente si se detectó" },
                  interest: { type: Type.STRING, description: "Vehículo o modelo de interés" },
                  budget: { type: Type.STRING, description: "Presupuesto o enganche mencionado" },
                  urgency: { type: Type.STRING, description: "Nivel de urgencia: baja, media o alta" },
                  tradeInCar: { type: Type.STRING, description: "Vehículo a cuenta mencionado por el cliente" },
                  creditPreApproved: { type: Type.BOOLEAN, description: "Estado de preaprobación de crédito" },
                },
              },
            },
            required: ["reply", "suggestedTemperature", "handoffSuggested", "handoffReason"],
          },
        },
      });

      const latencyMs = Date.now() - startTime;
      const rawText = response.text || "{}";
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = { reply: rawText, suggestedTemperature: "warm", handoffSuggested: false, handoffReason: "" };
      }

      const tokensIn = response.usageMetadata?.promptTokenCount || Math.round((systemInstruction.length + customerText.length) / 4);
      const tokensOut = response.usageMetadata?.candidatesTokenCount || Math.round((parsed.reply?.length || 50) / 4);

      return res.json({
        replyText: parsed.reply || "¡Hola! Con gusto te apoyo con la información de nuestros autos.",
        latencyMs,
        tokensIn,
        tokensOut,
        model: selectedModel,
        temperature: config?.creativity ?? 0.7,
        suggestedTemperature: (["cold", "warm", "hot"].includes(parsed.suggestedTemperature) ? parsed.suggestedTemperature : "warm"),
        handoffSuggested: Boolean(parsed.handoffSuggested),
        handoffReason: parsed.handoffReason || "",
        systemPromptSent: systemInstruction,
        contextWindowSent,
        extractedFields: parsed.extractedFields || {},
        rawResponse: parsed,
      });
    } catch (err: any) {
      console.warn("Live Gemini API call failed or rate limited, using deterministic local engine fallback:", err?.message);
      // Fall through to deterministic domain fallback
    }
  }

  // Deterministic local simulation engine (high fidelity, instant, resilient)
  const lower = customerText.toLowerCase();
  let replyText = "¡Hola! Gracias por contactar a Ford Uruapan. Con gusto te atiendo, ¿en qué auto o servicio estás interesado hoy?";
  let suggestedTemperature: "cold" | "warm" | "hot" = "cold";
  let handoffSuggested = false;
  let handoffReason = "";
  const extractedFields: Record<string, any> = {};

  // Check explicit handoff keywords
  const keywords = Array.isArray(config?.handoffKeywords)
    ? config.handoffKeywords
    : ["humano", "asesor", "persona", "queja", "abogado", "demanda", "gerente", "fraude"];
  
  const matchedKeyword = keywords.find((k: string) => lower.includes(k.toLowerCase().trim()));

  if (matchedKeyword) {
    handoffSuggested = true;
    handoffReason = `Palabra clave de transferencia detectada: "${matchedKeyword}"`;
    replyText = "Entiendo perfectamente. En este momento transfiero tu conversación con uno de nuestros asesores comerciales senior para que te atienda personalmente.";
  } else if (lower.includes("queja") || lower.includes("factura") || lower.includes("falló") || lower.includes("pésimo") || lower.includes("mal servicio") || lower.includes("garantía")) {
    handoffSuggested = true;
    handoffReason = "Reclamación o incidente posventa detectado; requiere atención humana inmediata.";
    replyText = "Lamento mucho los inconvenientes presentados. Estoy transfiriendo tu caso de inmediato con nuestro Gerente de Servicio y Atención a Clientes.";
  } else if (lower.includes("comprar hoy") || lower.includes("apartar") || lower.includes("enganche listo") || lower.includes("compro hoy") || lower.includes("hacer el depósito") || lower.includes("prueba de manejo hoy")) {
    suggestedTemperature = "hot";
    handoffSuggested = true;
    handoffReason = "Lead de alta intención de compra listo para cierre.";
    replyText = "¡Excelente! Tenemos unidades listas para entrega inmediata. Te enlazo de inmediato con un asesor de piso para apartar tu vehículo y coordinar tu visita hoy mismo.";
    extractedFields.urgency = "alta";
  } else if (lower.includes("financiamiento") || lower.includes("crédito") || lower.includes("meses") || lower.includes("requisitos") || lower.includes("mazda") || lower.includes("tucson") || lower.includes("civic") || lower.includes("versiones")) {
    suggestedTemperature = "warm";
    replyText = "Contamos con planes de financiamiento con enganche desde el 15% y plazos de 12 a 60 meses. ¿Tienes algún modelo en mente o prefieres que te envíe el catálogo digital?";
    if (lower.includes("mazda")) extractedFields.interest = "Mazda 3 Sedán 2022";
    if (lower.includes("tucson")) extractedFields.interest = "Hyundai Tucson 2023";
    if (lower.includes("civic")) extractedFields.interest = "Honda Civic Touring";
    extractedFields.urgency = "media";
  } else if (lower.includes("tacos") || lower.includes("receta") || lower.includes("clima") || lower.includes("chiste")) {
    handoffSuggested = Boolean(config?.handoffOnUnsure);
    handoffReason = handoffSuggested ? "Pregunta fuera de dominio comercial de la agencia." : "";
    replyText = "Disculpa, soy el asistente virtual de Ford Uruapan especializado en compra, venta y financiamiento de autos. ¿Te gustaría conocer nuestras promociones vigentes?";
  } else if (lower === "ok" || lower === "va" || lower === "bueno" || lower === "si" || lower === "sí") {
    replyText = "Quedo a tu disposición. Si deseas agendar una cita en agencia o recibir cotización de algún auto seminuevo, solo indícamelo.";
  } else if (lower.includes("http://") || lower.includes("https://") || lower.includes("bit.ly") || lower.includes("ganaste")) {
    handoffSuggested = true;
    handoffReason = "Enlace externo o patrón de spam detectado.";
    replyText = "Por motivos de seguridad no procesamos enlaces externos. Si buscas cotizar un auto con gusto te apoyamos aquí.";
  } else if (lower.includes("precio") || lower.includes("cuánto cuesta") || lower.includes("cuanto sale") || lower.includes("precio del")) {
    suggestedTemperature = "cold";
    replyText = "Los precios de nuestros seminuevos certificados van desde $240,000 MXN con garantía de 1 año por escrito. ¿Te interesa sedán, SUV o pickup?";
  }

  // Check if asked if bot
  if (lower.includes("eres un bot") || lower.includes("eres robot") || lower.includes("hablo con una persona") || lower.includes("eres humano")) {
    replyText = "Hola, soy el asistente virtual de inteligencia artificial de Ford Uruapan. Si en cualquier momento prefieres la atención de un asesor humano, puedo transferirte sin problema.";
  }

  const latencyMs = Math.max(120, Date.now() - startTime);
  const tokensIn = Math.round((systemInstruction.length + customerText.length) / 4);
  const tokensOut = Math.round(replyText.length / 4);

  return res.json({
    replyText,
    latencyMs,
    tokensIn,
    tokensOut,
    model: config?.model || "gemini-3.8-flash",
    temperature: config?.creativity ?? 0.7,
    suggestedTemperature,
    handoffSuggested,
    handoffReason,
    systemPromptSent: systemInstruction,
    contextWindowSent,
    extractedFields,
    fallbackActive: true,
    rawResponse: {
      simulationFallback: true,
      reason: "deterministic_rules_applied",
      matchedKeyword: matchedKeyword || null,
    },
  });
});

// Messages API
app.get("/api/conversations/:id/messages", (req, res) => {
  const { id } = req.params;
  return res.json([
    {
      id: "msg-101",
      conversationId: id,
      sender: "customer",
      content: "Hola, buenos días. Quisiera cotizar una camioneta Ford.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "read",
    },
    {
      id: "msg-102",
      conversationId: id,
      sender: "bot",
      content: "¡Hola! Con gusto te apoyo. En Ford Uruapan tenemos la línea SUV (Bronco Sport, Territory, Explorer) y Pickups (Ranger, F-150, Maverick). ¿Cuál modelo prefieres?",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: "delivered",
      aiDebug: {
        model: "gemini-3.8-flash",
        latencyMs: 310,
        tokensIn: 85,
        tokensOut: 42,
        temperature: 0.7,
        suggestedTemperature: "warm",
        handoffSuggested: false,
        systemPromptSent: "Eres el Concierge IA de Ford Uruapan...",
        contextWindowSent: [],
        extractedFields: { interest: "Camioneta SUV/Pickup" },
        rawResponse: {},
      },
    },
  ]);
});

app.post("/api/conversations/:id/messages", (req, res) => {
  const { id } = req.params;
  const { content, sender = "human", isInternalNote = false } = req.body || {};
  return res.json({
    id: `msg-${Date.now()}`,
    conversationId: id,
    sender,
    content: content || "Mensaje enviado",
    timestamp: new Date().toISOString(),
    status: "sent",
    isInternalNote,
  });
});

// Reassign Lead Endpoint
app.post("/api/conversations/:id/reassign", (req, res) => {
  const { id } = req.params;
  const { advisorId } = req.body || {};
  const target = mockConversations.find((c) => c.id === id);
  if (target) {
    target.assignedTo = advisorId || "adv-01";
  }
  return res.json({
    id,
    assignedTo: advisorId || "adv-01",
    message: "Asesor comercial reasignado exitosamente.",
  });
});

// Automated QA Test Lab Scenarios
app.post("/api/scenarios/run", (_req, res) => {
  return res.json([
    { scenarioId: "scn-01", title: "Demanda de cita urgente", status: "passed", latencyMs: 240, handoffTriggered: true },
    { scenarioId: "scn-02", title: "Pregunta técnica Bronco V6", status: "passed", latencyMs: 310, handoffTriggered: false },
    { scenarioId: "scn-03", title: "Falla de red / Timeout 5s", status: "passed", latencyMs: 5000, handoffTriggered: true },
  ]);
});

// Audit Log Events
app.get("/api/events", (_req, res) => {
  return res.json([
    {
      id: "evt-101",
      timestamp: new Date().toISOString(),
      eventType: "incoming_message",
      status: "success",
      summary: "Mensaje entrante de WhatsApp deduplicado con éxito",
      details: { channel: "whatsapp", customerHandle: "+52 452 123 4567" },
    },
    {
      id: "evt-102",
      timestamp: new Date().toISOString(),
      eventType: "ai_reply",
      status: "success",
      summary: "Respuesta de Concierge IA Gemini generada en 290ms",
      details: { tokens: 120, model: "gemini-3.8-flash" },
    },
  ]);
});

// Meta Webhook Intake
app.post("/api/webhooks/meta", (_req, res) => {
  return res.json({
    status: "received",
    deduplicated: true,
    timestamp: new Date().toISOString(),
  });
});

app.get("/webhooks/meta/:channel", (req, res) => {
  const challenge = req.query["hub.challenge"] || "ok";
  return res.send(challenge);
});

app.post("/webhooks/meta/:channel", (_req, res) => {
  return res.status(202).json({ accepted: true });
});

// Canonical /api/v1 API Endpoints
app.get("/api/v1/conversations", (_req, res) => {
  return res.json({
    items: mockConversations.map((c) => ({
      id: c.id,
      tenantId: "tenant-ford-01",
      channel: c.channel.toUpperCase(),
      state: c.status === "bot" ? "BOT_ACTIVE" : "HUMAN_ACTIVE",
      version: 1,
      participant: { providerId: c.customerHandle, displayName: c.customerName, phone: c.customerHandle },
      assignedOperatorId: c.assignedTo || "adv-01",
      updatedAt: new Date().toISOString(),
    })),
    page: { pageSize: 25, hasNext: false },
  });
});

app.get("/api/v1/conversations/:conversationId", (req, res) => {
  const { conversationId } = req.params;
  const c = mockConversations.find((item) => item.id === conversationId) || mockConversations[0];
  return res.json({
    id: c.id,
    tenantId: "tenant-ford-01",
    channel: c.channel.toUpperCase(),
    state: c.status === "bot" ? "BOT_ACTIVE" : "HUMAN_ACTIVE",
    version: 1,
    participant: { providerId: c.customerHandle, displayName: c.customerName, phone: c.customerHandle },
    assignedOperatorId: c.assignedTo || "adv-01",
    updatedAt: new Date().toISOString(),
  });
});

app.get("/api/v1/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;
  return res.json({
    items: [
      {
        id: "msg-101",
        conversationId,
        direction: "INBOUND",
        content: "Hola, buenos días. Quisiera cotizar una camioneta Ford.",
        receivedAt: new Date(Date.now() - 3600000).toISOString(),
        deliveryStatus: "READ",
        sender: { providerId: "customer", displayName: "Cliente" },
      },
      {
        id: "msg-102",
        conversationId,
        direction: "OUTBOUND",
        content: "¡Hola! Con gusto te apoyo. En Ford Uruapan tenemos la línea SUV (Bronco Sport, Territory, Explorer) y Pickups (Ranger, F-150, Maverick). ¿Cuál modelo prefieres?",
        receivedAt: new Date(Date.now() - 3500000).toISOString(),
        deliveryStatus: "DELIVERED",
        sender: { providerId: "bot", displayName: "Concierge IA" },
      },
    ],
    page: { pageSize: 25, hasNext: false },
  });
});

app.post("/api/v1/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;
  const { content, internalNote = false } = req.body || {};
  return res.status(202).json({
    messageId: `msg-${Date.now()}`,
    conversationId,
    accepted: true,
    deliveryStatus: internalNote ? "INTERNAL" : "QUEUED",
    conversationVersion: 1,
    internalNote,
    acceptedAt: new Date().toISOString(),
  });
});

app.post("/api/v1/conversations/:conversationId/takeover", (req, res) => {
  const { conversationId } = req.params;
  return res.json({
    id: `htik-${Date.now()}`,
    tenantId: "tenant-ford-01",
    conversationId,
    status: "HUMAN_ACTIVE",
    reason: "Intervención de Asesor Humano en Panel de Operador",
    version: 1,
    createdAt: new Date().toISOString(),
  });
});

app.post("/api/v1/conversations/:conversationId/handback", (req, res) => {
  const { conversationId } = req.params;
  return res.json({
    id: `htik-${Date.now()}`,
    tenantId: "tenant-ford-01",
    conversationId,
    status: "CLOSED",
    reason: "Devuelto al Concierge Bot IA",
    version: 2,
    createdAt: new Date().toISOString(),
    closedAt: new Date().toISOString(),
  });
});

app.get("/api/v1/conversations/:conversationId/window", (req, res) => {
  return res.json({
    open: true,
    lastInboundAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 84600000).toISOString(),
    channel: "WHATSAPP",
  });
});

app.post("/api/v1/conversations/:conversationId/hsm", (_req, res) => {
  return res.status(202).json({
    providerMessageId: `hsm-${Date.now()}`,
    accepted: true,
  });
});

// Handoffs API
app.get("/api/v1/handoffs", (_req, res) => {
  return res.json({
    items: [
      {
        id: "htik-01",
        tenantId: "tenant-ford-01",
        conversationId: "conv-01",
        status: "HUMAN_PENDING",
        reason: "Demanda de cita urgente para prueba de manejo",
        version: 1,
        createdAt: new Date().toISOString(),
      },
    ],
    page: { pageSize: 25, hasNext: false },
  });
});

app.post("/api/v1/handoffs", (req, res) => {
  const { conversationId, reason } = req.body || {};
  return res.status(201).json({
    id: `htik-${Date.now()}`,
    tenantId: "tenant-ford-01",
    conversationId: conversationId || "conv-01",
    status: "HUMAN_PENDING",
    reason: reason || "Solicitud de asistencia humana",
    version: 1,
    createdAt: new Date().toISOString(),
  });
});

app.post("/api/v1/handoffs/:handoffId/claim", (req, res) => {
  const { handoffId } = req.params;
  return res.json({
    id: handoffId,
    tenantId: "tenant-ford-01",
    conversationId: "conv-01",
    status: "HUMAN_ACTIVE",
    reason: "Reclamado por asesor",
    version: 2,
    createdAt: new Date().toISOString(),
    claimedAt: new Date().toISOString(),
  });
});

// Granular Metrics v1
app.get("/api/v1/metrics/overview", (_req, res) => {
  return res.json({
    period: { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString(), timezone: "America/Mexico_City" },
    totalConversations: 148,
    activeConversations: 24,
    inboundMessages: 842,
    outboundMessages: 790,
    handoffs: 18,
    failedDeliveries: 2,
  });
});

app.get("/api/v1/metrics/bot", (_req, res) => {
  return res.json({
    period: { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString(), timezone: "America/Mexico_City" },
    classifiedDecisions: 612,
    fallbackDecisions: 14,
    handoffRecommendations: 18,
    averageLatencyMs: 310.5,
    successfulProviderCalls: 626,
    failedProviderCalls: 0,
  });
});

app.get("/api/v1/metrics/leads", (_req, res) => {
  return res.json({
    period: { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString(), timezone: "America/Mexico_City" },
    totalLeads: 148,
    hot: 42,
    warm: 76,
    cold: 30,
    unknown: 0,
  });
});

// Leads & CRM Integration v1
app.get("/api/v1/leads", (_req, res) => {
  return res.json({
    items: [
      {
        id: "lead-01",
        tenantId: "tenant-ford-01",
        name: "Carlos Mendoza",
        phone: "+52 452 123 4567",
        temperature: "HOT",
        score: 95,
        interestVin: "3FA6P08U7KR123456",
        notes: "Busca Mustang GT. Enganche $250k. Auto a cuenta Mazda 3 2021.",
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    ],
    page: { pageSize: 25, hasNext: false },
  });
});

app.get("/api/v1/leads/:leadId", (req, res) => {
  const { leadId } = req.params;
  return res.json({
    id: leadId,
    tenantId: "tenant-ford-01",
    name: "Carlos Mendoza",
    phone: "+52 452 123 4567",
    temperature: "HOT",
    score: 95,
    interestVin: "3FA6P08U7KR123456",
    notes: "Busca Mustang GT. Enganche $250k. Auto a cuenta Mazda 3 2021.",
    updatedAt: new Date().toISOString(),
    version: 1,
  });
});

app.post("/api/v1/leads/:leadId/sync", (req, res) => {
  return res.status(202).json({
    syncId: `sync-${Date.now()}`,
    status: "synced",
    submittedAt: new Date().toISOString(),
  });
});

// Inventory & Vehicles v1
app.get("/api/v1/inventory", (_req, res) => {
  return res.json({
    items: [
      { vehicleId: "v-01", vin: "3FA6P08U7KR123456", model: "Mustang GT V8", year: 2024, trim: "Performance", status: "available", branchId: "branch-uruapan", branchName: "Agencia Uruapan", priceMxn: 1250000 },
      { vehicleId: "v-02", vin: "1FMCU9GD8RUA98765", model: "Bronco Badlands", year: 2024, trim: "4x4 Advanced", status: "available", branchId: "branch-uruapan", branchName: "Agencia Uruapan", priceMxn: 1420000 },
    ],
    hasNext: false,
  });
});

app.get("/api/v1/vehicles/:vin", (req, res) => {
  const { vin } = req.params;
  return res.json({
    vehicleId: "v-01",
    vin,
    model: "Mustang GT V8 5.0L",
    year: 2024,
    trim: "Performance Fastback",
    status: "available",
    branchId: "branch-uruapan",
    branchName: "Agencia Uruapan",
    priceMxn: 1250000,
    promotionalDiscountMxn: 25000,
    specifications: { transmission: "Manual 6-Speed", horsepower: 486, drivetrain: "RWD" },
    photos: ["https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800"],
  });
});

// Finance & Appointments v1
app.post("/api/v1/finance/quote", (req, res) => {
  const { vin = "3FA6P08U7KR123456", downPayment = 250000, termMonths = 48 } = req.body || {};
  return res.json({
    vin,
    currency: "MXN",
    monthlyPayment: 21850.00,
    apr: 12.9,
    termMonths,
    insuranceIncluded: true,
    disclaimer: "Cotización preliminar no vinculante sujeta a aprobación crediticia de Ford Credit México.",
  });
});

app.get("/api/v1/appointments/available-slots", (_req, res) => {
  return res.json([
    { slotId: "slot-101", branchId: "branch-uruapan", startsAt: new Date(Date.now() + 86400000).toISOString(), endsAt: new Date(Date.now() + 90000000).toISOString(), advisorId: "adv-01" },
    { slotId: "slot-102", branchId: "branch-uruapan", startsAt: new Date(Date.now() + 93600000).toISOString(), endsAt: new Date(Date.now() + 97200000).toISOString(), advisorId: "adv-02" },
  ]);
});

app.post("/api/v1/appointments/book", (req, res) => {
  const { vin, customerPhone, branchId, slotId } = req.body || {};
  return res.status(201).json({
    appointmentId: `apptm-${Date.now()}`,
    vin: vin || "3FA6P08U7KR123456",
    customerPhone: customerPhone || "+52 452 123 4567",
    branchId: branchId || "branch-uruapan",
    slotId: slotId || "slot-101",
    status: "confirmed",
    calendarInvitationUrl: "https://calendar.google.com/event?action=TEMPLATE&text=Prueba+de+Manejo+Ford+Uruapan",
  });
});

// Advisors & Team Workload v1
app.get("/api/v1/team/advisors", (_req, res) => {
  return res.json([
    { advisorId: "adv-01", displayName: "Carlos Mendoza", email: "mendoza@forduruapan.com.mx", role: "Super Administrador / Propietario", branch: "Agencia Ford Uruapan", status: "available", assignedCount: 14, phone: "+52 452 839 2011" },
    { advisorId: "adv-02", displayName: "María Elena Torres", email: "torres@forduruapan.com.mx", role: "Gerente de Ventas", branch: "Agencia Ford Uruapan", status: "in_meeting", assignedCount: 8, phone: "+52 452 102 9384" },
  ]);
});

// Bot Config v1
app.get("/api/v1/bot/config", (_req, res) => {
  return res.json({
    enabled: true,
    humanHandoffEnabled: true,
    model: "gemini-3.8-flash",
    cloudProvider: "google-gemini",
    cloudEnabled: true,
    localEnabled: false,
    classificationEnabled: true,
    classificationMode: "active",
    classificationProvider: "gemini-flash",
    jevEnabled: true,
    memoryEnabled: true,
    semanticMemoryEnabled: true,
    recentMessageLimit: 20,
    systemPrompt: "[Redacted for security]",
    updatedAt: new Date().toISOString(),
  });
});

// Test Lab Faults v1
app.get("/api/v1/test-lab/faults", (_req, res) => {
  return res.json({
    aiTimeout: false,
    aiError500: false,
    rateLimit429: false,
    malformedOutput: false,
    channelSendFailure: false,
    duplicateWebhook: false,
    outOfOrder: false,
    offline: false,
  });
});

app.put("/api/v1/test-lab/faults", (req, res) => {
  return res.json(req.body || {});
});

// SSE Event Stream Endpoint v1 (Supports /api/v1/operator/events/stream and /api/v1/events/stream)
app.get(["/api/v1/operator/events/stream", "/api/v1/events/stream"], (req, res) => {
  const tenantId = (req.query.tenantId as string) || "tenant-ford-01";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial "connected" SSE event
  const connectedPayload = {
    status: "connected",
    tenantId,
    timestamp: new Date().toISOString(),
  };
  res.write(`event: connected\ndata: ${JSON.stringify(connectedPayload)}\n\n`);

  // Heartbeat and simulated real-time incoming messages
  const interval = setInterval(() => {
    // Send a periodic SSE heartbeat
    res.write(`: heartbeat\n\n`);
  }, 25000);

  res.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

// Vite middleware in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Meta CRM Lab server listening on port ${PORT}`);
    console.log(`OpenAPI Spec available at http://localhost:${PORT}/api/openapi.json`);
    console.log(`Swagger UI API Docs available at http://localhost:${PORT}/api/docs`);
  });
}

startServer();
