"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { CarnetScreen } from "./screens/CarnetScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { ReservationFlow } from "./screens/ReservationFlow";
import { useScreenTransition } from "@/hooks/useScreenTransition";

export interface MockPatient {
  name: string;
  carnet: string;
  initials: string;
}

type Step = "welcome" | "carnet" | "menu" | "reserva";

const MAX_LEN = 10;
const MIN_LEN = 3;

function mockLookup(carnet: string): MockPatient {
  const names: Record<string, MockPatient> = {
    "12345678": { name: "Juan Pérez",   carnet, initials: "JP" },
    "87654321": { name: "María García", carnet, initials: "MG" },
    "11223344": { name: "Carlos López", carnet, initials: "CL" },
  };
  return names[carnet] ?? {
    name: "Paciente",
    carnet,
    initials: carnet.slice(0, 2).toUpperCase(),
  };
}

export function KioskApp() {
  const [step, setStep]       = useState<Step>("welcome");
  const [carnet, setCarnet]   = useState("");
  const [patient, setPatient] = useState<MockPatient | null>(null);
  const [hour, setHour]       = useState(10);
  const [now, setNow]         = useState<Date | null>(null);
  const [dark, setDark]       = useState(false);

  const stageRef    = useRef<HTMLDivElement>(null);
  const welcomeRef  = useRef<HTMLDivElement>(null);
  const carnetRef   = useRef<HTMLDivElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);
  const reservaRef  = useRef<HTMLDivElement>(null);
  const darkBtnRef  = useRef<HTMLButtonElement>(null);
  const transition  = useScreenTransition();
  const isAnimating = useRef(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d);
      setHour(d.getHours());
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useGSAP(() => {
    if (!welcomeRef.current) return;
    gsap.set(welcomeRef.current, { autoAlpha: 1 });
  }, { scope: stageRef });

  const handleDarkToggle = useCallback(() => {
    if (darkBtnRef.current) {
      gsap.fromTo(
        darkBtnRef.current,
        { rotate: 0 },
        { rotate: 360, duration: 0.55, ease: "power2.out" }
      );
    }
    setDark((d) => !d);
  }, []);

  /* ─── Funciones de navegación ─── */
  const goToCarnet = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    flushSync(() => setStep("carnet"));
    const from = welcomeRef.current;
    const to   = carnetRef.current;
    if (to) gsap.set(to, { autoAlpha: 1 });
    transition(from, to, () => { isAnimating.current = false; });
  }, [transition]);

  const goToMenu = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const p = mockLookup(carnet);
    flushSync(() => { setPatient(p); setStep("menu"); });
    const from = carnetRef.current;
    const to   = menuRef.current;
    if (to) gsap.set(to, { autoAlpha: 1 });
    transition(from, to, () => { isAnimating.current = false; });
  }, [carnet, transition]);

  const goToReserva = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    flushSync(() => setStep("reserva"));
    const from = menuRef.current;
    const to   = reservaRef.current;
    if (to) gsap.set(to, { autoAlpha: 1 });
    transition(from, to, () => { isAnimating.current = false; });
  }, [transition]);

  const backToMenu = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const from = reservaRef.current;
    const to   = menuRef.current;
    if (to) gsap.set(to, { autoAlpha: 1 });
    transition(from, to, () => {
      flushSync(() => setStep("menu"));
      isAnimating.current = false;
    });
  }, [transition]);

  const goToWelcome = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const from =
      step === "carnet" ? carnetRef.current :
      step === "menu"   ? menuRef.current   :
      reservaRef.current;
    const to = welcomeRef.current;
    transition(from, to, () => {
      flushSync(() => {
        setStep("welcome");
        setCarnet("");
        setPatient(null);
      });
      isAnimating.current = false;
    });
  }, [step, transition]);

  const onKey       = useCallback((c: string) => setCarnet((p) => p.length < MAX_LEN ? p + c : p), []);
  const onBackspace = useCallback(() => setCarnet((p) => p.slice(0, -1)), []);

  return (
    <main
      ref={stageRef}
      className="relative w-screen h-screen overflow-hidden bg-background transition-colors duration-slow"
    >
      {/* Reloj */}
      {now && (
        <div className="absolute top-5 right-10 font-display text-2xl font-light italic text-muted/70 tabular-nums z-20 pointer-events-none tracking-wide">
          {now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}

      {/* ── Screens ── */}
      <WelcomeScreen ref={welcomeRef} onStart={goToCarnet} hour={hour} />

      {(step === "carnet" || step === "menu" || step === "reserva") && (
        <CarnetScreen
          ref={carnetRef}
          carnet={carnet}
          onKey={onKey}
          onBackspace={onBackspace}
          onConfirm={goToMenu}
          onBack={goToWelcome}
        />
      )}

      {(step === "menu" || step === "reserva") && patient && (
        <MenuScreen
          ref={menuRef}
          patient={patient}
          onNewReservation={goToReserva}
          onHistory={() => alert("Próximamente: historial de reservas")}
          onExit={goToWelcome}
        />
      )}

      {step === "reserva" && patient && (
        <ReservationFlow
          ref={reservaRef}
          onBack={backToMenu}
          onComplete={backToMenu}
          pacienteNombre={patient.name}
          pacienteCarnet={patient.carnet}
        />
      )}

      {/* ── Botón dark mode ── */}
      <button
        ref={darkBtnRef}
        type="button"
        aria-label={dark ? "Modo claro" : "Modo oscuro"}
        onClick={handleDarkToggle}
        className={[
          "absolute bottom-7 right-8 z-30 w-14 h-14 rounded-full",
          "flex items-center justify-center",
          "border border-border transition-all duration-300 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          "bg-surface shadow-sm",
        ].join(" ")}
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        {dark ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 1v2M11 19v2M1 11h2M19 11h2M3.5 3.5l1.5 1.5M17 17l1.5 1.5M3.5 18.5l1.5-1.5M17 5l1.5-1.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </main>
  );
}
