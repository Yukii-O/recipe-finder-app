import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg'; //nao sabe mais let database url sozinho kk
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/env.schema.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<EnvConfig, true>) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('DATABASE_URL', {
        infer: true,
      }),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
