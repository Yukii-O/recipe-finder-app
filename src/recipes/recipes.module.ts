import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service.js';
import { RecipesController } from './recipes.controller.js';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [RecipesController],
  imports: [HttpModule.register({ timeout: 10000 }), AuthModule],
  providers: [RecipesService],
})
export class RecipesModule {}
