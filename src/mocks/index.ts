/**
 * ─────────────────────────────────────────────────────────
 *  Capa de datos — Sistema de Reservas Médicas
 *
 *  MODO MOCK (por defecto):
 *    NEXT_PUBLIC_USE_MOCK=true  (o simplemente omitir la variable)
 *
 *  MODO API REAL:
 *    NEXT_PUBLIC_USE_MOCK=false
 *    Descomentar las llamadas fetch() y agregar la base URL.
 *
 *  Para cambiar entre modos basta con modificar la variable
 *  de entorno — no hay que tocar ningún otro archivo.
 * ─────────────────────────────────────────────────────────
 */

import { regionales as _regionales } from "./regionales";
import { especialidades as _especialidades } from "./especialidades";
import { medicos as _medicos } from "./medicos";
import type { Regional, Especialidad, Medico, EstadoSlot } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

/** Devuelve todas las regionales disponibles */
export async function getRegionales(): Promise<Regional[]> {
  if (USE_MOCK) return [..._regionales];
  return fetch("/api/v1/regionales").then((r) => r.json());
}

/** Devuelve todas las especialidades */
export async function getEspecialidades(): Promise<Especialidad[]> {
  if (USE_MOCK) return [..._especialidades];
  return fetch("/api/v1/especialidades").then((r) => r.json());
}

/**
 * Devuelve los médicos que atienden una especialidad en una regional.
 * Si no hay médicos para esa combinación, retorna [].
 */
export async function getMedicos(
  especialidadId: string,
  regionalId: string
): Promise<Medico[]> {
  if (USE_MOCK) {
    return _medicos.filter(
      (m) => m.especialidadId === especialidadId && m.regionalId === regionalId
    );
  }
  const params = new URLSearchParams({ especialidadId, regionalId });
  return fetch(`/api/v1/medicos?${params}`).then((r) => r.json());
}

/**
 * Indica si un médico atiende en una fecha dada.
 * Si el médico tiene `fechasAtencion`, usa esa lista exacta.
 * Si no, verifica el día de semana contra `diasAtencion`.
 */
export function doctorAttendsDate(medico: Medico, fecha: Date): boolean {
  if (medico.fechasAtencion) {
    return medico.fechasAtencion.includes(toDateStr(fecha));
  }
  return medico.diasAtencion.includes(fecha.getDay());
}

/**
 * Determina el estado de un slot (hora) para un médico en una fecha dada.
 * Función pura — no hace fetch.
 */
export function getEstadoSlot(
  medico: Medico,
  fecha: Date,
  hora: string
): EstadoSlot {
  if (!doctorAttendsDate(medico, fecha)) return "no-atiende";
  const fechaStr = toDateStr(fecha);
  return medico.ocupados.some((o) => o.fecha === fechaStr && o.hora === hora)
    ? "ocupada"
    : "libre";
}

/**
 * Genera la ventana deslizante de 8 días (hoy + 7).
 * Ej: si hoy es Domingo, devuelve [Domingo … Domingo siguiente].
 */
export function getRollingWindow(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

/** Convierte una Date a string YYYY-MM-DD (UTC-safe para comparaciones) */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type { Regional, Especialidad, Medico, EstadoSlot, SlotSeleccionado, HorarioOcupado } from "./types";
