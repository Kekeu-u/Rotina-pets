import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isConfigured } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed, productName, productDescription } = await request.json();

    const prompt = `Generate a cute, photorealistic image of a ${petBreed} dog named ${petName} happily playing with a ${productName} (${productDescription}). The dog should look happy and engaged with the toy. Bright, cheerful lighting. High quality pet photography style.`;

    const imageData = await generateImage(prompt);

    if (!imageData) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({ image: imageData });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
