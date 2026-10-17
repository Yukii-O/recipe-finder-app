import { NestFactory } from '@nestjs/core';
import { AppModule /*, ObserveInstrument*/ } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { type EnvConfig } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule /*, {
    instrument: ObserveInstrument,
  }*/,
  );
  app.enableShutdownHooks();

  const configService = app.get(ConfigService<EnvConfig, true>);
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}
await bootstrap();
