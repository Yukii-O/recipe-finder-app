import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import {
  searchRecipesSchema,
  type SearchRecipesDto,
} from './dto/search-recipes.dto.js';
import { idSchema } from './dto/recipe-id.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ContextThrottlerGuard } from '../common/guards/throttler.guard.js';

@Controller('recipes')
@UseGuards(JwtAuthGuard, ContextThrottlerGuard) //10 tokens a cada 10 minutos pra conta. nao havera sem conta, mas quis melhorar --- em casos de haver com ip apenas, por throttlerGuard antes do jwt
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
