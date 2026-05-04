"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Regional, Especialidad, Medico, SlotSeleccionado } from "@/mocks";
import { printTicket, generarNumeroFicha } from "@/lib/printTicket";

const DIAS  = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
               "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

interface Props {
  regional:       Regional;
  especialidad:   Especialidad;
  medico:         Medico;
  slot:           SlotSeleccionado;
  pacienteNombre: string;
  pacienteCarnet: string;
  onDone:         () => void;
}

export function StepConfirmacion({
  regional, especialidad, medico, slot,
  pacienteNombre, pacienteCarnet, onDone,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkRef     = useRef<SVGPathElement>(null);
  const ticketRef    = useRef<HTMLDivElement>(null);
  const modalRef     = useRef<HTMLDivElement>(null);

  const [fichaNumero]  = useState(() => generarNumeroFicha());
  const [showModal,  setShowModal]  = useState(false);
  const [printing,   setPrinting]   = useState(false);
  const [printed,    setPrinted]    = useState(false);
  const [fechaEmision, setFechaEmision] = useState("");

  useEffect(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    setFechaEmision(`${dd}/${mm}/${yy} ${hh}:${mi}`);
  }, []);

  const fechaCita = `${DIAS[slot.fecha.getDay()]}, ${slot.fecha.getDate()} de ${MESES[slot.fecha.getMonth()]} ${slot.fecha.getFullYear()}`;
  const fechaCorta = `${DIAS[slot.fecha.getDay()].slice(0, 3)}. ${slot.fecha.getDate()}/${String(slot.fecha.getMonth() + 1).padStart(2, "0")}`;

  /* ── Entrada de pantalla ── */
  useGSAP(() => {
    if (!containerRef.current || !checkRef.current) return;

    const len = checkRef.current.getTotalLength?.() ?? 120;
    gsap.set(checkRef.current, { strokeDasharray: len, strokeDashoffset: len });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(checkRef.current, {
      strokeDashoffset: 0,
      duration: 0.65,
      ease: "power2.inOut",
    });

    tl.from("[data-circle]", {
      scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)",
    }, "-=0.5");

    tl.from("[data-header-text]", {
      opacity: 0, y: 16, duration: 0.45, ease: "power2.out",
    }, "-=0.3");

    // Ticket entra como si saliera de la impresora (desde arriba)
    tl.from(ticketRef.current, {
      y: -60, opacity: 0, duration: 0.7, ease: "power3.out",
    }, "-=0.2");

    tl.from(ticketRef.current, {
      rotate: -1, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1,
    }, "-=0.3");

    // Botones
    tl.from("[data-action-btn]", {
      opacity: 0, y: 24, duration: 0.45, stagger: 0.1, ease: "back.out(1.4)",
    }, "-=0.2");
  }, { scope: containerRef });

  /* ── Modal: abrir / cerrar ── */
  const openModal = useCallback(() => {
    setShowModal(true);
    requestAnimationFrame(() => {
      if (modalRef.current) {
        gsap.from(modalRef.current.querySelector("[data-modal-card]"), {
          scale: 0.88, opacity: 0, duration: 0.35, ease: "back.out(1.6)",
        });
      }
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!modalRef.current) { setShowModal(false); return; }
    gsap.to(modalRef.current.querySelector("[data-modal-card]"), {
      scale: 0.92, opacity: 0, duration: 0.2, ease: "power2.in",
      onComplete: () => setShowModal(false),
    });
  }, []);

  /* ── Confirmar impresión ── */
  const confirmPrint = useCallback(() => {
    closeModal();
    setPrinting(true);
    printTicket({
      fichaNumero,
      pacienteNombre,
      pacienteCarnet,
      regional:     regional.ciudad,
      especialidad: especialidad.nombre,
      medico:       `${medico.titulo} ${medico.nombre}`,
      consultorio:  medico.consultorio,
      fechaCita,
      horaCita:     slot.hora,
      fechaEmision: fechaEmision || new Date().toLocaleString("es-PE"),
    });
    setTimeout(() => { setPrinting(false); setPrinted(true); }, 1800);
  }, [closeModal, fichaNumero, pacienteNombre, pacienteCarnet, regional, especialidad, medico, fechaCita, slot, fechaEmision]);

  return (
    <>
      {/* ──────────────────── PANTALLA PRINCIPAL ──────────────────── */}
      <div
        ref={containerRef}
        className="flex flex-col h-full w-full"
      >
        {/* ── Cabecera de éxito ── */}
        <div className="flex-shrink-0 w-full bg-success/8 border-b border-success/20 px-10 py-5 flex items-center gap-6">
          <div data-circle className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-success/15 border-2 border-success/40" />
            <svg viewBox="0 0 60 60" fill="none" className="w-10 h-10" aria-hidden>
              <path
                ref={checkRef}
                d="M12 32L24 44L48 20"
                stroke="var(--success)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div data-header-text>
            <h2 className="font-display text-4xl font-light italic text-primary leading-none tracking-tight">
              ¡Reserva confirmada!
            </h2>
            <p className="font-ui text-base text-muted mt-1 tracking-wide">
              Su cita ha sido agendada — revise los datos y retire su ficha
            </p>
          </div>
        </div>

        {/* ── Cuerpo: ticket visual + acciones ── */}
        <div className="flex-1 flex min-h-0 gap-0">

          {/* ── PANEL IZQUIERDO — Previsualización del ticket térmico ── */}
          <div className="flex-1 flex items-center justify-center bg-surface/50 border-r border-border px-8 py-6 overflow-hidden">
            <div
              ref={ticketRef}
              className="relative w-[320px] select-none"
              aria-label="Vista previa de su ficha"
            >
              {/* Sombra de papel */}
              <div className="absolute inset-0 translate-y-2 translate-x-1 bg-border/40 rounded-sm blur-sm" />

              {/* Ticket en sí */}
              <div className="relative bg-white text-[#111] rounded-sm overflow-hidden"
                   style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)" }}>

                {/* Borde dentado superior (efecto perforación) */}
                <TicketEdge />

                {/* Cabecera del ticket */}
                <div className="px-6 pt-5 pb-3 text-center border-b border-dashed border-gray-300">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                    CENTRO DE SALUD
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.12em] text-gray-400 mt-0.5">
                    Sistema de Turnos Médicos
                  </p>
                </div>

                {/* Número de ficha — protagonista */}
                <div className="px-6 py-5 text-center border-b border-dashed border-gray-300">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                    Su número de atención
                  </p>
                  <p
                    className="font-mono font-black leading-none tracking-tighter"
                    style={{ fontSize: "68px", letterSpacing: "-0.02em" }}
                  >
                    {fichaNumero}
                  </p>
                </div>

                {/* Detalles */}
                <div className="px-6 py-4 space-y-2 border-b border-dashed border-gray-300">
                  <TicketRow label="PACIENTE"      value={pacienteNombre} />
                  <TicketRow label="C.I."          value={pacienteCarnet} />
                  <TicketRow label="ESPECIALIDAD"  value={especialidad.nombre} />
                  <TicketRow label="MÉDICO"        value={`${medico.titulo} ${medico.nombre}`} />
                  <TicketRow label="CONSULTORIO"   value={medico.consultorio} />
                </div>

                {/* Fecha/hora de la cita */}
                <div className="px-6 py-4 text-center border-b border-dashed border-gray-300">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                    FECHA Y HORA DE SU CITA
                  </p>
                  <p className="font-mono text-[13px] font-bold text-gray-800 leading-snug">
                    {fechaCita}
                  </p>
                  <p className="font-mono text-[26px] font-black text-gray-900 leading-none mt-0.5">
                    {slot.hora}
                  </p>
                </div>

                {/* Pie */}
                <div className="px-6 py-4 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gray-700">
                    Preséntese 10 min antes
                  </p>
                  <p className="font-mono text-[9px] text-gray-400 mt-1 tracking-wide">
                    Traiga este comprobante y su C.I.
                  </p>
                  {fechaEmision && (
                    <p className="font-mono text-[8px] text-gray-300 mt-2">
                      Emitido: {fechaEmision}
                    </p>
                  )}
                </div>

                {/* Borde dentado inferior */}
                <TicketEdge flipped />
              </div>
            </div>
          </div>

          {/* ── PANEL DERECHO — Resumen + Acciones ── */}
          <div className="w-[420px] flex-shrink-0 flex flex-col bg-background px-8 py-6 gap-5 overflow-auto">

            {/* Resumen de la cita */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden"
                 style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="px-6 py-4 border-b border-border bg-surface">
                <p className="font-ui text-xs font-bold tracking-[0.18em] uppercase text-gold">
                  Resumen de su cita
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <SummaryRow icon="📍" label="Regional"     value={regional.ciudad} />
                <SummaryRow icon="🩺" label="Especialidad" value={especialidad.nombre} />
                <SummaryRow icon="👨‍⚕️" label="Médico"       value={`${medico.titulo} ${medico.nombre}`} />
                <SummaryRow icon="🚪" label="Consultorio"  value={medico.consultorio} />
                <div className="h-px bg-border" />
                <SummaryRow icon="📅" label="Fecha"  value={fechaCita} />
                <SummaryRow icon="🕐" label="Horario" value={slot.hora} bold />
              </div>
            </div>

            {/* ── BOTÓN IMPRIMIR — el más visible de toda la pantalla ── */}
            <button
              data-action-btn
              type="button"
              onClick={printing ? undefined : openModal}
              disabled={printing}
              aria-label="Imprimir ficha médica"
              className={[
                "w-full rounded-2xl flex items-center justify-center gap-4 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/50",
                "transition-all duration-150",
                printing
                  ? "bg-surface border-2 border-border text-muted/50 cursor-wait"
                  : printed
                  ? "bg-success/10 border-2 border-success text-success active:scale-[0.97]"
                  : "active:scale-[0.97]",
              ].join(" ")}
              style={
                printing || printed ? {
                  minHeight: "110px",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                } : {
                  minHeight: "110px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  boxShadow: "0 6px 0 rgba(0,0,0,0.35), 0 2px 16px rgba(13,31,60,0.30)",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }
              }
            >
              {printing ? (
                <div className="flex flex-col items-center gap-2">
                  <SpinnerIcon size={32} />
                  <span className="font-display text-2xl font-light italic">Enviando a impresora…</span>
                </div>
              ) : printed ? (
                <div className="flex flex-col items-center gap-2">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                    <circle cx="18" cy="18" r="16" stroke="var(--success)" strokeWidth="2"/>
                    <path d="M10 18l6 6 10-12" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-display text-2xl font-light italic">Imprimir nuevamente</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <PrinterSvg size={40} />
                  <span className="font-display text-3xl font-bold tracking-wide" style={{ letterSpacing: "0.04em" }}>
                    IMPRIMIR FICHA
                  </span>
                  <span className="font-ui text-sm opacity-75 tracking-[0.12em] uppercase">
                    Toque para imprimir
                  </span>
                </div>
              )}
            </button>

            {/* ── Botón volver (secundario, pero grande) ── */}
            <button
              data-action-btn
              type="button"
              onClick={onDone}
              className="w-full rounded-2xl py-5 font-display text-2xl font-light italic text-muted border-2 border-border bg-surface transition-all duration-150 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold hover:border-border-strong hover:text-primary"
              style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
            >
              Volver al menú principal
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────── MODAL DE CONFIRMACIÓN ──────────────────── */}
      {showModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(8,15,29,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === modalRef.current) closeModal(); }}
        >
          <div
            data-modal-card
            className="bg-surface rounded-3xl border border-border w-full max-w-lg mx-6 overflow-hidden"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
          >
            {/* Cabecera del modal */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-border">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
                <PrinterSvg size={40} color="var(--accent)" />
              </div>
              <h3 className="font-display text-4xl font-light italic text-primary leading-tight">
                ¿Imprimir su ficha?
              </h3>
              <p className="font-ui text-lg text-muted mt-2 leading-snug">
                Se enviará a la impresora de fichas.<br />
                Retire su comprobante del dispensador.
              </p>
            </div>

            {/* Mini-preview del número */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-border bg-background/60">
              <div>
                <p className="font-ui text-xs font-bold tracking-[0.18em] uppercase text-gold mb-0.5">
                  Su número
                </p>
                <p className="font-display text-5xl font-light italic text-primary leading-none">
                  {fichaNumero}
                </p>
              </div>
              <div className="text-right">
                <p className="font-ui text-xs font-bold tracking-[0.15em] uppercase text-muted mb-1">
                  {especialidad.nombre}
                </p>
                <p className="font-ui text-base text-primary font-semibold">
                  {fechaCorta} · {slot.hora}
                </p>
                <p className="font-ui text-sm text-muted mt-0.5">
                  {medico.titulo} {medico.nombre}
                </p>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="px-6 py-5 flex flex-col gap-3">
              {/* Sí, imprimir */}
              <button
                type="button"
                onClick={confirmPrint}
                className="w-full rounded-2xl flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
                style={{
                  minHeight: "88px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.30), 0 2px 12px rgba(13,31,60,0.25)",
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }}
              >
                <PrinterSvg size={28} />
                <span className="font-display text-3xl font-bold tracking-wide">
                  Sí, imprimir ahora
                </span>
              </button>

              {/* Cancelar */}
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-2xl py-5 font-display text-2xl font-light italic text-muted border-2 border-border bg-transparent active:scale-[0.97] transition-all duration-150 cursor-pointer hover:border-border-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Subcomponentes ── */

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-[11px] font-bold text-gray-800 text-right leading-tight">
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  icon, label, value, bold = false,
}: { icon: string; label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base flex-shrink-0 mt-0.5" aria-hidden>{icon}</span>
      <div className="min-w-0">
        <p className="font-ui text-xs font-bold tracking-[0.15em] uppercase text-gold mb-0.5">
          {label}
        </p>
        <p className={`font-display text-xl font-light italic text-primary leading-tight ${bold ? "text-2xl" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/** Borde dentado SVG superior/inferior del ticket */
function TicketEdge({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 12"
      preserveAspectRatio="none"
      className="w-full"
      style={{ display: "block", height: "12px", transform: flipped ? "scaleY(-1)" : undefined }}
      aria-hidden
    >
      <rect width="320" height="12" fill="white" />
      {/* Serie de semicírculos simulando perforación */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={8 + i * 16} cy="0" r="6" fill="#f3f4f6" />
      ))}
    </svg>
  );
}

function PrinterSvg({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="6" y="11" width="20" height="12" rx="3" stroke={color} strokeWidth="2" />
      <path d="M10 11V6h12v5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19h12v7H10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23.5" cy="16" r="1.5" fill={color} />
      {/* Papel saliendo de la impresora */}
      <path d="M13 22h6M13 25h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function SpinnerIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
