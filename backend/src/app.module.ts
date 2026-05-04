import { Module } from '@nestjs/common';
import { PacientesModule } from './pacientes/pacientes.module';
import { TurnosModule } from './turnos/turnos.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';

@Module({
  imports: [
    PacientesModule,
    TurnosModule,
    EspecialidadesModule,
  ],
})
export class AppModule {}
