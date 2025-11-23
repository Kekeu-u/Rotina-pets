'use client';

import { useCallback, useRef } from 'react';
import anime from 'animejs';

export function useAnime() {
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  // Celebracao de pontos flutuando
  const celebratePoints = useCallback((element: HTMLElement, points: number) => {
    const pointsEl = document.createElement('div');
    pointsEl.className = 'points-celebrate';
    pointsEl.textContent = `+${points}`;
    element.appendChild(pointsEl);

    anime({
      targets: pointsEl,
      translateY: [-20, -80],
      opacity: [1, 0],
      scale: [1, 1.5],
      duration: 1000,
      easing: 'easeOutExpo',
      complete: () => pointsEl.remove(),
    });
  }, []);

  // Confetti explosion
  const confetti = useCallback((container: HTMLElement, count = 30) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    for (let i = 0; i < count; i++) {
      const confettiEl = document.createElement('div');
      confettiEl.className = 'confetti-piece';
      confettiEl.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confettiEl.style.left = '50%';
      confettiEl.style.top = '50%';
      container.appendChild(confettiEl);

      anime({
        targets: confettiEl,
        translateX: anime.random(-150, 150),
        translateY: anime.random(-150, 100),
        rotate: anime.random(-360, 360),
        scale: [1, 0],
        opacity: [1, 0],
        duration: anime.random(800, 1200),
        easing: 'easeOutExpo',
        complete: () => confettiEl.remove(),
      });
    }
  }, []);

  // Shake effect for errors
  const shake = useCallback((element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [0, -10, 10, -10, 10, 0],
      duration: 500,
      easing: 'easeInOutSine',
    });
  }, []);

  // Pulse glow effect
  const pulseGlow = useCallback((element: HTMLElement) => {
    anime({
      targets: element,
      boxShadow: [
        '0 0 0 0 rgba(99, 102, 241, 0.4)',
        '0 0 0 20px rgba(99, 102, 241, 0)',
      ],
      duration: 600,
      easing: 'easeOutSine',
    });
  }, []);

  // Counter animation
  const animateCounter = useCallback((element: HTMLElement, from: number, to: number, duration = 1000) => {
    const obj = { value: from };
    anime({
      targets: obj,
      value: to,
      round: 1,
      duration,
      easing: 'easeOutExpo',
      update: () => {
        element.textContent = String(obj.value);
      },
    });
  }, []);

  // Stagger reveal animation
  const staggerReveal = useCallback((elements: HTMLElement[] | NodeListOf<Element>, delay = 50) => {
    anime({
      targets: elements,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(delay),
      duration: 600,
      easing: 'easeOutExpo',
    });
  }, []);

  // Bounce effect
  const bounce = useCallback((element: HTMLElement) => {
    anime({
      targets: element,
      scale: [1, 1.2, 1],
      duration: 400,
      easing: 'easeOutElastic(1, .5)',
    });
  }, []);

  // Success checkmark animation
  const successCheck = useCallback((element: HTMLElement) => {
    anime({
      targets: element,
      scale: [0, 1.2, 1],
      rotate: [0, 360],
      duration: 600,
      easing: 'easeOutElastic(1, .6)',
    });
  }, []);

  // Cancel any running animation
  const cancel = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
      animationRef.current = null;
    }
  }, []);

  return {
    celebratePoints,
    confetti,
    shake,
    pulseGlow,
    animateCounter,
    staggerReveal,
    bounce,
    successCheck,
    cancel,
  };
}
