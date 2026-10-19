import {
  Injectable,
  BadGatewayException,
  NotFoundException,
  Logger,
  ServiceUnavailableException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { SearchRecipesDto } from './dto/search-recipes.dto.js';
import {
  resultSpoonacularSchema,
  recipeSchema,
  type ResultSpoonacularDto,
  type RecipeDto,
} from './schemas/spoonacular.schema.js';
import type { EnvConfig } from '../config/env.schema.js';
import { z } from 'zod';
import { RecipesCacheService } from './cache/recipes-cache.service.js';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);
  private readonly rateLimitIssues = [503, 429, 402];
  constructor(
    private readonly context: HttpService,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly recipesCacheService: RecipesCacheService,
  ) {}

  async search(searchRecipes: SearchRecipesDto): Promise<ResultSpoonacularDto> {
    const key = this.recipesCacheService.keyForSearch(searchRecipes);
    const hitCache =
      await this.recipesCacheService.read<ResultSpoonacularDto>(key); //fora do try pq cache miss nao é erro e os erros nao entram no handle
    if (hitCache.status === 'hit') {
      return hitCache.data;
    }

    try {
      const apiKey = this.configService.get('SPOONACULAR_API_KEY', {
        infer: true,
      });
      const { data } = await firstValueFrom(
        this.context.get<unknown>(
          'https://api.spoonacular.com/recipes/complexSearch',
          {
            params: {
              apiKey,
              query: searchRecipes.query,
              number: searchRecipes.number,
              offset: searchRecipes.offset,
            },
          },
        ),
      );

      const result = resultSpoonacularSchema.safeParse(data);

      if (!result.success) {
        this.logger.error(
          `Erro de validação no search: ${JSON.stringify(z.treeifyError(result.error))}`,
        );
        throw new BadGatewayException({
          message: 'Erro na comunicação da proxy com API',
        });
      }

      await this.recipesCacheService.write(key, result.data, 'search');
      return result.data;
    } catch (error) {
      this.handleError(error, `search`);
    }
  }

  async getById(id: number): Promise<RecipeDto> {
    const key = this.recipesCacheService.keyForRecipe(id);

    const hitCache = await this.recipesCacheService.read<RecipeDto>(key); //negative cache pra 404
    if (hitCache.status === 'notFound')
      throw new NotFoundException('Receita com este ID é inexistente'); //caso dê cache hit em id inexistente
    if (hitCache.status === 'hit') {
      return hitCache.data;
    }

    try {
      const apiKey = this.configService.get('SPOONACULAR_API_KEY', {
        infer: true,
      });
      const { data } = await firstValueFrom(
        this.context.get<unknown>(
          `https://api.spoonacular.com/recipes/${id}/information`,
          { params: { apiKey } },
        ),
      );

      const result = recipeSchema.safeParse(data);

      if (!result.success) {
        this.logger.error(
          `Erro de validação no getById: ${JSON.stringify(z.treeifyError(result.error))}`,
        );
        throw new BadGatewayException({
          message: 'Erro na comunicação da proxy com API',
        });
      }
      await this.recipesCacheService.write(key, result.data, 'detail');
      return result.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        await this.recipesCacheService.writeNotFound(key);
      }
      this.handleError(error, `getById: ${id}`, { isDetail: true });
    }
  }

  private handleError(
    error: unknown,
    context: string,
    options: { isDetail?: boolean } = { isDetail: false },
  ): never {
    if (error instanceof BadGatewayException) {
      //caso erro ja tenha sido tratado
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        this.logger.error(
          `Timeout da API externa durante ${context} na url ${error.config?.url}`,
          error.stack,
        );
        throw new GatewayTimeoutException(
          'A API externa demorou demais para responder',
        );
      }

      if (error.response?.status === 404 && options.isDetail) {
        throw new NotFoundException('Receita com este ID é inexistente');
      }

      if (
        error.response?.status &&
        this.rateLimitIssues.includes(error.response?.status)
      ) {
        this.logger.warn(
          `Em ${context}, ou cota esgotada, ou Too Many Requests, ou Payment Required. Status: ${error.response?.status}`,
        );
        throw new ServiceUnavailableException(
          'Serviço indisponível temporariamente',
        );
      }

      this.logger.error(
        `Erro de integração ${context} ${error.response?.status}, code: ${error.code}, na URL: ${error.config?.url}`,
        error.stack,
      );
      throw new BadGatewayException('Erro na comunicação da proxy com API');
    }
    this.logger.error(
      `Erro inesperado no ${context}`,
      error instanceof Error ? error.stack : String(error),
    );
    throw new BadGatewayException('Erro na comunicação da proxy com API');
  }
}
