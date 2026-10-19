import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { SearchRecipesDto } from '../dto/search-recipes.dto.js';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../../config/env.schema.js';

type CacheType = 'search' | 'detail' | 'detailNotFound';
type SuccessfulCacheType = Exclude<CacheType, 'detailNotFound'>;

type CacheResult<T> =
  { status: 'hit'; data: T } | { status: 'notFound' } | { status: 'miss' };

@Injectable()
export class RecipesCacheService {
  private readonly logger = new Logger(RecipesCacheService.name);
  private readonly ttlType: Record<CacheType, number>; //aura
  private readonly notFound = 'NOT_FOUND';
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {
    this.ttlType = {
      search: this.config.get('CACHE_SEARCH_TTL_MS', { infer: true }),
      detail: this.config.get('CACHE_DETAIL_TTL_MS', { infer: true }),
      detailNotFound: this.config.get('CACHE_DETAIL_NOT_FOUND_TTL_MS', {
        infer: true,
      }),
    };
  }
  keyForSearch(searchRecipesDto: SearchRecipesDto): string {
    //talvez, futuramente por um hash aqui nos valores
    return `v1:recipes:${searchRecipesDto.query}:${searchRecipesDto.number}:${searchRecipesDto.offset}:search`;
  }

  keyForRecipe(idRecipe: number): string {
    return `v1:recipes:${idRecipe}:detail`;
  }
  async read<T>(key: string): Promise<CacheResult<T>> {
    try {
      const cacheValue = await this.cacheManager.get<T>(key);
      if (cacheValue == undefined) {
        //undefined ou null
        this.logger.debug(`[CACHE MISS] Key: ${key}`);
        return { status: 'miss' };
      }

      if (cacheValue === this.notFound) {
        this.logger.debug(`[CACHE HIT - NOT FOUND] Key: ${key}`);
        return { status: 'notFound' };
      }

      this.logger.debug(`[CACHE HIT] Key: ${key}`);
      return { status: 'hit', data: cacheValue as T }; //type assertion
    } catch (error) {
      this.logger.warn(
        `Erro: ${error instanceof Error ? error.message : String(error)}, ao ler ${key} no cache`,
      );
      return { status: 'miss' };
    }
  }

  async write(
    key: string,
    value: unknown,
    type: SuccessfulCacheType,
  ): Promise<void> {
    try {
      const ttl = this.ttlType[type];

      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Erro: ${error instanceof Error ? error.message : String(error)}, ao armazenar ${key} no cache`,
      );
    }
  }
  async writeNotFound(key: string): Promise<void> {
    try {
      await this.cacheManager.set(
        key,
        this.notFound,
        this.ttlType['detailNotFound'],
      );
    } catch (error) {
      this.logger.warn(
        `Erro: ${error instanceof Error ? error.message : String(error)}, ao armazenar ${key} 404 no cache`,
      );
    }
  }
}
