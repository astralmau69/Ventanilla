import { Injectable, ConflictException } from '@nestjs/common';
import { CreateTurnoDto } from './dto/create-turno.dto';

export type EstadoTurno = 'pendiente' | 'llamado' | 'atendido' | 'ausente';

export interface Turno {
  id:             string;
  numero:         string;   // "A-042"
  letra:          string;   // "A"
  correlativo:    number;   // 42
  carnetPaciente: string;
  especialidadId: string;
  medicoId:       string;
  regionalId:     string;
  fecha:          string;   // YYYY-MM-DD
  hora:           string;   // HH:MM
  estado:         EstadoTurno;
  creadoEn:       string;   // ISO timestamp
}

/**
 * TurnosService — lógica de correlativo diario por especialidad.
 *
 * Almacenamiento: Map en memoria (Sprint 4 lo reemplaza con PostgreSQL+Redis).
 *
 * Lógica de correlativo:
 *   - Clave: `${especialidadId}:${fecha}` → contador incremental del día.
 *   - Letra del prefijo: derivada de la inicial de la especialidad.
 *   - El correlativo reinicia cada día (01 a 999).
 */
@Injectable()
export class TurnosService {
  /** Almacén en memoria — reemplazar con Prisma en Sprint 4 */
  private readonly turnos  = new Map<string, Turno>();
  /** Contadores diarios por especialidad: `${espId}:${fecha}` → número */
  private readonly contadores = new Map<string, number>();

  /** Letras por especialidad — en producción vendrán de la tabla especialidades */
  private readonly LETRAS: Record<string, string> = {
    medgen:  'A',
    cardio:  'B',
    pediatr: 'C',
    trauma:  'D',
    gineco:  'E',
    oftalmo: 'F',
    derma:   'G',
    neuro:   'H',
  };

  create(dto: CreateTurnoDto): Turno {
    // Verificar que no existe ya un turno para el mismo paciente en esa cita
    const duplicado = [...this.turnos.values()].find(
      (t) =>
        t.carnetPaciente === dto.carnetPaciente &&
        t.especialidadId === dto.especialidadId &&
        t.fecha === dto.fecha &&
        t.hora  === dto.hora  &&
        t.estado !== 'ausente',
    );
    if (duplicado) {
      throw new ConflictException(
        `El paciente ya tiene un turno para esa cita (${duplicado.numero}).`,
      );
    }

    // Incrementar el correlativo del día
    const claveContador = `${dto.especialidadId}:${dto.fecha}`;
    const siguiente = (this.contadores.get(claveContador) ?? 0) + 1;
    this.contadores.set(claveContador, siguiente);

    const letra       = this.LETRAS[dto.especialidadId] ?? 'Z';
    const correlativo = siguiente;
    const numero      = `${letra}-${String(correlativo).padStart(3, '0')}`;
    const id          = `turno-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const turno: Turno = {
      id,
      numero,
      letra,
      correlativo,
      carnetPaciente: dto.carnetPaciente,
      especialidadId: dto.especialidadId,
      medicoId:       dto.medicoId,
      regionalId:     dto.regionalId,
      fecha:          dto.fecha,
      hora:           dto.hora,
      estado:         'pendiente',
      creadoEn:       new Date().toISOString(),
    };

    this.turnos.set(id, turno);

    console.log(`[turnos] Nuevo turno generado: ${numero} — ${dto.especialidadId} — ${dto.fecha} ${dto.hora}`);
    return turno;
  }

  findById(id: string): Turno | undefined {
    return this.turnos.get(id);
  }

  /** Devuelve todos los turnos del día de hoy ordenados por correlativo */
  findHoy(): Turno[] {
    const hoy = new Date().toISOString().split('T')[0];
    return [...this.turnos.values()]
      .filter((t) => t.fecha === hoy)
      .sort((a, b) => a.correlativo - b.correlativo);
  }

  /** Devuelve todos los turnos de una especialidad para una fecha dada */
  findByEspecialidadFecha(especialidadId: string, fecha: string): Turno[] {
    return [...this.turnos.values()]
      .filter((t) => t.especialidadId === especialidadId && t.fecha === fecha)
      .sort((a, b) => a.correlativo - b.correlativo);
  }

  /** Avanza el estado de un turno (para la pantalla TV de llamados) */
  updateEstado(id: string, estado: EstadoTurno): Turno | undefined {
    const turno = this.turnos.get(id);
    if (!turno) return undefined;
    turno.estado = estado;
    return turno;
  }
}
