import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isConfigured } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured', details: 'GEMINI_API_KEY missing' }, { status: 503 });
  }

  try {
    const { petName, petBreed, productName, productDescription } = await request.json();

    const prompt = `Generate a cute, photorealistic image of a ${petBreed} dog named ${petName} happily playing with a ${productName} (${productDescription}). The dog should look happy and engaged with the toy. Bright, cheerful lighting. High quality pet photography style.`;

    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');

    const imageData = await generateImage(prompt);

    if (!imageData) {
      return NextResponse.json({ error: 'No image returned', details: 'API returned no image data' }, { status: 500 });
    }

    console.log('Image generated successfully');
    return NextResponse.json({ image: imageData });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate image',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
