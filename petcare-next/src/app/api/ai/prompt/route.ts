import { NextRequest, NextResponse } from 'next/server';
import { generateText as generateTextGemini, isConfigured as isGeminiConfigured } from '@/lib/gemini';
import { generateText as generateTextPollinations, isConfigured as isPollinationsConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  // Verifica se pelo menos um provider está disponível
  const geminiAvailable = isGeminiConfigured();
  const pollinationsAvailable = isPollinationsConfigured();

  if (!geminiAvailable && !pollinationsAvailable) {
    return NextResponse.json({ error: 'Nenhuma API de IA configurada' }, { status: 503 });
  }

  try {
    const { petName, petBreed, userPrompt } = await request.json();

    const prompt = `Você é um assistente especializado em pets. O usuário tem um ${petBreed || 'cachorro'} chamado ${petName}.
Responda de forma carinhosa e útil em no máximo 50 palavras.

Pergunta do usuário: ${userPrompt}`;

    let response: string | null = null;

    // Tenta Gemini primeiro (mais inteligente)
    if (geminiAvailable) {
      try {
        response = await generateTextGemini(prompt);
      } catch (error) {
        console.log('Gemini failed, falling back to Pollinations:', error);
      }
    }

    // Fallback para Pollinations (sempre disponível)
    if (!response && pollinationsAvailable) {
      console.log('Using Pollinations as fallback for prompt');
      response = await generateTextPollinations(prompt);
    }

    if (!response) {
      return NextResponse.json({ error: 'Falha ao gerar resposta' }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Prompt error:', error);
    return NextResponse.json({ error: 'Failed to process prompt' }, { status: 500 });
  }
}
