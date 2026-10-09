import { http, HttpResponse } from 'msw';

// Lightweight mocks for component/unit tests only.
// Real traffic shapes for Meta Cloud API and Gemini belong in Playwright HAR fixtures.
export const handlers = [
  http.get('/api/session/role', () => {
    return HttpResponse.json({ role: 'asesor' });
  }),
  http.post('/api/bot/toggle', async ({ request }) => {
    const body = (await request.json()) as { mode?: string };
    return HttpResponse.json({ mode: body.mode ?? 'bot' });
  }),
];
