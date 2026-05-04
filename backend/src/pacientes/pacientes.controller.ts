import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PacientesService } from './pacientes.service';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  /**
   * GET /api/v1/pacientes/:carnet
   * Busca un paciente por su número de carnet de identidad.
   *
   * Respuesta 200:
   * {
   *   carnet:         "12345678",
   *   nombreCompleto: "Juan Pérez Mamani",
   *   iniciales:      "JP",
   *   prioritario:    false
   * }
   *
   * Respuesta 404 si el carnet no existe en el sistema.
   */
  @Get(':carnet')
  @HttpCode(HttpStatus.OK)
  findByCarnet(@Param('carnet') carnet: string) {
    return this.pacientesService.findByCarnet(carnet.trim());
  }
}
