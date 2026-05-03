"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getEspecialidades, type Especialidad } from "@/mocks";
import { ReservationHeader } from "./ReservationHeader";

interface StepEspecialidadProps {
  onSelect: (especialidad: Especialidad) => void;
  onBack: () => void;
}

/* Íconos SVG por especialidad */
const ICONS: Record<string, React.ReactElement> = {
  medgen: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="3" y="6" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 12h10M14 8v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  cardio: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M14 24S4 17 4 10a5 5 0 0110 0 5 5 0 0110 0c0 7-10 14-10 14z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  pediatr: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="9" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 24c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  trauma: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M8 4v20M20 4v20M8 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="5" y="2" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="17" y="2" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  gineco: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="11" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 18v6M10 22h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const FALLBACK_ICON = (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14 9v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export function StepEspecialidad({ onSelect, onBack }: StepEspecialidadProps) {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getEspecialidades().then((data) => {
      setEspecialidades(data);
      setLoading(false);
    });
  }, []);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll("[data-card]"), {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.07,
      ease: "power2.out",
      clearProps: "all",
    });
  }, { scope: containerRef, dependencies: [loading] });

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <ReservationHeader
        step={2}
        title="Elegir Especialidad"
        subtitle="¿Qué tipo de atención necesita?"
        onBack={onBack}
      />

      <div className="flex-1 px-10 py-8 overflow-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {especialidades.map((esp) => (
              <button
                key={esp.id}
                data-card
                type="button"
                onClick={() => onSelect(esp)}
                aria-label={esp.nombre}
                className={[
                  "group relative rounded-2xl border-2 border-border bg-surface text-left",
                  "flex flex-col gap-4 p-7 cursor-pointer select-none",
                  "transition-all duration-200 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  "hover:border-accent hover:bg-accent/[0.03] hover:shadow-md",
                ].join(" ")}
                style={{ boxShadow: "var(--shadow-sm)", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                {/* Flecha de acción */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                     className="absolute top-5 right-5 text-accent/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
                     aria-hidden>
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center text-accent">
                  {ICONS[esp.id] ?? FALLBACK_ICON}
                </div>
                <div>
                  <p className="font-display text-2xl font-light italic text-primary leading-tight">
                    {esp.nombre}
                  </p>
                  <p className="font-ui text-base text-muted mt-1 leading-snug">
                    {esp.descripcion}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
