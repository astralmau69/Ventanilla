"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  getRollingWindow,
  getEstadoSlot,
  doctorAttendsDate,
  type Medico,
  type SlotSeleccionado,
} from "@/mocks";
import { ReservationHeader } from "./ReservationHeader";

interface StepHorarioProps {
  medico: Medico;
  onConfirm: (slot: SlotSeleccionado) => void;
  onBack: () => void;
}

/* ── Helpers de formato (sin toLocaleDateString para evitar hydration) ── */
const DIAS  = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDay(date: Date) {
  return {
    dayName: DIAS[date.getDay()],
    dayNum: date.getDate(),
    month: MESES[date.getMonth()],
  };
}

/* ── Buscar el primer día disponible para un médico ── */
function firstAvailableIndex(medico: Medico, dates: Date[]): number {
  const idx = dates.findIndex(
    (d) =>
      doctorAttendsDate(medico, d) &&
      medico.horariosDisponibles.some(
        (h) => getEstadoSlot(medico, d, h) === "libre"
      )
  );
  return idx >= 0 ? idx : 0;
}

export function StepHorario({ medico, onConfirm, onBack }: StepHorarioProps) {
  /* Fechas: generadas una sola vez en el cliente */
  const [dates] = useState<Date[]>(() => getRollingWindow());
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() =>
    firstAvailableIndex(medico, getRollingWindow())
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Anima la cuadrícula de slots al cambiar de día */
  const animateSlots = () => {
    if (!slotsRef.current) return;
    gsap.from(slotsRef.current.querySelectorAll("[data-slot]"), {
      opacity: 0,
      scale: 0.92,
      duration: 0.3,
      stagger: 0.03,
      ease: "power2.out",
      clearProps: "all",
    });
  };

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll("[data-day-tab]"), {
      opacity: 0,
      y: 16,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
      clearProps: "all",
    });
    animateSlots();
  }, { scope: containerRef });

  const isDayFullyBooked = (date: Date) =>
    doctorAttendsDate(medico, date) &&
    medico.horariosDisponibles.every(
      (h) => getEstadoSlot(medico, date, h) === "ocupada"
    );

  const handleDaySelect = (idx: number) => {
    if (!doctorAttendsDate(medico, dates[idx])) return;
    if (isDayFullyBooked(dates[idx])) return;
    setSelectedDayIdx(idx);
    setSelectedSlot(null);
    // pequeña pausa para que React actualice el DOM
    setTimeout(animateSlots, 10);
  };

  const selectedDate = dates[selectedDayIdx];
  const doctorAttendsDay = doctorAttendsDate(medico, selectedDate);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <ReservationHeader
        step={4}
        title="Elegir Horario"
        subtitle={`${medico.titulo} ${medico.nombre}`}
        onBack={onBack}
      />

      {/* ── Tabs de días (ventana de 8 días) ── */}
      <div className="flex-shrink-0 px-10 pt-6 pb-4 border-b border-border">
        <div className="flex gap-3">
          {dates.map((date, idx) => {
            const { dayName, dayNum, month } = formatDay(date);
            const attends = doctorAttendsDate(medico, date);
            const fullyBooked = attends && isDayFullyBooked(date);
            const isSelected = idx === selectedDayIdx;
            const isBlocked = !attends || fullyBooked;

            return (
              <button
                key={idx}
                data-day-tab
                type="button"
                onClick={() => handleDaySelect(idx)}
                disabled={isBlocked}
                aria-label={`${dayName} ${dayNum} de ${month}${!attends ? " — no atiende" : fullyBooked ? " — sin fichas" : ""}`}
                aria-pressed={isSelected}
                className={[
                  "relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all duration-150 flex-1",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  !attends
                    /* No atiende — muy tenue */
                    ? "border-border/30 bg-transparent text-muted/25 cursor-default opacity-50"
                    : fullyBooked
                    /* Completamente ocupado — rojo sólido y prominente */
                    ? "border-2 border-danger bg-danger/15 text-danger cursor-not-allowed shadow-sm"
                    : isSelected
                    /* Seleccionado */
                    ? "border-accent bg-accent text-accent-fg shadow-md"
                    /* Disponible */
                    : "border-2 border-border bg-surface text-primary hover:border-accent hover:bg-accent/[0.04] hover:shadow-sm",
                ].join(" ")}
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              >
                {/* Ícono de candado para días totalmente ocupados */}
                {fullyBooked && (
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className="absolute top-2 right-2 text-danger"
                    aria-hidden
                  >
                    <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
                <span className="font-ui text-base font-bold uppercase tracking-wide leading-none">
                  {dayName}
                </span>
                <span className={["font-display text-2xl font-light italic leading-none", fullyBooked ? "line-through opacity-60" : ""].join(" ")}>
                  {dayNum}
                </span>
                <span className={["font-ui text-sm leading-none", fullyBooked ? "font-bold tracking-tight" : "opacity-70"].join(" ")}>
                  {fullyBooked ? "Completo" : month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cuadrícula de slots ── */}
      <div className="flex-1 px-10 py-6 overflow-auto">
        {!doctorAttendsDay ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <p className="font-display text-3xl font-light italic text-muted/50">
              El médico no atiende este día
            </p>
            <p className="font-ui text-lg text-subtle">
              Seleccione otro día en el calendario de arriba
            </p>
          </div>
        ) : (
          <div ref={slotsRef} className="grid grid-cols-4 gap-4">
            {medico.horariosDisponibles.map((hora) => {
              const estado = getEstadoSlot(medico, selectedDate, hora);
              const isSelected = selectedSlot === hora;

              if (estado === "libre" && !isSelected) {
                return (
                  /* ── LIBRE ── */
                  <button
                    key={hora}
                    data-slot
                    type="button"
                    onClick={() => setSelectedSlot(hora)}
                    aria-label={`${hora} — disponible`}
                    className={[
                      "group rounded-xl border-2 border-accent bg-accent/8",
                      "flex flex-col items-center justify-center gap-1.5 py-5",
                      "transition-all duration-150 cursor-pointer shadow-sm",
                      "hover:bg-accent hover:text-accent-fg hover:shadow-md active:scale-[0.96]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    ].join(" ")}
                    style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                  >
                    {/* check pequeño */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                         className="text-accent group-hover:text-accent-fg transition-colors" aria-hidden>
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-ui text-2xl font-bold text-accent group-hover:text-accent-fg leading-none transition-colors">{hora}</span>
                    <span className="font-ui text-xs text-accent/70 group-hover:text-accent-fg/80 uppercase tracking-widest leading-none transition-colors">Disponible</span>
                  </button>
                );
              }

              if (estado === "libre" && isSelected) {
                return (
                  /* ── SELECCIONADO ── */
                  <button
                    key={hora}
                    data-slot
                    type="button"
                    onClick={() => setSelectedSlot(hora)}
                    aria-label={`${hora} — seleccionado`}
                    aria-pressed
                    className={[
                      "rounded-xl border-2 border-accent bg-accent",
                      "flex flex-col items-center justify-center gap-1.5 py-5",
                      "transition-all duration-150 cursor-pointer scale-[1.04] shadow-lg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    ].join(" ")}
                    style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent-fg" aria-hidden>
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-ui text-2xl font-bold text-accent-fg leading-none">{hora}</span>
                    <span className="font-ui text-xs text-accent-fg/80 uppercase tracking-widest leading-none">Seleccionado</span>
                  </button>
                );
              }

              /* ── OCUPADA ── */
              return (
                <div
                  key={hora}
                  data-slot
                  role="img"
                  aria-label={`${hora} — ocupado`}
                  className={[
                    "rounded-xl border-2 border-danger bg-danger/12",
                    "flex flex-col items-center justify-center gap-1.5 py-5",
                  ].join(" ")}
                >
                  {/* X en círculo */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-danger" aria-hidden>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="font-ui text-2xl font-bold text-danger leading-none line-through">{hora}</span>
                  <span className="font-ui text-xs text-danger/80 uppercase tracking-widest leading-none font-semibold">Ocupado</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Barra de confirmación ── */}
      <div className="flex-shrink-0 px-10 py-5 border-t border-border bg-surface/90 backdrop-blur-sm">
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => {
            if (selectedSlot) onConfirm({ fecha: selectedDate, hora: selectedSlot });
          }}
          className={[
            "w-full rounded-2xl py-6 font-display text-3xl font-light italic tracking-wide",
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            selectedSlot
              ? "bg-accent text-accent-fg shadow-card active:scale-[0.98] cursor-pointer"
              : "bg-surface border border-border text-muted/40 cursor-not-allowed",
          ].join(" ")}
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          aria-disabled={!selectedSlot}
        >
          {selectedSlot
            ? `Confirmar cita — ${DIAS[selectedDate.getDay()]} ${selectedDate.getDate()} · ${selectedSlot}`
            : "Seleccione un horario disponible"}
        </button>
      </div>
    </div>
  );
}
