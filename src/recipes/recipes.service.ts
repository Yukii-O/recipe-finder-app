import {
  Injectable,
  BadGatewayException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
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

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);
  constructor(
    private readonly context: HttpService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  async search(
    searchRecipes: SearchRecipesDto,
  ): Promise<ResultSpoonacularDto> /*| Promise<Observable<any>>*/ {
    //nota: { data } desestrutura o http e pega só o .data dele
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
          'Erro de validação no search',
          JSON.stringify(z.treeifyError(result.error)),
        );
        throw new BadGatewayException({
          message: 'Erro na comunicação da proxy com API',
          errors: z.treeifyError(result.error),
        });
      }
      return result.data; //com transform
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      if (error instanceof AxiosError && error.response?.status === 404)
        this.logger.error('Erro inesperado no search', error);
      throw new BadGatewayException('Erro na comunicação da proxy com API');
    }
  }

  async getById(id: number): Promise<RecipeDto> {
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
          `Erro de validação no getById: ${id}`,
          JSON.stringify(z.treeifyError(result.error)),
        );
        throw new BadGatewayException({
          message: 'Erro na comunicação da proxy com API',
          errors: z.treeifyError(result.error),
        });
      }
      return result.data;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException('Receita com este ID é inexistente');
      }
      this.logger.error(`Erro inesperado no getById: ${id}`, error);
      throw new BadGatewayException('Erro na comunicação da proxy com API');
    }
  }
}
