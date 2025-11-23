import { NextRequest, NextResponse } from 'next/server';
import { generateText, isConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed } = await request.json();

    const prompt = `Dê uma dica rápida e útil de cuidados para um cachorro com as seguintes características:
- Nome: ${petName}
- Raça: ${petBreed}

A dica deve ser específica para essa raça.
Responda em 1-2 frases apenas, de forma direta e prática.
Responda apenas em português brasileiro.`;

    const response = await generateText(prompt);

    return NextResponse.json({ tip: response });
  } catch (error) {
    console.error('Daily tip error:', error);
    return NextResponse.json({ error: 'Failed to generate tip' }, { status: 500 });
  }
}
