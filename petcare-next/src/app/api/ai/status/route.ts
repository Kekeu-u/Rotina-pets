import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/gemini';

export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}
