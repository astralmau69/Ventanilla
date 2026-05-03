"use client";

import { forwardRef } from "react";
import { AlphanumericKeypad } from "@/components/AlphanumericKeypad";

interface CarnetScreenProps {
  carnet: string;
  onKey: (char: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

const MAX_LEN = 10;
const MIN_LEN = 3;

/* ─── Ícono de flecha SVG ─── */
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M11 4L6 9L11 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const CarnetScreen = forwardRef<HTMLDivElement, CarnetScreenProps>(
  function CarnetScreen({ carnet, onKey, onBackspace, onConfirm, onBack }, ref) {
    const canConfirm = carnet.length >= MIN_LEN;
    const slots = Array.from({ length: MAX_LEN }, (_, i) => carnet[i] ?? "");

    return (
      <section
        ref={ref}
        className="screen justify-start pt-0 bg-background"
        style={{ opacity: 0 }}
        aria-label="Ingreso de carnet"
      >
        {/* ── Cabecera slim ── */}
        <div className="absolute top-0 left-0 right-0 z-10 px-10 py-5 flex items-center justify-between bg-surface/90 border-b border-border backdrop-blur-sm">
          <button
            data-stagger
            onClick={onBack}
            aria-label="Volver al inicio"
            className="flex items-center gap-2.5 text-muted hover:text-primary transition-colors duration-200 font-ui text-lg tracking-[0.10em] uppercase font-bold"
            style={{ touchAction: "manipulation" }}
          >
            <IconBack />
            Cancelar
          </button>

          {/* Indicador de pasos */}
          <div data-stagger className="flex items-center gap-4">
            <span className="font-display text-xl italic text-muted">
              Paso I de III
            </span>
            <div className="flex gap-2 items-center">
              <div className="w-10 h-0.5 rounded-full bg-accent" />
              <div className="w-10 h-0.5 rounded-full bg-border" />
              <div className="w-10 h-0.5 rounded-full bg-border" />
            </div>
          </div>
        </div>

        {/* ── Contenido ── */}
        <div className="flex flex-col items-center w-full max-w-4xl gap-7 pt-24">

          {/* Título */}
          <div className="flex flex-col items-center gap-2">
            <h2 data-stagger className="font-display text-6xl font-light italic text-primary text-center tracking-tight leading-none">
              Ingrese su Carnet
            </h2>
            <p data-stagger className="font-ui text-xl text-muted text-center tracking-wide">
              Número de CI o matrícula — {MIN_LEN} a {MAX_LEN} caracteres
            </p>
          </div>

          {/* ── Display de caracteres — estilo subrayado elegante ── */}
          <div
            data-stagger
            className="flex gap-3"
            role="presentation"
            aria-label={`Carnet ingresado: ${carnet || "vacío"}`}
          >
            {slots.map((char, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-13" aria-hidden>
                {/* Carácter */}
                <span
                  className={[
                    "font-display text-5xl font-light leading-none h-16 flex items-center justify-center w-13 transition-all duration-200",
                    char
                      ? "text-primary scale-100"
                      : i === carnet.length
                      ? "text-gold/60 animate-pulse"
                      : "text-border/50",
                  ].join(" ")}
                >
                  {char || (i === carnet.length ? "·" : "")}
                </span>

                {/* Línea inferior */}
                <div
                  className={[
                    "h-px w-full rounded-full transition-all duration-300",
                    char
                      ? "bg-gold"
                      : i === carnet.length
                      ? "bg-gold/40"
                      : "bg-border",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>

          {/* Teclado */}
          <div data-stagger className="w-full flex justify-center px-4">
            <AlphanumericKeypad
              onKey={onKey}
              onBackspace={onBackspace}
              onConfirm={onConfirm}
              canConfirm={canConfirm}
            />
          </div>
        </div>
      </section>
    );
  }
);
