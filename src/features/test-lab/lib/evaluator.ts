export interface LocalEvaluationResult {
  reply: string;
  temperature: 'cold' | 'warm' | 'hot';
  handoffSuggested: boolean;
  handoffReason?: string;
  extractedFields: Record<string, string>;
}

export function evaluateBotResponseLocally(
  prompt: string,
  handoffKeywords: string[],
  mode: 'autonomous' | 'assisted' | 'copilot'
): LocalEvaluationResult {
  const lowerPrompt = prompt.toLowerCase();

  // Check keyword matches for handoff
  const matchedKeyword = handoffKeywords.find((kw) =>
    lowerPrompt.includes(kw.toLowerCase())
  );

  let handoffSuggested = false;
  let handoffReason: string | undefined;

  if (matchedKeyword) {
    handoffSuggested = true;
    handoffReason = `Gatillo directo detectado: "${matchedKeyword}"`;
  } else if (
    lowerPrompt.includes('comprar') ||
    lowerPrompt.includes('enganche') ||
    lowerPrompt.includes('apartar') ||
    lowerPrompt.includes('transfiero') ||
    lowerPrompt.includes('cotizar') ||
    lowerPrompt.includes('urgente')
  ) {
    handoffSuggested = true;
    handoffReason = 'Intención de compra o cotización prioritaria detectada';
  } else if (mode === 'copilot') {
    handoffSuggested = true;
    handoffReason = 'Modo Copiloto activo (requiere revisión humana)';
  }

  // Determine lead temperature
  let temperature: 'cold' | 'warm' | 'hot' = 'cold';
  if (
    lowerPrompt.includes('enganche') ||
    lowerPrompt.includes('hoy') ||
    lowerPrompt.includes('comprar') ||
    lowerPrompt.includes('apartar')
  ) {
    temperature = 'hot';
  } else if (
    lowerPrompt.includes('precio') ||
    lowerPrompt.includes('cotizar') ||
    lowerPrompt.includes('prueba') ||
    lowerPrompt.includes('versiones')
  ) {
    temperature = 'warm';
  }

  // Extract mock vehicle / budget fields
  const extractedFields: Record<string, string> = {};
  if (lowerPrompt.includes('mustang')) extractedFields.interest = 'Mustang GT 2025';
  else if (lowerPrompt.includes('bronco')) extractedFields.interest = 'Bronco Badlands 2025';
  else if (lowerPrompt.includes('explorer')) extractedFields.interest = 'Explorer ST 2025';
  else if (lowerPrompt.includes('maverick')) extractedFields.interest = 'Maverick Hybrid 2025';
  else if (lowerPrompt.includes('f-150')) extractedFields.interest = 'F-150 Tremor 2025';

  if (lowerPrompt.includes('$')) {
    const budgetMatch = prompt.match(/\$\d+[\d,.]*/);
    if (budgetMatch) extractedFields.budget = budgetMatch[0];
  }

  return {
    reply: `¡Hola! Gracias por contactar a Ford Uruapan. ${
      extractedFields.interest ? `Con gusto te asesoramos con la ${extractedFields.interest}.` : '¿En qué vehículo o servicio estás interesado hoy?'
    }`,
    temperature,
    handoffSuggested,
    handoffReason,
    extractedFields,
  };
}
