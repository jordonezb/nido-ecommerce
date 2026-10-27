import confetti from 'canvas-confetti';

/**
 * Dispara una celebración de confeti en pantalla completa.
 * Apto para Next.js (comprueba typeof window !== 'undefined').
 */
export function triggerCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ea580c', '#f97316', '#fdba74'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#8b5cf6', '#a855f7', '#d8b4fe'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
