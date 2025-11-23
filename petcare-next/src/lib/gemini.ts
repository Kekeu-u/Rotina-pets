import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Text generation model
const textModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Image generation - using fetch directly for Nano Banana
const IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

export async function generateText(prompt: string): Promise<string | null> {
  if (!textModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    const result = await textModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Text generation error:', error);
    return null;
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  if (!apiKey) {
    throw new Error('Gemini API not configured');
  }

  try {
    const response = await fetch(`${IMAGE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image API Error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const base64 = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64}`;
      }
    }

    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

export function isConfigured(): boolean {
  return !!apiKey;
}
