import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

// CORS — allow the Vite dev server and the Capacitor WebView
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'capacitor://localhost', 'http://localhost'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────

app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    return;
  }

  const { base64Image, existingTags = [] } = req.body;
  if (!base64Image) {
    res.status(400).json({ error: 'base64Image is required.' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const tagsPrompt = existingTags.length > 0
      ? ` Also suggest a single relevant tag for this contact. You can choose from these existing tags: [${existingTags.join(', ')}], or create a new one if none fit.`
      : ` Also suggest a single relevant tag for this contact (e.g., Client, Vendor, Tech, Healthcare).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
        'Analyze this business card and extract the contact information. Return ONLY a JSON object with the requested fields. If a field is not found, leave it as an empty string.' + tagsPrompt,
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            firstName: { type: Type.STRING, description: "The person's first name" },
            lastName:  { type: Type.STRING, description: "The person's last name" },
            company:   { type: Type.STRING, description: 'The name of the company or business' },
            jobTitle:  { type: Type.STRING, description: "The person's job title or role" },
            phone:     { type: Type.STRING, description: 'The primary phone number' },
            email:     { type: Type.STRING, description: 'The email address' },
            website:   { type: Type.STRING, description: 'The company website URL' },
            address:   { type: Type.STRING, description: 'The physical address of the business' },
            tag:       { type: Type.STRING, description: 'A single suggested tag for this contact' },
          },
        },
      },
    });

    if (!response.text) {
      res.status(500).json({ error: 'No response from Gemini.' });
      return;
    }

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error) {
    console.error('[/api/analyze] Gemini error:', error);
    res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
  }
});

// ── Static files (production) ─────────────────────────────────────────────────
// In production the Express server also serves the built frontend
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ SnapDex API server running at http://localhost:${PORT}`);
});
