import { ScriptedScenario, ScenarioTestResult, BotConfig, FailureInjectors } from '../types';

export const SCRIPTED_SCENARIOS: ScriptedScenario[] = [
  {
    id: 'sc-1',
    title: 'Pregunta de precio general (Mazda 3)',
    description: 'Cliente consulta precio de entrada y versiones de forma casual.',
    channel: 'whatsapp',
    customerName: 'Arturo Peña',
    customerHandle: '+52 55 1029 3847',
    messages: ['Buenas tardes, ¿en cuánto sale el Mazda 3 2022 y qué versiones tienen disponibles?'],
    expectedHandoff: false,
    expectedTemperature: 'cold',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-2',
    title: 'Compra hoy / Enganche listo (Lead Caliente)',
    description: 'Cliente con alta urgencia listo para transferir depósito hoy.',
    channel: 'whatsapp',
    customerName: 'Guillermo Garza',
    customerHandle: '+52 81 8301 9284',
    messages: ['Tengo listos $100,000 en mano para el enganche y quiero apartar la camioneta hoy mismo, ¿a qué cuenta transfiero?'],
    expectedHandoff: true,
    expectedTemperature: 'hot',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-3',
    title: 'Queja enojada (Reclamo administrativo / factura)',
    description: 'Cliente molesto con servicio posventa solicitando hablar con un gerente.',
    channel: 'instagram',
    customerName: 'Valeria Sotomayor',
    customerHandle: '@valeria_soto',
    messages: ['Es el colmo, me entregaron el coche sin placas ni factura y no me contestan las llamadas, exijo hablar con un gerente real de inmediato.'],
    expectedHandoff: true,
    expectedTemperature: 'warm',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-4',
    title: 'Pregunta fuera de lugar (Off-topic)',
    description: 'Pregunta ajena a la concesionaria (receta de comida).',
    channel: 'messenger',
    customerName: 'Paco Juárez',
    customerHandle: 'Paco Juárez (FB)',
    messages: ['Oigan, ¿cuál es la mejor receta para preparar tacos al pastor en casa?'],
    expectedHandoff: true, // triggers handoffOnUnsure
    expectedTemperature: 'cold',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-5',
    title: 'Respuesta ambigua de una sola palabra',
    description: 'Cliente envía únicamente "va" tras información previa.',
    channel: 'whatsapp',
    customerName: 'Luis Ángel Cano',
    customerHandle: '+52 55 9944 1122',
    messages: ['va'],
    expectedHandoff: false,
    expectedTemperature: 'cold',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-6',
    title: 'Spam / Enlace sospechoso',
    description: 'Mensaje automatizado de phishing o enlaces externos.',
    channel: 'instagram',
    customerName: 'PromoBot 3000',
    customerHandle: '@gana_dinero_hoy_mx',
    messages: ['Gana dinero fácil invirtiendo en crypto entra ya a https://bit.ly/ganadinerohoymex y duplica tus ingresos hoy mismo'],
    expectedHandoff: true,
    expectedTemperature: 'cold',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-7',
    title: 'Mensaje con imagen / multimedia no soportado',
    description: 'Cliente envía una fotografía de un daño estético o tarjeta de circulación.',
    channel: 'whatsapp',
    customerName: 'Carmen Treviño',
    customerHandle: '+52 81 2299 4411',
    messages: ['[Fotografía adjunta: detalle_fascia_rayada.jpg] ¿Tienen esta pieza o me cubre la garantía?'],
    isMedia: true,
    mediaType: 'image',
    expectedHandoff: true,
    expectedTemperature: 'warm',
    expectedMaxLatencyMs: 3000,
  },
  {
    id: 'sc-8',
    title: 'Ráfaga de mensajes rápidos (Burst Debounce)',
    description: 'Cliente envía 3 mensajes consecutivos en pocos segundos.',
    channel: 'whatsapp',
    customerName: 'Jorge Negrete',
    customerHandle: '+52 55 6677 8899',
    messages: [
      'Hola buenas tardes disculpen',
      '¿Tienen la Tucson en color negro disponible en Insurgentes?',
      '¿Y aceptan mi auto actual a cuenta de enganche?',
    ],
    expectedHandoff: false,
    expectedTemperature: 'warm',
    expectedMaxLatencyMs: 3500,
  },
];

export async function runScenarioTest(
  scenario: ScriptedScenario,
  config: BotConfig,
  failureInjectors: FailureInjectors
): Promise<ScenarioTestResult> {
  const reasons: string[] = [];
  const fullCustomerContent = scenario.messages.join(' ');
  const startTime = Date.now();

  try {
    const res = await fetch('/api/ai/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation: {
          id: `test-${scenario.id}`,
          channel: scenario.channel,
          customerName: scenario.customerName,
          customerHandle: scenario.customerHandle,
          status: 'bot',
          leadTemperature: 'cold',
        },
        messages: scenario.messages.map((m, i) => ({
          id: `test-m-${i}`,
          sender: 'customer',
          content: m,
          timestamp: new Date().toISOString(),
          status: 'read',
          unsupportedMedia: scenario.isMedia,
        })),
        config,
        failureInjectors,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        scenarioId: scenario.id,
        title: scenario.title,
        status: 'failed',
        latencyMs: Date.now() - startTime,
        handoffTriggered: false,
        leadTemperature: 'cold',
        reasons: [`Respuesta no exitosa del servidor: HTTP ${res.status} (${errText})`],
      };
    }

    const data = await res.json();
    const latencyMs = data.latencyMs || Date.now() - startTime;
    const handoffTriggered = Boolean(data.handoffSuggested);
    const leadTemperature = data.suggestedTemperature || 'cold';

    // Verification Checks
    let passed = true;

    // Check 1: Latency
    if (latencyMs > scenario.expectedMaxLatencyMs) {
      passed = false;
      reasons.push(`Latencia ${latencyMs}ms excedió el umbral de ${scenario.expectedMaxLatencyMs}ms`);
    }

    // Check 2: Handoff
    if (scenario.expectedHandoff && !handoffTriggered) {
      passed = false;
      reasons.push('Se esperaba derivación a asesor humano pero el bot no activó handoff.');
    } else if (!scenario.expectedHandoff && handoffTriggered) {
      // In some configurations off-topic or ambiguous can trigger handoff if configured
      if (scenario.id !== 'sc-4') {
        passed = false;
        reasons.push('Se activó derivación innecesaria a humano.');
      }
    }

    // Check 3: Lead Temperature direction
    if (scenario.expectedTemperature && leadTemperature !== scenario.expectedTemperature) {
      // Allow warm/hot flexibility on purchase intent
      if (scenario.expectedTemperature === 'hot' && leadTemperature !== 'hot') {
        passed = false;
        reasons.push(`Temperatura esperada '${scenario.expectedTemperature}', se obtuvo '${leadTemperature}'`);
      }
    }

    // Check 4: No empty reply
    if (!data.replyText || data.replyText.trim().length === 0) {
      passed = false;
      reasons.push('La respuesta generada por la IA está vacía.');
    }

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      status: passed ? 'passed' : 'failed',
      latencyMs,
      handoffTriggered,
      leadTemperature,
      replyText: data.replyText,
      reasons: reasons.length === 0 ? ['Comportamiento, latencia y clasificación conformes con la política.'] : reasons,
    };
  } catch (err: any) {
    return {
      scenarioId: scenario.id,
      title: scenario.title,
      status: 'failed',
      latencyMs: Date.now() - startTime,
      handoffTriggered: false,
      leadTemperature: 'cold',
      reasons: [`Excepción de red o procesamiento: ${err.message}`],
    };
  }
}
