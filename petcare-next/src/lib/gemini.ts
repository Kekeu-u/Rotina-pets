import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Text generation model
const textModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Image generation - using fetch directly for Nano Banana
const IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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

  console.log('Calling image API:', IMAGE_API_URL);

  try {
    const response = await fetch(`${IMAGE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
        },
      }),
    });

    const responseText = await response.text();
    console.log('API Response status:', response.status);

    if (!response.ok) {
      console.error('Image API Error Response:', responseText);
      throw new Error(`API request failed: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    const data = JSON.parse(responseText);
    console.log('API Response keys:', Object.keys(data));

    const parts = data.candidates?.[0]?.content?.parts || [];
    console.log('Parts count:', parts.length);

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const base64 = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        console.log('Found image with mimeType:', mimeType);
        return `data:${mimeType};base64,${base64}`;
      }
    }

    console.log('No image found in response parts');
    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

export function isConfigured(): boolean {
  return !!apiKey;
}
