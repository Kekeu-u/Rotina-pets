import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/pollinations';

export async function GET() {
  // Pollinations não precisa de API key, sempre está disponível
  return NextResponse.json({ configured: isConfigured() });
}
