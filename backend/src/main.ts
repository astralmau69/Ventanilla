import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  // CORS: permite peticiones desde el kiosco frontend
  app.enableCors({
    origin: [
      'http://localhost:3217',  // dev frontend
      'http://localhost:3000',  // otros entornos dev
      /^https?:\/\/kiosko\.local/,
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT ?? 3001;
  await app.listen(PORT);
  console.log(`\n🏥  Kiosco Backend corriendo en http://localhost:${PORT}/api/v1`);
  console.log(`   Pacientes: GET  /api/v1/pacientes/:carnet`);
  console.log(`   Turnos:    POST /api/v1/turnos`);
  console.log(`   Turnos:    GET  /api/v1/turnos/hoy`);
  console.log(`   Espec.:    GET  /api/v1/especialidades\n`);
}

bootstrap();
