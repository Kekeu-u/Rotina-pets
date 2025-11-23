// Pollinations.ai - API gratuita para geração de imagens e texto
// Sem necessidade de API key!

const POLLINATIONS_IMAGE_URL = 'https://image.pollinations.ai/prompt';
const POLLINATIONS_TEXT_URL = 'https://text.pollinations.ai';

export interface PollinationsOptions {
  width?: number;
  height?: number;
  seed?: number;
  // Modelos gratuitos: flux, turbo
  // Modelos pagos (seed tier): seedream, nanobanana, kontext
  model?: 'flux' | 'turbo' | 'seedream' | 'nanobanana' | 'kontext';
}

/**
 * Gera uma URL de imagem usando Pollinations.ai
 * A imagem é gerada sob demanda quando a URL é acessada
 */
export function getImageUrl(prompt: string, options: PollinationsOptions = {}): string {
  const {
    width = 512,
    height = 512,
    seed = Math.floor(Math.random() * 1000000),
    model = 'flux' // Modelo gratuito padrão
  } = options;

  const encodedPrompt = encodeURIComponent(prompt);

  return `${POLLINATIONS_IMAGE_URL}/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
}

/**
 * Gera uma imagem e retorna como base64 data URL
 */
export async function generateImage(prompt: string, options: PollinationsOptions = {}): Promise<string | null> {
  try {
    const imageUrl = getImageUrl(prompt, options);

    console.log('Fetching image from Pollinations:', imageUrl.substring(0, 100) + '...');

    // Fetch a imagem
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Converter para blob e depois para base64
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = blob.type || 'image/jpeg';

    console.log('Image generated successfully, size:', blob.size);

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Pollinations image generation error:', error);
    throw error;
  }
}

/**
 * Gera texto usando Pollinations.ai
 */
export async function generateText(prompt: string): Promise<string | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${POLLINATIONS_TEXT_URL}/${encodedPrompt}?model=openai`;

    console.log('Generating text with Pollinations');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to generate text: ${response.status}`);
    }

    const text = await response.text();
    console.log('Text generated successfully');

    return text;
  } catch (error) {
    console.error('Pollinations text generation error:', error);
    throw error;
  }
}

/**
 * Sempre configurado pois não precisa de API key
 */
export function isConfigured(): boolean {
  return true;
}
