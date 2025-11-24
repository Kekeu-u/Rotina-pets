import { NextRequest, NextResponse } from 'next/server';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  price?: string;
  url: string;
}

// Extrai conteúdo de uma meta tag
function extractMetaContent(html: string, property: string): string | null {
  // Tenta og:property primeiro
  const ogRegex = new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i');
  const ogMatch = html.match(ogRegex);
  if (ogMatch) return ogMatch[1];

  // Tenta content antes de property
  const ogRegex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i');
  const ogMatch2 = html.match(ogRegex2);
  if (ogMatch2) return ogMatch2[1];

  // Tenta meta name
  const nameRegex = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i');
  const nameMatch = html.match(nameRegex);
  if (nameMatch) return nameMatch[1];

  return null;
}

// Extrai preço do Mercado Livre
function extractPrice(html: string): string | null {
  // Tenta encontrar o preço no JSON-LD
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
        const data = JSON.parse(jsonContent);
        if (data.offers?.price) {
          return `R$ ${parseFloat(data.offers.price).toFixed(2).replace('.', ',')}`;
        }
        if (data.price) {
          return `R$ ${parseFloat(data.price).toFixed(2).replace('.', ',')}`;
        }
      } catch {
        // Ignora erros de parsing
      }
    }
  }

  // Tenta encontrar pelo og:price
  const ogPrice = extractMetaContent(html, 'price:amount');
  if (ogPrice) {
    return `R$ ${parseFloat(ogPrice).toFixed(2).replace('.', ',')}`;
  }

  return null;
}

// Valida se é um link do Mercado Livre
function isMercadoLivreUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('mercadolivre.com') ||
           parsedUrl.hostname.includes('mercadolibre.com') ||
           parsedUrl.hostname.includes('mlstatic.com');
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!isMercadoLivreUrl(url)) {
      return NextResponse.json({ error: 'Only Mercado Livre URLs are supported' }, { status: 400 });
    }

    // Fetch da página com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
    }

    const html = await response.text();

    // Extrai metadados
    const title = extractMetaContent(html, 'title') ||
                  html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
                  'Produto Mercado Livre';

    const description = extractMetaContent(html, 'description') || '';

    let image = extractMetaContent(html, 'image') || '';

    // Se a imagem for relativa, torna absoluta
    if (image && !image.startsWith('http')) {
      const baseUrl = new URL(url);
      image = new URL(image, baseUrl.origin).toString();
    }

    // Melhora a qualidade da imagem do ML (remove _S, _Q por _F para full size)
    if (image.includes('mlstatic.com')) {
      image = image.replace(/_[SQM]\./, '_F.');
      // Garante que pegamos a versão 2X se disponível
      if (!image.includes('2X')) {
        image = image.replace('/D_NQ_NP_', '/D_NQ_NP_2X_');
      }
    }

    const price = extractPrice(html);

    const metadata: LinkMetadata = {
      title: decodeHTMLEntities(title),
      description: decodeHTMLEntities(description),
      image,
      price: price || undefined,
      url,
    };

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Link preview error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }

    return NextResponse.json({
      error: 'Failed to get link preview',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Decodifica entidades HTML
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
    '&nbsp;': ' ',
  };

  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
}
