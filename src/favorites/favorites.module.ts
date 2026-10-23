import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { FavoritesController } from './favorites.controller.js';
import { RecipesModule } from '../recipes/recipes.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [RecipesModule, AuthModule],
})
export class FavoritesModule {}
