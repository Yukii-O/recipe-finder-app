import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import {
  searchRecipesSchema,
  type SearchRecipesDto,
} from './dto/search-recipes.dto.js';
import { idSchema } from './schemas/spoonacular.schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { DoubleLayerThrottlerGuard } from './common/guards/throttler.guard.js';

@Controller('recipes')
@UseGuards(JwtAuthGuard, DoubleLayerThrottlerGuard) //10 tokens a cada 10 minutos pra conta. nao havera sem conta, mas quis melhorar --- em casos de haver com ip apenas, por throttlerGuard antes do jwt
@Throttle({ userId: {} }) //so precisa por as chaves para funcionar, mas tbm pode por outro valor para usar em uma rota com token proprio
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('search')
  async findRecipes(
    @Query(new ZodValidationPipe(searchRecipesSchema)) query: SearchRecipesDto,
  ) {
    return await this.recipesService.search(query);
  }
  @Get(':id')
  async findRecipeById(
    @Param('id', new ZodValidationPipe(idSchema)) id: number,
  ) {
    return await this.recipesService.getById(id);
  }
}
