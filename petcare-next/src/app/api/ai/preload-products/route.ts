import { NextRequest, NextResponse } from 'next/server';
import { getImageUrl, isConfigured } from '@/lib/pollinations';
import { SHOP_PRODUCTS } from '@/lib/constants';

// Gera uma seed determinística baseada no pet e produto
// Isso garante que a mesma combinação sempre gere a mesma imagem
function generateDeterministicSeed(petName: string, petBreed: string, productId: string): number {
  const str = `${petName}-${petBreed}-${productId}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { petName, petBreed, productIds } = await request.json();

    if (!petName || !petBreed) {
      return NextResponse.json({ error: 'Missing pet info' }, { status: 400 });
    }

    // Filtra produtos se especificados, senão usa todos
    const products = productIds
      ? SHOP_PRODUCTS.filter(p => productIds.includes(p.id))
      : SHOP_PRODUCTS;

    // Gera URLs determinísticas para cada produto
    const preloadUrls: Record<string, { url: string; seed: number }> = {};

    for (const product of products) {
      const seed = generateDeterministicSeed(petName, petBreed, product.id);

      const prompt = `Cute photorealistic ${petBreed} dog named ${petName} happily playing with ${product.name}, ${product.description}. Happy dog, bright cheerful lighting, high quality pet photography, adorable, joyful expression`;

      const imageUrl = getImageUrl(prompt, {
        width: 512,
        height: 512,
        seed,
        model: 'nanobanana'
      });

      preloadUrls[product.id] = {
        url: imageUrl,
        seed
      };
    }

    return NextResponse.json({
      success: true,
      preloadUrls,
      petHash: generateDeterministicSeed(petName, petBreed, 'pet-hash').toString()
    });
  } catch (error: any) {
    console.error('Preload error:', error);
    return NextResponse.json({
      error: 'Failed to generate preload URLs',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
