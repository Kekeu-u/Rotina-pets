import { NextRequest, NextResponse } from 'next/server';
import { generateText, isConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed } = await request.json();

    const prompt = `O usuário acabou de enviar uma foto do pet ${petName} (${petBreed}). Dê uma resposta MUITO curta (máximo 8 palavras) elogiando o pet de forma carinhosa. Exemplo: "Que lindo! Foto perfeita!" ou "Adorável! Ficou ótima!" Responda apenas em português brasileiro.`;

    const response = await generateText(prompt);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze photo' }, { status: 500 });
  }
}
