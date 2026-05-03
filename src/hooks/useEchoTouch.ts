"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";

/**
 * Animación 2 — "Pulso de eco" para feedback táctil.
 * Pensado para adultos mayores: confirmación visual inmediata,
 * sin ripple agresivo.
 *
 * Uso:
 *   const { triggerEcho, ringRef } = useEchoTouch();
 *   <button onPointerDown={triggerEcho}>
 *     <span ref={ringRef} className="echo-ring" />
 *     Texto
 *   </button>
 */
export function useEchoTouch() {
  const ringRef = useRef<HTMLSpanElement | null>(null);

  const triggerEcho = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const btn = e.currentTarget as HTMLElement;
    const ring = ringRef.current;

    gsap.killTweensOf(btn);
    gsap.killTweensOf(ring);

    const tl = gsap.timeline();

    // El botón se hunde levemente y rebota suave.
    tl.to(btn, {
      scale: 0.97,
      duration: 0.12,
      ease: "power2.out",
    }).to(btn, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.55)",
    });

    // Anillo de eco expansivo en paralelo.
    if (ring) {
      tl.fromTo(
        ring,
        { scale: 0.85, opacity: 0.55 },
        {
          scale: 1.55,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        },
        0
      );
    }
  }, []);

  return { triggerEcho, ringRef };
}
