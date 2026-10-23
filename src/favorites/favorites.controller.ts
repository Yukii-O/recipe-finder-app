import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { FavoritesService } from './favorites.service.js';
import { idRecipeSchema, idUserSchema } from './dto/list-favorites.dto.js';
import type { idRecipeDto, idUserDto } from './dto/list-favorites.dto.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { GetUser } from '../common/decorators/current-user.decorator.js';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async showId(
    @GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto,
  ) {
    return id_user;
  }
  @Post(':idRecipe')
  async create(
    @GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto,
    @Param('id_recipe', new ZodValidationPipe(idRecipeSchema))
    id_recipe: idRecipeDto,
  ) {
    return this.favoritesService.create(id_user, id_recipe);
  }

  @Get()
  async findAll(
    @GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto,
  ) {
    return this.favoritesService.findAll(id_user);
  }

  @Get(':idRecipe')
  async findOne(
    @GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto,
    @Param('id_recipe', new ZodValidationPipe(idRecipeSchema))
    id_recipe: idRecipeDto,
  ) {
    return this.favoritesService.findOne(id_user, id_recipe);
  }

  /*@Patch(':idRecipe')
  async update(@GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto, @Param('id_recipe', new ZodValidationPipe(idRecipeSchema)) id_recipe: idRecipeDto) {
    return this.favoritesService.update(id_user, id_recipe);
  }*/

  @Delete(':idRecipe')
  async remove(
    @GetUser('id_user', new ZodValidationPipe(idUserSchema)) id_user: idUserDto,
    @Param('id_recipe', new ZodValidationPipe(idRecipeSchema))
    id_recipe: idRecipeDto,
  ) {
    return this.favoritesService.delete(id_user, id_recipe);
  }
}
