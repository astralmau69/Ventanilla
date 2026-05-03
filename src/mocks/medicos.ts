import type { Medico } from "./types";

/**
 * Genera una fecha en formato YYYY-MM-DD relativa a hoy.
 * Se llama al cargar el módulo, una sola vez. Válido para mocks.
 */
function ds(offsetDays: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

/** Slots de turno estándar mañana */
const MANANA = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
/** Slots de turno estándar tarde */
const TARDE  = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

export const medicos: Medico[] = [
  /* ── La Paz · Medicina General ── */
  {
    id: "mgd-lpz-001",
    nombre: "Rosa Mamani Flores",
    titulo: "Dra.",
    especialidadId: "medgen",
    regionalId: "lpz",
    diasAtencion: [1, 2, 3, 4, 5], // Lun–Vie
    consultorio: "Cons. 4 — Piso 1",
    horariosDisponibles: [...MANANA, ...TARDE],
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(0), hora: "08:30" },
      { fecha: ds(0), hora: "09:00" },
      { fecha: ds(1), hora: "08:00" },
      { fecha: ds(1), hora: "10:30" },
      { fecha: ds(2), hora: "14:00" },
      { fecha: ds(2), hora: "14:30" },
      { fecha: ds(3), hora: "09:00" },
    ],
  },
  {
    id: "mgd-lpz-002",
    nombre: "Carlos Ticona Apaza",
    titulo: "Dr.",
    especialidadId: "medgen",
    regionalId: "lpz",
    diasAtencion: [1, 3, 5], // Lun, Mié, Vie
    consultorio: "Cons. 6 — Piso 1",
    horariosDisponibles: MANANA,
    ocupados: [
      { fecha: ds(0), hora: "09:00" },
      { fecha: ds(0), hora: "09:30" },
      { fecha: ds(2), hora: "08:00" },
      { fecha: ds(4), hora: "10:00" },
      { fecha: ds(4), hora: "10:30" },
      { fecha: ds(4), hora: "11:00" },
    ],
  },

  /* ── La Paz · Cardiología ── */
  {
    id: "card-lpz-001",
    nombre: "Alejandro Quispe Villca",
    titulo: "Dr.",
    especialidadId: "cardio",
    regionalId: "lpz",
    diasAtencion: [1, 2, 4], // Lun, Mar, Jue
    horariosDisponibles: [...MANANA.slice(0, 6), ...TARDE.slice(0, 4)],
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(0), hora: "08:30" },
      { fecha: ds(1), hora: "09:00" },
      { fecha: ds(3), hora: "14:00" },
      { fecha: ds(3), hora: "14:30" },
      { fecha: ds(3), hora: "15:00" },
    ],
  },

  /* ── Cochabamba · Medicina General ── */
  {
    id: "mgd-cbba-001",
    nombre: "Patricia Montaño Ríos",
    titulo: "Dra.",
    especialidadId: "medgen",
    regionalId: "cbba",
    diasAtencion: [1, 2, 3, 4, 5],
    horariosDisponibles: [...MANANA, ...TARDE],
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(0), hora: "09:00" },
      { fecha: ds(1), hora: "14:00" },
      { fecha: ds(2), hora: "08:30" },
      { fecha: ds(5), hora: "09:00" },
      { fecha: ds(5), hora: "09:30" },
    ],
  },
  {
    id: "mgd-cbba-002",
    nombre: "Rodrigo Vargas Sánchez",
    titulo: "Dr.",
    especialidadId: "medgen",
    regionalId: "cbba",
    diasAtencion: [2, 4, 6], // Mar, Jue, Sáb
    horariosDisponibles: MANANA,
    ocupados: [
      { fecha: ds(1), hora: "08:00" },
      { fecha: ds(1), hora: "08:30" },
      { fecha: ds(3), hora: "10:00" },
    ],
  },

  /* ── Cochabamba · Cardiología ── */
  {
    id: "card-cbba-001",
    nombre: "Valentina Cruz Peredo",
    titulo: "Dra.",
    especialidadId: "cardio",
    regionalId: "cbba",
    diasAtencion: [1, 3, 5],
    horariosDisponibles: [...MANANA.slice(0, 5), ...TARDE.slice(0, 3)],
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(2), hora: "09:00" },
      { fecha: ds(2), hora: "09:30" },
      { fecha: ds(4), hora: "14:00" },
    ],
  },

  /* ── Santa Cruz · Pediatría ── */
  {
    id: "ped-scz-001",
    nombre: "Lucía Herrera Baldivia",
    titulo: "Dra.",
    especialidadId: "pediatr",
    regionalId: "scz",
    diasAtencion: [1, 2, 3, 4, 5],
    horariosDisponibles: [...MANANA, ...TARDE],
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(0), hora: "08:30" },
      { fecha: ds(0), hora: "09:00" },
      { fecha: ds(1), hora: "14:00" },
      { fecha: ds(2), hora: "10:00" },
      { fecha: ds(3), hora: "08:30" },
    ],
  },

  /* ── Oruro · Traumatología ── */
  {
    id: "trau-oru-001",
    nombre: "Marco Jiménez Condori",
    titulo: "Dr.",
    especialidadId: "trauma",
    regionalId: "oru",
    diasAtencion: [1, 3, 5],
    horariosDisponibles: MANANA,
    ocupados: [
      { fecha: ds(0), hora: "08:00" },
      { fecha: ds(2), hora: "09:00" },
      { fecha: ds(2), hora: "09:30" },
      { fecha: ds(4), hora: "10:00" },
      { fecha: ds(4), hora: "10:30" },
      { fecha: ds(4), hora: "11:00" },
      { fecha: ds(4), hora: "11:30" },
    ],
  },

  /* ── Oruro · Ginecología ── */
  {
    id: "gine-oru-001",
    nombre: "Silvia Chávez Torrico",
    titulo: "Dra.",
    especialidadId: "gineco",
    regionalId: "oru",
    diasAtencion: [2, 4],
    horariosDisponibles: [...MANANA.slice(0, 6), ...TARDE.slice(0, 3)],
    ocupados: [
      { fecha: ds(1), hora: "08:00" },
      { fecha: ds(3), hora: "09:00" },
      { fecha: ds(3), hora: "09:30" },
    ],
  },

  /* ── La Paz · Medicina General · Demo horario exacto ──────────────────
   *  Atiende exactamente 4 días de la ventana de 8 (ds1,ds3,ds5,ds7).
   *  ds(1) → completamente ocupado; ds(3), ds(5), ds(7) → libres.
   *  Los 4 días restantes (ds0,ds2,ds4,ds6) → "no atiende".
   * ──────────────────────────────────────────────────────────────────── */
  {
    id: "mgd-lpz-demo",
    nombre: "Andrés Villanueva Paz",
    titulo: "Dr.",
    especialidadId: "medgen",
    regionalId: "lpz",
    diasAtencion: [], // ignorado porque fechasAtencion tiene precedencia
    fechasAtencion: [ds(1), ds(3), ds(5), ds(7)],
    horariosDisponibles: [...MANANA],
    ocupados: [
      /* ds(1) completamente reservado */
      { fecha: ds(1), hora: "08:00" },
      { fecha: ds(1), hora: "08:30" },
      { fecha: ds(1), hora: "09:00" },
      { fecha: ds(1), hora: "09:30" },
      { fecha: ds(1), hora: "10:00" },
      { fecha: ds(1), hora: "10:30" },
      { fecha: ds(1), hora: "11:00" },
      { fecha: ds(1), hora: "11:30" },
    ],
  },
];
