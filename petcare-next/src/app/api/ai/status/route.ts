import { NextResponse } from 'next/server';
import { isConfigured as isPollinationsConfigured } from '@/lib/pollinations';
import { isConfigured as isGroqConfigured } from '@/lib/groq';

export async function GET() {
  const groqAvailable = isGroqConfigured();
  const pollinationsAvailable = isPollinationsConfigured();

  // Pelo menos uma API deve estar disponível
  const configured = groqAvailable || pollinationsAvailable;

  return NextResponse.json({
    configured,
    providers: {
      groq: groqAvailable,
      pollinations: pollinationsAvailable,
    },
    // Provider principal que será usado
    primaryProvider: groqAvailable ? 'groq' : 'pollinations',
  });
}
