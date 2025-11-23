import { NextRequest, NextResponse } from 'next/server';
import { generateText, isConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed, taskName, happiness } = await request.json();

    const prompt = `Você é um cachorro chamado ${petName}, da raça ${petBreed}.
Seu dono acabou de completar a tarefa: "${taskName}".
Seu nível de felicidade atual é ${happiness}%.

Responda em primeira pessoa como se fosse o cachorro, em 1-2 frases curtas e fofas, mostrando sua reação a essa ação do dono.
Use linguagem simples e carinhosa. Seja expressivo mas breve.
Não use hashtags. Responda apenas em português brasileiro.`;

    const response = await generateText(prompt);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Pet reaction error:', error);
    return NextResponse.json({ error: 'Failed to generate reaction' }, { status: 500 });
  }
}
