import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndCombineImages, isConfigured as isGeminiConfigured } from '@/lib/gemini';
import { generateImage as generatePollinationsImage, isConfigured as isPollinationsConfigured } from '@/lib/pollinations';

/**
 * API para combinar duas imagens de referência (pet + produto)
 * Cria uma cena emocionante do pet brincando com o produto
 * para incentivar a compra através do sentimento
 */
export async function POST(request: NextRequest) {
  // Verifica se pelo menos Pollinations está disponível
  if (!isPollinationsConfigured()) {
    return NextResponse.json(
      { error: 'Image generation API not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { petImage, productImage, petName, petBreed, productName } = body;

    // Validação
    if (!petImage) {
      return NextResponse.json(
        { error: 'Pet image is required' },
        { status: 400 }
      );
    }

    if (!productImage) {
      return NextResponse.json(
        { error: 'Product image is required' },
        { status: 400 }
      );
    }

    let finalPrompt: string;

    // Se Gemini está configurado, usa análise de imagem para prompt mais preciso
    if (isGeminiConfigured()) {
      console.log('Using Gemini for image analysis...');

      const analysisResult = await analyzeAndCombineImages(
        petImage,
        productImage,
        petName,
        petBreed
      );

      if (analysisResult) {
        finalPrompt = analysisResult.combinedPrompt;
        console.log('Combined prompt generated:', finalPrompt.substring(0, 100) + '...');
      } else {
        // Fallback se análise falhar
        console.log('Image analysis failed, using fallback prompt');
        finalPrompt = buildFallbackPrompt(petName, petBreed, productName);
      }
    } else {
      // Fallback sem Gemini - usa apenas descrições textuais
      console.log('Gemini not configured, using fallback prompt');
      finalPrompt = buildFallbackPrompt(petName, petBreed, productName);
    }

    // Gera a imagem combinada usando Pollinations
    console.log('Generating combined image with Pollinations...');

    const generatedImage = await generatePollinationsImage(finalPrompt, {
      width: 512,
      height: 512,
      model: 'flux'
    });

    if (!generatedImage) {
      return NextResponse.json(
        { error: 'Failed to generate combined image' },
        { status: 500 }
      );
    }

    console.log('Combined image generated successfully!');

    return NextResponse.json({
      image: generatedImage,
      prompt: finalPrompt
    });
  } catch (error: any) {
    console.error('Combine images error:', error);
    return NextResponse.json(
      {
        error: 'Failed to combine images',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Prompt de fallback quando Gemini não está disponível
 */
function buildFallbackPrompt(
  petName?: string,
  petBreed?: string,
  productName?: string
): string {
  const pet = petBreed || 'dog';
  const name = petName ? `named ${petName}` : '';
  const product = productName || 'a colorful pet toy';

  return `Photorealistic image of a cute happy ${pet} ${name} joyfully playing with ${product}. The pet looks excited and having fun. Warm, bright lighting, cozy home environment, high quality pet photography, heartwarming scene, adorable expression, professional photo. 4k, detailed.`;
}
