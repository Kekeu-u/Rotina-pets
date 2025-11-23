import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Text generation model
const textModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Image generation - using Nano Banana (gemini-2.5-flash-image)
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

/**
 * Analisa uma imagem e retorna descrição usando Gemini Vision
 */
export async function analyzeImage(imageBase64: string, prompt: string): Promise<string | null> {
  if (!textModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    // Remove o prefixo data:image/...;base64, se presente
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const mimeType = imageBase64.includes('data:image/png') ? 'image/png' : 'image/jpeg';

    const result = await textModel.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      { text: prompt }
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
}

/**
 * Analisa duas imagens e gera uma descrição combinada para criação de cena
 */
export async function analyzeAndCombineImages(
  petImage: string,
  productImage: string,
  petName?: string,
  petBreed?: string
): Promise<{ petDescription: string; productDescription: string; combinedPrompt: string } | null> {
  if (!textModel) {
    throw new Error('Gemini API not configured');
  }

  try {
    // Analisa a imagem do pet
    const petAnalysis = await analyzeImage(
      petImage,
      `Descreva este pet de forma detalhada em inglês para geração de imagem. Inclua: cor da pelagem, tamanho aparente, raça ou características, expressão. Seja conciso (máximo 50 palavras). Apenas a descrição, sem introdução.`
    );

    // Analisa a imagem do produto
    const productAnalysis = await analyzeImage(
      productImage,
      `Descreva este produto/brinquedo para pets de forma detalhada em inglês. Inclua: tipo do item, cor, material aparente, tamanho aproximado. Seja conciso (máximo 30 palavras). Apenas a descrição, sem introdução.`
    );

    if (!petAnalysis || !productAnalysis) {
      return null;
    }

    // Cria o prompt combinado para geração de imagem
    const petNameStr = petName ? `named ${petName}` : '';
    const petBreedStr = petBreed ? `(${petBreed})` : '';

    const combinedPrompt = `Photorealistic image of a happy ${petAnalysis} ${petNameStr} ${petBreedStr} joyfully playing with ${productAnalysis}. The pet looks excited and engaged with the toy. Warm, bright lighting, cozy home environment, high quality pet photography, heartwarming scene that shows the bond between pet and their favorite toy. 4k, detailed, professional photo.`;

    return {
      petDescription: petAnalysis,
      productDescription: productAnalysis,
      combinedPrompt
    };
  } catch (error) {
    console.error('Combined analysis error:', error);
    return null;
  }
}
