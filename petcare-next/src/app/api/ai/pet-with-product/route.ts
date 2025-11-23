import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isConfigured } from '@/lib/pollinations';

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed, productName, productDescription } = await request.json();

    // Prompt otimizado para Pollinations/Flux
    const prompt = `Cute photorealistic ${petBreed} dog named ${petName} happily playing with ${productName}, ${productDescription}. Happy dog, bright cheerful lighting, high quality pet photography, adorable, joyful expression`;

    console.log('Generating image with Pollinations, prompt:', prompt.substring(0, 100) + '...');

    const imageData = await generateImage(prompt, {
      width: 512,
      height: 512,
      model: 'flux-realism'
    });

    if (!imageData) {
      return NextResponse.json({ error: 'No image returned', details: 'API returned no image data' }, { status: 500 });
    }

    console.log('Image generated successfully with Pollinations');
    return NextResponse.json({ image: imageData });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate image',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
