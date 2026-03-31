import { GoogleGenAI, Type } from "@google/genai";
import { Contact } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractContactFromImage(base64Image: string, existingTags: string[] = []): Promise<Partial<Contact>> {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const tagsPrompt = existingTags.length > 0 
      ? ` Also suggest a single relevant tag for this contact. You can choose from these existing tags: [${existingTags.join(', ')}], or create a new one if none fit.`
      : ` Also suggest a single relevant tag for this contact (e.g., Client, Vendor, Tech, Healthcare).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        "Analyze this business card and extract the contact information. Return ONLY a JSON object with the requested fields. If a field is not found, leave it as an empty string." + tagsPrompt,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            firstName: { type: Type.STRING, description: "The person's first name" },
            lastName: { type: Type.STRING, description: "The person's last name" },
            company: { type: Type.STRING, description: "The name of the company or business" },
            jobTitle: { type: Type.STRING, description: "The person's job title or role" },
            phone: { type: Type.STRING, description: "The primary phone number" },
            email: { type: Type.STRING, description: "The email address" },
            website: { type: Type.STRING, description: "The company website URL" },
            address: { type: Type.STRING, description: "The physical address of the business" },
            tag: { type: Type.STRING, description: "A single suggested tag for this contact" },
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    const extractedData = JSON.parse(response.text);
    return extractedData;
  } catch (error) {
    console.error("Error extracting contact info:", error);
    throw error;
  }
}
