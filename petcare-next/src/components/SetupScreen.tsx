'use client';

import { useState, useRef } from 'react';
import { usePet } from '@/context/PetContext';
import { DEFAULT_PHOTO } from '@/lib/constants';

export default function SetupScreen() {
  const { setPet } = usePet();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim()) return;

    setPet({
      name: name.trim(),
      breed: breed.trim(),
      photo: photo || DEFAULT_PHOTO,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
        PetCare
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 mx-auto rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden"
        >
          {photo ? (
            <img src={photo} alt="Pet" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-4xl">🐕</span>
              <span className="text-xs text-gray-400 mt-1">Adicionar foto</span>
            </>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do pet"
          className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />

        <input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Raça"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />

        <button
          type="submit"
          className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all"
        >
          Começar
        </button>
      </form>
    </div>
  );
}
