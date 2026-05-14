import { Contact } from "../types";

// In dev: empty string → Vite proxies /api/* to Express on :3001
// In production (Android/web): APP_URL is set to your deployed backend URL
const API_BASE = (process.env.APP_URL || '').replace(/\/$/, '');

export async function extractContactFromImage(
  base64Image: string,
  existingTags: string[] = []
): Promise<Partial<Contact>> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, existingTags }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `Server error ${response.status}` }));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json();
}
