import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function extractContactFromImage(
  base64Image: string,
  existingTags: string[] = []
): Promise<Partial<Contact>> {
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set.");

  const ai = new GoogleGenAI({ apiKey });

  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  const tagsPrompt =
    existingTags.length > 0
      ? ` Also suggest a single relevant tag for this contact. Choose from: [${existingTags.join(", ")}], or create a new one if none fit.`
      : ` Also suggest a single relevant tag (e.g. Client, Vendor, Tech, Healthcare).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: [
      {
        inlineData: { data: base64Data, mimeType: "image/jpeg" },
      },
      "Analyze this business card and extract the contact information. Return ONLY a JSON object. If a field is not found, leave it as an empty string." +
        tagsPrompt,
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          firstName: { type: Type.STRING },
          lastName:  { type: Type.STRING },
          company:   { type: Type.STRING },
          jobTitle:  { type: Type.STRING },
          phone:     { type: Type.STRING },
          email:     { type: Type.STRING },
          website:   { type: Type.STRING },
          address:   { type: Type.STRING },
          tag:       { type: Type.STRING },
        },
      },
    },
  });

  if (!response.text) throw new Error("No response from Gemini.");
  const parsed = JSON.parse(response.text);

  // Sanitize string fields — reject values that look like model reasoning
  // (excessively long or not a plausible value for the field)
  const clean = (v: unknown) => (typeof v === 'string' && v.length <= 300 ? v : '');
  const isUrl = (v: string) => v === '' || /^https?:\/\//i.test(v);

  return {
    firstName: clean(parsed.firstName),
    lastName:  clean(parsed.lastName),
    company:   clean(parsed.company),
    jobTitle:  clean(parsed.jobTitle),
    phone:     clean(parsed.phone),
    email:     clean(parsed.email),
    website:   isUrl(clean(parsed.website)) ? clean(parsed.website) : '',
    address:   clean(parsed.address),
    tag:       clean(parsed.tag),
  };
}
