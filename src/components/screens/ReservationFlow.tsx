"use client";

import { forwardRef, useState, useCallback } from "react";
import gsap from "gsap";
import type { Regional, Especialidad, Medico, SlotSeleccionado } from "@/mocks";
import { StepRegional } from "@/components/reservation/StepRegional";
import { StepEspecialidad } from "@/components/reservation/StepEspecialidad";
import { StepMedico } from "@/components/reservation/StepMedico";
import { StepHorario } from "@/components/reservation/StepHorario";
import { StepConfirmacion } from "@/components/reservation/StepConfirmacion";

type SubStep = "regional" | "especialidad" | "medico" | "horario" | "confirmacion";

interface ReservationFlowProps {
  onBack: () => void;    // Volver al menú principal
  onComplete: () => void; // Después de confirmar → volver al menú
  pacienteNombre: string;
  pacienteCarnet: string;
}

export const ReservationFlow = forwardRef<HTMLDivElement, ReservationFlowProps>(
  function ReservationFlow({ onBack, onComplete, pacienteNombre, pacienteCarnet }, ref) {
    const [subStep, setSubStep] = useState<SubStep>("regional");
    const [regional, setRegional] = useState<Regional | null>(null);
    const [especialidad, setEspecialidad] = useState<Especialidad | null>(null);
    const [medico, setMedico] = useState<Medico | null>(null);
    const [slot, setSlot] = useState<SlotSeleccionado | null>(null);

    /* Animación de entrada para cada sub-pantalla */
    const animateIn = useCallback((el: HTMLElement | null) => {
      if (!el) return;
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, []);

    /* ─── Handlers de navegación ─── */
    const handleRegional = useCallback((r: Regional) => {
      setRegional(r);
      setSubStep("especialidad");
    }, []);

    const handleEspecialidad = useCallback((e: Especialidad) => {
      setEspecialidad(e);
      setSubStep("medico");
    }, []);

    const handleMedico = useCallback((m: Medico) => {
      setMedico(m);
      setSubStep("horario");
    }, []);

    const handleSlot = useCallback((s: SlotSeleccionado) => {
      setSlot(s);
      setSubStep("confirmacion");
    }, []);

    const handleBack = useCallback(() => {
      switch (subStep) {
        case "regional":      onBack(); break;
        case "especialidad":  setSubStep("regional"); break;
        case "medico":        setSubStep("especialidad"); break;
        case "horario":       setSubStep("medico"); break;
        case "confirmacion":  setSubStep("horario"); break;
      }
    }, [subStep, onBack]);

    return (
      <section
        ref={ref}
        className="screen justify-start pt-0 bg-background"
        style={{ opacity: 0 }}
        aria-label="Flujo de reserva médica"
      >
        {subStep === "regional" && (
          <StepRegional
            key="regional"
            onSelect={handleRegional}
            onBack={handleBack}
          />
        )}

        {subStep === "especialidad" && (
          <StepEspecialidad
            key="especialidad"
            onSelect={handleEspecialidad}
            onBack={handleBack}
          />
        )}

        {subStep === "medico" && regional && especialidad && (
          <StepMedico
            key="medico"
            regional={regional}
            especialidad={especialidad}
            onSelect={handleMedico}
            onBack={handleBack}
          />
        )}

        {subStep === "horario" && medico && (
          <StepHorario
            key="horario"
            medico={medico}
            onConfirm={handleSlot}
            onBack={handleBack}
          />
        )}

        {subStep === "confirmacion" && regional && especialidad && medico && slot && (
          <StepConfirmacion
            key="confirmacion"
            regional={regional}
            especialidad={especialidad}
            medico={medico}
            slot={slot}
            pacienteNombre={pacienteNombre}
            pacienteCarnet={pacienteCarnet}
            onDone={onComplete}
          />
        )}
      </section>
    );
  }
);
