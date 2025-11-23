'use client';

import { useState } from 'react';
import { usePet } from '@/context/PetContext';
import { SHOP_PRODUCTS, DEFAULT_PHOTO } from '@/lib/constants';
import { Dog, Sparkles, Download, X } from 'lucide-react';

export default function Shop() {
  const { state, aiConfigured, saveProductPreview } = usePet();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{ image: string; productName: string } | null>(null);

  const hasPhoto = state.pet?.photo && state.pet.photo !== DEFAULT_PHOTO;

  const handleGenerateImage = async (productId: string, productName: string, productDescription: string) => {
    if (!state.pet) return;

    setGenerating(productId);

    try {
      const res = await fetch('/api/ai/pet-with-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: state.pet.name,
          petBreed: state.pet.breed,
          productName,
          productDescription,
        }),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (data.image) {
        saveProductPreview(productId, data.image);
        setGeneratedImage({ image: data.image, productName });
      } else {
        const errorMsg = data.details || data.error || 'Erro desconhecido';
        alert(`Não foi possível gerar a imagem: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      alert(`Erro ao gerar imagem: ${error?.message || 'Erro de rede'}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shop Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-700/30">
        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-indigo-500 overflow-hidden flex items-center justify-center relative">
          {hasPhoto ? (
            <img src={state.pet?.photo || ''} alt={state.pet?.name} className="w-full h-full object-cover" />
          ) : (
            <Dog className="w-8 h-8 text-gray-400" />
          )}
          <div className="absolute -bottom-1 -right-1 text-sm">✨</div>
        </div>
        <div>
          <h3 className="font-semibold">Presentes para {state.pet?.name || 'seu pet'}!</h3>
          <p className="text-sm text-gray-400">Brinquedos selecionados para seu pet</p>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {SHOP_PRODUCTS.map((product) => {
          const hasPreview = !!state.productPreviews[product.id];
          const previewImg = state.productPreviews[product.id];
          const isGenerating = generating === product.id;

          return (
            <div key={product.id} className="space-y-2">
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-indigo-500 transition-all relative"
              >
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 relative">
                  <img
                    src={hasPreview ? previewImg : product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasPreview && (
                    <div className="absolute bottom-0 right-0 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 px-1 rounded-tl text-white">
                      ✨ IA
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <p className="text-xs text-gray-400">{product.description}</p>
                  <span className="text-green-400 font-semibold">{product.price}</span>
                </div>
                <div className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-purple-500/30 rounded">
                  {product.badge}
                </div>
              </a>

              {aiConfigured && (
                <button
                  onClick={() => handleGenerateImage(product.id, product.name, product.description)}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-purple-700/30 rounded-lg text-purple-300 text-sm hover:border-purple-500 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{hasPreview ? 'Gerar nova' : `Ver ${state.pet?.name || 'pet'} com esse!`}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 pt-2">
        Comprando aqui você ajuda o PetCare! 💜
      </p>

      {/* Generated Image Modal */}
      {generatedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setGeneratedImage(null)}>
          <div className="bg-gray-900 rounded-2xl p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img src={generatedImage.image} alt={generatedImage.productName} className="w-full" />
            </div>
            <h3 className="text-center font-semibold mb-2">{state.pet?.name} adorou! 🎉</h3>
            <p className="text-center text-sm text-gray-400 mb-4">Imagem salva na loja!</p>
            <div className="flex gap-2">
              <button
                onClick={() => setGeneratedImage(null)}
                className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
              <a
                href={generatedImage.image}
                download={`${state.pet?.name}-${generatedImage.productName}.png`}
                className="flex-1 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
