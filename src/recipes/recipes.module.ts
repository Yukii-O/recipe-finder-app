import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { RecipesController } from './recipes.controller.js';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module.js';
import { ConfigService } from '@nestjs/config';
import { type EnvConfig } from '../config/env.schema.js';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import { KeyvCacheableMemory } from 'cacheable';

@Module({
  controllers: [RecipesController],
  imports: [
    HttpModule.register({ timeout: 10000 }),
    AuthModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => ({
        stores: [
          new Keyv({
            store: new KeyvCacheableMemory({
              ttl: config.get('CACHE_TTL_MS', { infer: true }),
              lruSize: config.get('CACHE_MAX', { infer: true }),
            }),
          }),
        ],
      }),
    }),
  ],
  providers: [RecipesService],
})
export class RecipesModule {}
