import { Injectable } from '@nestjs/common';

export interface Especialidad {
  id:          string;
  nombre:      string;
  descripcion: string;
  letraTurno:  string;  // Letra usada en el número de ficha: A, B, C...
  activa:      boolean;
}

const ESPECIALIDADES: Especialidad[] = [
  {
    id:          'medgen',
    nombre:      'Medicina General',
    descripcion: 'Consulta general, chequeos y derivaciones',
    letraTurno:  'A',
    activa:      true,
  },
  {
    id:          'cardio',
    nombre:      'Cardiología',
    descripcion: 'Corazón y sistema cardiovascular',
    letraTurno:  'B',
    activa:      true,
  },
  {
    id:          'pediatr',
    nombre:      'Pediatría',
    descripcion: 'Atención médica para niños y adolescentes',
    letraTurno:  'C',
    activa:      true,
  },
  {
    id:          'trauma',
    nombre:      'Traumatología',
    descripcion: 'Huesos, articulaciones y lesiones musculares',
    letraTurno:  'D',
    activa:      true,
  },
  {
    id:          'gineco',
    nombre:      'Ginecología',
    descripcion: 'Salud de la mujer y sistema reproductivo',
    letraTurno:  'E',
    activa:      true,
  },
  {
    id:          'oftalmo',
    nombre:      'Oftalmología',
    descripcion: 'Salud visual y enfermedades de los ojos',
    letraTurno:  'F',
    activa:      true,
  },
  {
    id:          'derma',
    nombre:      'Dermatología',
    descripcion: 'Piel, cabello y uñas',
    letraTurno:  'G',
    activa:      true,
  },
  {
    id:          'neuro',
    nombre:      'Neurología',
    descripcion: 'Sistema nervioso central y periférico',
    letraTurno:  'H',
    activa:      true,
  },
];

@Injectable()
export class EspecialidadesService {
  findAll(): Especialidad[] {
    return ESPECIALIDADES.filter((e) => e.activa);
  }

  findById(id: string): Especialidad | undefined {
    return ESPECIALIDADES.find((e) => e.id === id);
  }
}
