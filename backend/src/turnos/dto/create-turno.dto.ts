import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTurnoDto {
  @IsString()
  @IsNotEmpty()
  carnetPaciente: string;

  @IsString()
  @IsNotEmpty()
  especialidadId: string;

  @IsString()
  @IsNotEmpty()
  medicoId: string;

  /** Formato YYYY-MM-DD */
  @IsDateString()
  fecha: string;

  /** Formato HH:MM */
  @IsString()
  @IsNotEmpty()
  hora: string;

  @IsString()
  @IsNotEmpty()
  regionalId: string;
}
