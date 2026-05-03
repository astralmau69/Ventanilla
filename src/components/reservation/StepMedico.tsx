"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getMedicos, type Medico, type Regional, type Especialidad } from "@/mocks";
import { ReservationHeader } from "./ReservationHeader";

interface StepMedicoProps {
  regional: Regional;
  especialidad: Especialidad;
  onSelect: (medico: Medico) => void;
  onBack: () => void;
}

const DIAS_NOMBRE = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function AvatarMedico({ nombre, titulo }: { nombre: string; titulo: string }) {
  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-16 h-16 rounded-full bg-accent text-accent-fg flex items-center justify-center font-display text-2xl font-light italic flex-shrink-0"
      aria-hidden
    >
      {titulo === "Dra." ? initials + "ₐ" : initials}
    </div>
  );
}

export function StepMedico({ regional, especialidad, onSelect, onBack }: StepMedicoProps) {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    getMedicos(especialidad.id, regional.id).then((data) => {
      setMedicos(data);
      setLoading(false);
    });
  }, [especialidad.id, regional.id]);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll("[data-card]"), {
      opacity: 0,
      y: 25,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "all",
    });
  }, { scope: containerRef, dependencies: [loading] });

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <ReservationHeader
        step={3}
        title="Elegir Médico"
        subtitle={`${especialidad.nombre} · ${regional.ciudad}`}
        onBack={onBack}
      />

      <div className="flex-1 px-10 py-8 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : medicos.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                <circle cx="18" cy="18" r="14" stroke="var(--muted-text)" strokeWidth="1.2" />
                <path d="M18 12v7M18 23v1.5" stroke="var(--muted-text)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-display text-3xl font-light italic text-muted">
              Sin médicos disponibles
            </p>
            <p className="font-ui text-xl text-subtle">
              No hay médicos de {especialidad.nombre} en {regional.ciudad}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
            {medicos.map((medico) => (
              <button
                key={medico.id}
                data-card
                type="button"
                onClick={() => onSelect(medico)}
                aria-label={`${medico.titulo} ${medico.nombre}`}
                className={[
                  "group rounded-2xl border-2 border-border bg-surface text-left",
                  "flex items-center gap-7 px-8 py-7 cursor-pointer select-none",
                  "transition-all duration-200 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  "hover:border-accent hover:bg-accent/[0.03] hover:shadow-md",
                ].join(" ")}
                style={{ boxShadow: "var(--shadow-sm)", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                <div
                  className="w-20 h-20 rounded-full bg-accent text-accent-fg flex items-center justify-center font-display text-2xl font-light italic flex-shrink-0"
                  aria-hidden
                >
                  {medico.nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-3xl font-light italic text-primary leading-tight">
                    {medico.titulo} {medico.nombre}
                  </p>
                  <p className="font-ui text-lg text-muted mt-1">
                    {especialidad.nombre}
                  </p>
                  {/* Días de atención */}
                  <div className="flex gap-2 mt-3">
                    {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                      const atiende = medico.diasAtencion.includes(dow);
                      return (
                        <span
                          key={dow}
                          className={[
                            "font-ui text-sm px-2.5 py-1 rounded-full border",
                            atiende
                              ? "border-accent text-accent bg-accent/5"
                              : "border-border text-muted/40",
                          ].join(" ")}
                        >
                          {DIAS_NOMBRE[dow]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Flecha */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted flex-shrink-0" aria-hidden>
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
