"use client";

import { forwardRef, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export interface MockPatient {
  name: string;
  carnet: string;
  initials: string;
}

interface MenuScreenProps {
  patient: MockPatient;
  onNewReservation: () => void;
  onHistory: () => void;
  onExit: () => void;
}

/* ─── Íconos SVG ─── */
function IconTicket() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="3" y="9" width="30" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 15h30M3 21h30" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="18" cy="18" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="4" y="7" width="28" height="24" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 14h28" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 4v6M24 4v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="9"  y="19" width="5" height="4" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="16" y="19" width="5" height="4" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="22" y="19" width="5" height="4" rx="1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function IconExit() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path d="M15 6H8a2 2 0 00-2 2v20a2 2 0 002 2h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 24l6-6-6-6M30 18H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Tarjeta de opción ─── */
interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant: "primary" | "surface" | "ghost";
  onClick: () => void;
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OptionCard({ icon, label, description, variant, onClick }: OptionCardProps) {
  const base = {
    primary: {
      card:  "bg-accent text-accent-fg border-2 border-transparent",
      icon:  "bg-white/15 text-accent-fg",
      desc:  "text-accent-fg/80",
      arrow: "text-accent-fg/60",
      shadow: "var(--shadow-card)",
    },
    surface: {
      card:  "bg-surface text-primary border-2 border-border hover:border-accent hover:bg-accent/[0.04]",
      icon:  "bg-background text-accent",
      desc:  "text-muted",
      arrow: "text-accent/50 group-hover:text-accent",
      shadow: "var(--shadow-sm)",
    },
    ghost: {
      card:  "bg-background text-primary border-2 border-border hover:border-border-strong hover:bg-surface",
      icon:  "bg-surface text-muted",
      desc:  "text-muted",
      arrow: "text-muted/40 group-hover:text-muted",
      shadow: "var(--shadow-xs)",
    },
  }[variant];

  return (
    <button
      data-card=""
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "group relative rounded-2xl transition-all duration-200 text-left",
        "flex flex-col gap-5 p-8 cursor-pointer select-none",
        "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        "min-h-[240px]",
        base.card,
      ].join(" ")}
      style={{
        boxShadow: base.shadow,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      {/* Flecha de acción — esquina superior derecha */}
      <div className={`absolute top-6 right-6 transition-all duration-200 group-hover:translate-x-1 ${base.arrow}`}>
        <ArrowIcon />
      </div>

      <div
        className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${base.icon}`}
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        {icon}
      </div>

      <div className="flex-1 flex flex-col justify-end gap-1.5">
        <h3 className="font-display text-4xl font-light italic leading-tight tracking-tight">
          {label}
        </h3>
        <p className={`font-ui text-lg leading-snug ${base.desc}`}>{description}</p>
      </div>
    </button>
  );
}

export const MenuScreen = forwardRef<HTMLDivElement, MenuScreenProps>(
  function MenuScreen({ patient, onNewReservation, onHistory, onExit }, ref) {
    /*
     * IMPORTANTE: useGSAP necesita un ref LOCAL como scope.
     * No se puede usar el forwardRef directamente como scope porque
     * su .current puede ser null en el momento que el hook se registra,
     * dejando las animaciones "from opacity:0" sin completar.
     */
    const innerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
      const el = innerRef.current;
      if (!el) return;

      const tl = gsap.timeline({ delay: 0.55 });

      /* Avatar: escala elástica */
      const avatar = el.querySelector("[data-avatar]");
      if (avatar) {
        tl.from(avatar, {
          scale: 0.5,
          opacity: 0,
          duration: 0.55,
          ease: "back.out(1.8)",
          clearProps: "all",
        }, 0);
      }

      /* Nombre: reveal clip-path */
      const name = el.querySelector("[data-patient-name]");
      if (name) {
        tl.from(name, {
          clipPath: "inset(0 100% 0 0)",
          duration: 0.65,
          ease: "power3.out",
          clearProps: "clipPath",
        }, 0.05);
      }

      /* Tarjetas: spring cascade — clearProps garantiza visibilidad final */
      const cards = el.querySelectorAll("[data-card]");
      if (cards.length) {
        tl.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.55,
          stagger: 0.09,
          ease: "back.out(1.2)",
          clearProps: "all",
        }, 0.1);
      }
    }, { scope: innerRef });

    return (
      <section
        ref={ref}
        className="screen justify-start pt-0 bg-background"
        style={{ opacity: 0 }}
        aria-label="Menú principal"
      >
        {/* innerRef envuelve todo el contenido para que useGSAP tenga scope válido */}
        <div ref={innerRef} className="flex flex-col w-full h-full">

          {/* ── Banner del paciente — panel solo lectura ── */}
          <div
            data-stagger
            className="w-full bg-surface border-b border-border border-l-4 border-l-gold/50 px-12 py-8 flex items-center gap-8 flex-shrink-0"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div
              data-avatar
              className="w-20 h-20 rounded-full flex-shrink-0 bg-accent text-accent-fg flex items-center justify-center font-display text-2xl font-light italic"
              style={{ boxShadow: "var(--shadow-md), inset 0 0 0 1px rgba(176,141,87,0.3)" }}
              aria-hidden
            >
              {patient.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-ui text-base font-bold tracking-[0.18em] uppercase text-gold mb-1">
                Paciente identificado
              </p>
              <h2
                data-patient-name
                className="font-display text-5xl font-light italic text-primary tracking-tight leading-none truncate"
                style={{ clipPath: "inset(0 0 0 0)" }}
              >
                {patient.name}
              </h2>
              <p className="font-ui text-lg text-muted mt-2 tracking-wide">
                C.I. {patient.carnet}
              </p>
            </div>

            <div className="flex-shrink-0 text-right hidden lg:flex flex-col items-end gap-1">
              <p className="font-ui text-sm tracking-[0.15em] uppercase text-muted font-bold">
                Su turno actual
              </p>
              <p className="font-display text-5xl font-light text-accent leading-none tracking-tight italic">
                A-012
              </p>
            </div>
          </div>

          {/* ── Título ── */}
          <div data-stagger className="w-full px-12 pt-9 pb-5 flex-shrink-0">
            <h3 className="font-display text-3xl font-light italic text-muted tracking-tight">
              ¿Qué desea hacer?
            </h3>
            <div className="gold-divider mt-3 w-56" />
          </div>

          {/* ── Tarjetas de opciones ── */}
          <div className="w-full px-12 pb-8 flex-1 flex items-start">
            <div className="grid grid-cols-3 gap-6 w-full">
              <OptionCard
                icon={<IconTicket />}
                label="Nueva Reserva"
                description="Solicitar una cita médica paso a paso"
                variant="primary"
                onClick={onNewReservation}
              />
              <OptionCard
                icon={<IconHistory />}
                label="Ver Reservas"
                description="Consultar citas y reservas anteriores"
                variant="surface"
                onClick={onHistory}
              />
              <OptionCard
                icon={<IconExit />}
                label="Salir"
                description="Finalizar sesión y regresar al inicio"
                variant="ghost"
                onClick={onExit}
              />
            </div>
          </div>

        </div>
      </section>
    );
  }
);
