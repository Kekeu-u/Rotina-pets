'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Package, RefreshCw, AlertCircle } from 'lucide-react';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  price?: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
  onMetadataLoaded?: (metadata: LinkMetadata) => void;
  className?: string;
  compact?: boolean;
}

export default function LinkPreview({ url, onMetadataLoaded, className = '', compact = false }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!url) return;

      setLoading(true);
      setError(null);
      setImageLoaded(false);
      setImageError(false);

      try {
        const res = await fetch('/api/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load preview');
        }

        setMetadata(data);
        onMetadataLoaded?.(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url, onMetadataLoaded]);

  if (loading) {
    return (
      <div className={`glass-task p-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-[var(--background-secondary)] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--background-secondary)] rounded w-3/4"></div>
            <div className="h-3 bg-[var(--background-secondary)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`glass-task p-4 flex items-center gap-3 group ${className}`}
      >
        <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--foreground-secondary)] truncate">{url}</p>
          <p className="text-xs text-red-400">{error}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-[var(--foreground-secondary)] group-hover:text-white transition-colors" />
      </a>
    );
  }

  if (!metadata) return null;

  if (compact) {
    return (
      <a
        href={metadata.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`glass-task flex items-center gap-3 p-3 group ${className}`}
      >
        {/* Imagem do produto */}
        <div className="w-14 h-14 rounded-xl bg-[var(--background-secondary)] overflow-hidden flex-shrink-0 relative shadow-lg group-hover:shadow-indigo-500/20 transition-shadow duration-300">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Package className="w-6 h-6 text-indigo-400" />
            </div>
          ) : (
            <img
              src={metadata.image}
              alt={metadata.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {/* Badge Mercado Livre */}
          <div className="absolute bottom-0 right-0 text-[10px] bg-gradient-to-r from-yellow-500 to-yellow-400 px-1.5 py-0.5 rounded-tl-lg text-black font-bold">
            ML
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm group-hover:text-white transition-colors line-clamp-1">{metadata.title}</h4>
          <p className="text-xs text-gray-400 line-clamp-1">{metadata.description}</p>
          {metadata.price && (
            <span className="text-emerald-400 font-bold text-sm">{metadata.price}</span>
          )}
        </div>

        <ExternalLink className="w-4 h-4 text-[var(--foreground-secondary)] group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      </a>
    );
  }

  // Full preview card
  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass-card block overflow-hidden group ${className}`}
    >
      {/* Imagem grande do produto */}
      <div className="relative aspect-video bg-[var(--background-secondary)] overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Package className="w-12 h-12 text-indigo-400" />
          </div>
        ) : (
          <img
            src={metadata.image}
            alt={metadata.title}
            className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge Mercado Livre */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-yellow-400 rounded-lg">
          <span className="text-xs font-bold text-black">Mercado Livre</span>
        </div>

        {/* Preco overlay */}
        {metadata.price && (
          <div className="absolute bottom-2 right-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-lg">
            <span className="text-white font-bold">{metadata.price}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-base group-hover:text-white transition-colors line-clamp-2 mb-1">
          {metadata.title}
        </h3>
        {metadata.description && (
          <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2">
            {metadata.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 text-indigo-400 text-sm">
          <ExternalLink className="w-4 h-4" />
          <span className="group-hover:underline">Ver no Mercado Livre</span>
        </div>
      </div>
    </a>
  );
}

// Hook para usar o preview de link programaticamente
export function useLinkPreview(url: string) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load preview');
      }

      setMetadata(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load preview');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { metadata, loading, error, fetchPreview };
}
