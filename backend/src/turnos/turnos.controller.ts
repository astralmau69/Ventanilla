import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { TurnosService, EstadoTurno } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  /**
   * POST /api/v1/turnos
   * Crea un nuevo turno y devuelve el número de ficha asignado.
   *
   * Body (JSON):
   * {
   *   carnetPaciente: "12345678",
   *   especialidadId: "cardio",
   *   medicoId:       "card-lpz-001",
   *   regionalId:     "lpz",
   *   fecha:          "2026-05-06",
   *   hora:           "09:00"
   * }
   *
   * Respuesta 201:
   * {
   *   id:      "turno-17...",
   *   numero:  "B-001",
   *   estado:  "pendiente",
   *   creadoEn: "2026-05-03T14:22:00.000Z",
   *   ...
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTurnoDto) {
    return this.turnosService.create(dto);
  }

  /**
   * GET /api/v1/turnos/hoy
   * Lista todos los turnos de hoy, ordenados por correlativo.
   * Úsalo en la pantalla TV de llamados.
   */
  @Get('hoy')
  findHoy() {
    return this.turnosService.findHoy();
  }

  /**
   * GET /api/v1/turnos?especialidadId=cardio&fecha=2026-05-06
   * Lista turnos filtrados por especialidad y fecha.
   */
  @Get()
  findByEspecialidad(
    @Query('especialidadId') especialidadId: string,
    @Query('fecha') fecha: string,
  ) {
    if (!especialidadId || !fecha) {
      return [];
    }
    return this.turnosService.findByEspecialidadFecha(especialidadId, fecha);
  }

  /**
   * GET /api/v1/turnos/:id
   * Obtiene el estado actual de un turno específico.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    const turno = this.turnosService.findById(id);
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado.`);
    return turno;
  }

  /**
   * PATCH /api/v1/turnos/:id/estado
   * Actualiza el estado de un turno: pendiente → llamado → atendido / ausente
   * (Usado por la pantalla del operador de admisiones — Sprint 5)
   */
  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  updateEstado(
    @Param('id') id: string,
    @Body('estado') estado: EstadoTurno,
  ) {
    const turno = this.turnosService.updateEstado(id, estado);
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado.`);
    return turno;
  }
}
