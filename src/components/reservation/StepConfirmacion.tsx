"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Regional, Especialidad, Medico, SlotSeleccionado } from "@/mocks";

const DIAS  = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

interface StepConfirmacionProps {
  regional: Regional;
  especialidad: Especialidad;
  medico: Medico;
  slot: SlotSeleccionado;
  onDone: () => void;
}

export function StepConfirmacion({
  regional,
  especialidad,
  medico,
  slot,
  onDone,
}: StepConfirmacionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !checkRef.current) return;

    const len = checkRef.current.getTotalLength?.() ?? 120;
    gsap.set(checkRef.current, { strokeDasharray: len, strokeDashoffset: len });

    const tl = gsap.timeline();

    /* 1 — Checkmark que se dibuja */
    tl.to(checkRef.current, {
      strokeDashoffset: 0,
      duration: 0.7,
      ease: "power2.inOut",
      delay: 0.2,
    });

    /* 2 — Círculo exterior pulsa */
    tl.from(
      containerRef.current.querySelector("[data-circle]"),
      { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.6)" },
      "-=0.5"
    );

    /* 3 — Tarjeta de resumen aparece */
    tl.from(
      containerRef.current.querySelector("[data-summary]"),
      { opacity: 0, y: 30, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );

    /* 4 — Botón de vuelta */
    tl.from(
      containerRef.current.querySelector("[data-btn]"),
      { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" },
      "-=0.1"
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-full w-full px-10 gap-10"
    >
      {/* Ícono de éxito */}
      <div data-circle className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-success/10 border border-success/30" />
        <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20" aria-hidden>
          <path
            ref={checkRef}
            d="M18 42L32 56L62 26"
            stroke="var(--success)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <h2 className="font-display text-6xl font-light italic text-primary tracking-tight leading-none">
          ¡Reserva confirmada!
        </h2>
        <p className="font-ui text-xl text-muted mt-3">
          Su cita ha sido agendada exitosamente
        </p>
      </div>

      {/* Tarjeta de resumen */}
      <div
        data-summary
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface px-10 py-8"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="gold-divider mb-6 w-full" />

        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <SummaryItem label="Regional" value={regional.ciudad} />
          <SummaryItem label="Especialidad" value={especialidad.nombre} />
          <SummaryItem label="Médico" value={`${medico.titulo} ${medico.nombre}`} />
          <SummaryItem label="Horario" value={slot.hora} />
          <div className="col-span-2">
            <SummaryItem
              label="Fecha"
              value={`${DIAS[slot.fecha.getDay()]}, ${slot.fecha.getDate()} de ${MESES[slot.fecha.getMonth()]} ${slot.fecha.getFullYear()}`}
            />
          </div>
        </div>

        <div className="gold-divider mt-6 w-full" />
      </div>

      {/* Botón volver */}
      <button
        data-btn
        type="button"
        onClick={onDone}
        className="w-full max-w-2xl rounded-2xl py-6 bg-accent text-accent-fg font-display text-3xl font-light italic tracking-wide text-center transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        style={{ boxShadow: "var(--shadow-card)", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        Volver al menú principal
      </button>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-ui text-base uppercase tracking-[0.15em] text-gold font-bold mb-0.5">
        {label}
      </p>
      <p className="font-display text-2xl font-light text-primary italic leading-tight">
        {value}
      </p>
    </div>
  );
}
