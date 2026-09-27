import { NestFactory } from '@nestjs/core';
import { AppModule /*, ObserveInstrument*/ } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule /*, {
    instrument: ObserveInstrument,
  }*/,
  );
  await app.listen(process.env.PORT ?? 3000); //mudar futuramente pro zod validar aqui tbm. pois tá pegando direto
}
await bootstrap();
