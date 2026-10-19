import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { SearchRecipesDto } from './dto/search-recipes.dto.js';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config/env.schema.js';

type CacheType = 'search' | 'detail';
@Injectable()
export class RecipesCacheService {
  private readonly logger = new Logger(RecipesCacheService.name);
  private readonly ttlSearch: number;
  private readonly ttlDetail: number;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {
    this.ttlSearch = this.config.get('CACHE_SEARCH_TTL_MS', { infer: true });
    this.ttlDetail = this.config.get('CACHE_DETAIL_TTL_MS', { infer: true });
  }
  keyForSearch(searchRecipesDto: SearchRecipesDto): string {
    //talvez, futuramente por um hash aqui nos valores
    return `v1:recipes:${searchRecipesDto.query}:${searchRecipesDto.number}:${searchRecipesDto.offset}:search`;
  }

  keyForRecipe(idRecipe: number): string {
    return `v1:recipes:${idRecipe}:detail`;
  }
  async read<T>(key: string): Promise<T | undefined> {
    try {
      const cacheValue = await this.cacheManager.get<T>(key);
      if (cacheValue == undefined) {
        //undefined ou null
        this.logger.debug(`[CACHE MISS] Key: ${key}`);
        return undefined;
      }
      this.logger.debug(`[CACHE HIT] Key: ${key}`);
      return cacheValue;
    } catch (error) {
      this.logger.warn(
        `Erro: ${error instanceof Error ? error.message : String(error)}, ao ler ${key} no cache`,
      );
      return undefined;
    }
  }

  async write(key: string, value: unknown, type: CacheType): Promise<void> {
    //adicionar ttl maior para consultas de detail, pois raramente mudam. so nao sei se essa abordagem faz sentido, caso eu use ela para mais coisas como IA. ou faz?
    try {
      const ttl = type === 'detail' ? this.ttlDetail : this.ttlSearch; //nota: search ta como padrao no module
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Erro: ${error instanceof Error ? error.message : String(error)}, ao armazenar ${key} no cache`,
      );
    }
  }
}
