import { Injectable, NotFoundException } from '@nestjs/common';

export interface Paciente {
  carnet:      string;
  nombre:      string;
  apellido:    string;
  nombreCompleto: string;
  iniciales:   string;
  /** Indica si requiere atención prioritaria (silla de ruedas, etc.) */
  prioritario: boolean;
}

/**
 * Datos seed de pacientes.
 * Sprint 4: estos datos vendrán de PostgreSQL via Prisma.
 * Sprint C: pasarán por ms-integracion-hospital hacia el HIS real.
 */
const SEED_PACIENTES: Record<string, Paciente> = {
  '12345678': {
    carnet:         '12345678',
    nombre:         'Juan',
    apellido:       'Pérez Mamani',
    nombreCompleto: 'Juan Pérez Mamani',
    iniciales:      'JP',
    prioritario:    false,
  },
  '87654321': {
    carnet:         '87654321',
    nombre:         'María',
    apellido:       'García Quispe',
    nombreCompleto: 'María García Quispe',
    iniciales:      'MG',
    prioritario:    true,
  },
  '11223344': {
    carnet:         '11223344',
    nombre:         'Carlos',
    apellido:       'López Condori',
    nombreCompleto: 'Carlos López Condori',
    iniciales:      'CL',
    prioritario:    false,
  },
  '99887766': {
    carnet:         '99887766',
    nombre:         'Rosa',
    apellido:       'Mamani Flores',
    nombreCompleto: 'Rosa Mamani Flores',
    iniciales:      'RM',
    prioritario:    true,
  },
  '55443322': {
    carnet:         '55443322',
    nombre:         'Pedro',
    apellido:       'Chávez Torres',
    nombreCompleto: 'Pedro Chávez Torres',
    iniciales:      'PC',
    prioritario:    false,
  },
};

@Injectable()
export class PacientesService {
  /**
   * Busca un paciente por número de carnet.
   * @throws NotFoundException si el carnet no existe en el sistema.
   */
  findByCarnet(carnet: string): Paciente {
    const paciente = SEED_PACIENTES[carnet];
    if (!paciente) {
      throw new NotFoundException(
        `No se encontró ningún paciente con carnet ${carnet}. ` +
        `Verifique el número o diríjase a Admisiones.`,
      );
    }
    return paciente;
  }

  /** Lista todos los pacientes — solo para uso interno / admin */
  findAll(): Paciente[] {
    return Object.values(SEED_PACIENTES);
  }
}
