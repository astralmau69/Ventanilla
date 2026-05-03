"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { getRegionales, type Regional } from "@/mocks";
import { ReservationHeader } from "./ReservationHeader";

interface StepRegionalProps {
  onSelect: (regional: Regional) => void;
  onBack: () => void;
}

function IconPin() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 2C9.58 2 6 5.58 6 10c0 6.5 8 16 8 16s8-9.5 8-16c0-4.42-3.58-8-8-8z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      <circle cx="14" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function StepRegional({ onSelect, onBack }: StepRegionalProps) {
  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRegionales().then((data) => {
      setRegionales(data);
      setLoading(false);
    });
  }, []);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll("[data-card]"), {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "all",
    });
  }, { scope: containerRef, dependencies: [loading] });

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <ReservationHeader
        step={1}
        title="Elegir Regional"
        subtitle="Seleccione el centro de atención más cercano"
        onBack={onBack}
      />

      <div className="flex-1 px-10 py-8 overflow-auto">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {regionales.map((regional) => (
              <button
                key={regional.id}
                data-card
                type="button"
                onClick={() => onSelect(regional)}
                aria-label={regional.nombre}
                className={[
                  "group relative rounded-2xl border-2 border-border bg-surface text-left",
                  "flex flex-col gap-4 p-8 cursor-pointer select-none",
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
                  <IconPin />
                </div>
                <div>
                  <p className="font-display text-3xl font-light italic text-primary leading-tight tracking-tight">
                    {regional.ciudad}
                  </p>
                  <p className="font-ui text-lg text-muted mt-1">
                    {regional.departamento}
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
