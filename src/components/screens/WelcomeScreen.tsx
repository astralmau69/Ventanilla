"use client";

import { forwardRef, useMemo, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface WelcomeScreenProps {
  onStart: () => void;
  hour: number;
}

function greeting(h: number) {
  if (h < 12) return "Buenos Días";
  if (h < 19) return "Buenas Tardes";
  return "Buenas Noches";
}

/* ─── Emblema hospitalario SVG — estilo Old Money ─── */
function HospitalEmblem() {
  return (
    <div className="flex flex-col items-center gap-7" aria-label="Emblema del hospital">
      <div data-emblem>
        <svg
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-36 h-36"
          aria-hidden
        >
          {/* Anillo exterior dorado */}
          <circle cx="70" cy="70" r="66" stroke="var(--gold)" strokeWidth="1.2" />
          {/* Anillo interior más sutil */}
          <circle cx="70" cy="70" r="58" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
          {/* Cruz médica delgada y elegante */}
          <rect x="63" y="32" width="14" height="76" rx="3" fill="var(--primary-text)" />
          <rect x="32" y="63" width="76" height="14" rx="3" fill="var(--primary-text)" />
          {/* Cuatro puntos decorativos en las diagonales */}
          <circle cx="70" cy="16" r="2.5" fill="var(--gold)" opacity="0.6" />
          <circle cx="70" cy="124" r="2.5" fill="var(--gold)" opacity="0.6" />
          <circle cx="16" cy="70" r="2.5" fill="var(--gold)" opacity="0.6" />
          <circle cx="124" cy="70" r="2.5" fill="var(--gold)" opacity="0.6" />
        </svg>
      </div>

      <div className="text-center flex flex-col items-center gap-2">
        <p className="font-display text-3xl font-light tracking-[0.28em] text-primary uppercase">
          Hospital
        </p>
        {/* Línea dorada ornamental que se dibuja */}
        <svg
          data-ornament
          viewBox="0 0 80 2"
          className="w-20 h-px overflow-visible"
          aria-hidden
        >
          <line
            x1="0" y1="1" x2="80" y2="1"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-ui text-base tracking-[0.20em] text-muted uppercase font-normal">
          Centro Médico
        </p>
      </div>
    </div>
  );
}

export const WelcomeScreen = forwardRef<HTMLDivElement, WelcomeScreenProps>(
  function WelcomeScreen({ onStart, hour }, ref) {
    const words = useMemo(() => greeting(hour).split(" "), [hour]);

    useGSAP(() => {
      if (!ref || typeof ref === "function") return;
      const el = (ref as RefObject<HTMLDivElement>).current;
      if (!el) return;

      const tl = gsap.timeline({ delay: 0.25 });

      /* 1 — Stagger principal de los bloques */
      tl.from(el.querySelectorAll("[data-stagger]"), {
        opacity: 0,
        y: 36,
        duration: 0.9,
        stagger: 0.14,
        ease: "power3.out",
      });

      /* 2 — Palabras del saludo, ligeramente desfasadas */
      tl.from(
        el.querySelectorAll("[data-word]"),
        {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.11,
          ease: "power2.out",
        },
        "-=0.6"
      );

      /* 3 — Línea ornamental que se dibuja */
      const ornamentLine = el.querySelector("[data-ornament] line");
      if (ornamentLine) {
        const len = 80;
        gsap.set(ornamentLine, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(
          ornamentLine,
          { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" },
          "-=0.7"
        );
      }

      /* 4 — Flotación ambiental del emblema (loop infinito) */
      const emblem = el.querySelector("[data-emblem]");
      if (emblem) {
        gsap.to(emblem, {
          y: -10,
          duration: 3.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      /* 5 — Halo dorado pulsante en el CTA (loop infinito) */
      const cta = el.querySelector("[data-cta]");
      if (cta) {
        gsap.to(cta, {
          boxShadow:
            "0 0 0 10px rgba(176,141,87,0.14), 0 16px 48px rgba(13,31,60,0.18)",
          duration: 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.2,
        });
      }
    }, { scope: ref as RefObject<HTMLDivElement> });

    return (
      <section
        ref={ref}
        className="screen cursor-pointer select-none flex flex-col justify-center items-center bg-background"
        onClick={onStart}
        role="button"
        tabIndex={0}
        aria-label="Toque en cualquier lugar para comenzar"
        onKeyDown={(e) => e.key === "Enter" && onStart()}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-12 px-8">

          {/* Emblema */}
          <div data-stagger>
            <HospitalEmblem />
          </div>

          {/* Saludo — reveal palabra por palabra */}
          <div data-stagger className="text-center">
            <h1 className="font-display text-7xl font-light italic text-primary leading-none tracking-tight flex flex-wrap justify-center gap-x-5">
              {words.map((word, i) => (
                <span key={i} data-word className="inline-block">
                  {word}
                </span>
              ))}
            </h1>
          </div>

          {/* CTA — botón elegante */}
          <div data-stagger className="w-full">
            <div
              data-cta
              className="w-full bg-accent text-accent-fg rounded-2xl py-9 px-10 flex items-center justify-between gap-6 transition-all duration-200 active:scale-[0.98] active:opacity-90"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="font-display text-4xl font-light tracking-[0.12em] uppercase leading-none">
                Toque para comenzar
              </span>

              {/* Flecha SVG — no emoji */}
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
                aria-hidden
              >
                <circle cx="26" cy="26" r="25" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                <path
                  d="M18 26H34M26 18L34 26L26 34"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

        </div>
      </section>
    );
  }
);
