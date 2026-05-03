"use client";

import { useCallback } from "react";
import gsap from "gsap";

export function useScreenTransition() {
  return useCallback(
    (
      currentEl: HTMLElement | null,
      nextEl: HTMLElement | null,
      onComplete?: () => void
    ) => {
      if (!currentEl || !nextEl) {
        onComplete?.();
        return;
      }

      const tl = gsap.timeline({ onComplete });

      /*
       * FIX CLICK-THROUGH:
       * 1) Restaurar pointer-events en la pantalla entrante (puede tener
       *    "none" de una transición anterior).
       * 2) Desactivar pointer-events en la pantalla saliente en cuanto
       *    termina su fade — evita que reciba clics "a través" de las
       *    pantallas superiores.
       */
      gsap.set(nextEl, { pointerEvents: "" });

      /* Salida */
      tl.to(currentEl, {
        opacity: 0,
        scale: 0.97,
        y: -20,
        duration: 0.38,
        ease: "power3.in",
      });

      /* Deshabilitar clics en pantalla oculta */
      tl.set(currentEl, { pointerEvents: "none" });

      /* Entrada */
      tl.fromTo(
        nextEl,
        { opacity: 0, scale: 1.02, y: 28 },
        { opacity: 1, scale: 1, y: 0, duration: 0.50, ease: "power3.out" },
        "-=0.12"
      );

      /* Stagger de hijos */
      tl.fromTo(
        nextEl.querySelectorAll("[data-stagger]"),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        },
        "-=0.30"
      );

      return tl;
    },
    []
  );
}
