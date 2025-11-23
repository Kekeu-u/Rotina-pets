import { NextRequest, NextResponse } from 'next/server';
import { generateText, isConfigured } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed, userPrompt } = await request.json();

    const prompt = `Você é um assistente especializado em pets. O usuário tem um ${petBreed || 'cachorro'} chamado ${petName}.
Responda de forma carinhosa e útil em no máximo 50 palavras.

Pergunta do usuário: ${userPrompt}`;

    const response = await generateText(prompt);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Prompt error:', error);
    return NextResponse.json({ error: 'Failed to process prompt' }, { status: 500 });
  }
}
