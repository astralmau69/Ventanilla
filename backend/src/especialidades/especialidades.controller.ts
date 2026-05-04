import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';

@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  /**
   * GET /api/v1/especialidades
   * Lista todas las especialidades activas.
   */
  @Get()
  findAll() {
    return this.especialidadesService.findAll();
  }

  /**
   * GET /api/v1/especialidades/:id
   * Obtiene una especialidad por su ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    const esp = this.especialidadesService.findById(id);
    if (!esp) throw new NotFoundException(`Especialidad ${id} no encontrada.`);
    return esp;
  }
}
