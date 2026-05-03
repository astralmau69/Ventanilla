/* ─────────────────────────────────────────────
   Tipos de dominio — Sistema de Reservas
   Úsalos en mocks y en la futura capa de API.
   ───────────────────────────────────────────── */

export interface Regional {
  id: string;
  nombre: string;
  ciudad: string;
  departamento: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface HorarioOcupado {
  /** Formato YYYY-MM-DD */
  fecha: string;
  /** Formato HH:MM */
  hora: string;
}

export interface Medico {
  id: string;
  nombre: string;
  titulo: string;
  especialidadId: string;
  regionalId: string;
  /** 0 = Dom, 1 = Lun, 2 = Mar, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb */
  diasAtencion: number[];
  /**
   * Fechas de atención explícitas en formato YYYY-MM-DD.
   * Cuando se define, tiene precedencia sobre diasAtencion.
   * Útil para mocks con control exacto de disponibilidad.
   */
  fechasAtencion?: string[];
  /** Número o nombre del consultorio, ej. "Cons. 3 — Piso 2" */
  consultorio: string;
  /** Slots de tiempo disponibles, ej. ["08:00", "08:30", ...] */
  horariosDisponibles: string[];
  /** Turnos ya asignados dentro de la ventana de 8 días */
  ocupados: HorarioOcupado[];
}

/** Estado de un slot hora+fecha para un médico dado */
export type EstadoSlot = "libre" | "ocupada" | "no-atiende";

/** Slot seleccionado para confirmar una reserva */
export interface SlotSeleccionado {
  fecha: Date;
  hora: string;
}
