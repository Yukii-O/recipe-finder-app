import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import type { idRecipeDto, idUserDto } from './dto/list-favorites.dto.js';

type MethodsType = 'create' | 'findAll' | 'findOne' | 'delete';

@Injectable()
export class FavoritesService {
  private readonly optionsMethods: Record<MethodsType, boolean>;
  constructor(private readonly prisma: PrismaService) {
    this.optionsMethods = {
      create: false,
      findAll: false,
      findOne: false,
      delete: false,
    };
  }
  async create(
    id_user: idUserDto,
    id_recipe: idRecipeDto,
  ): Promise<{ id_user: string; id_recipe: number } | undefined> {
    try {
      return await this.prisma.favorite_recipes.upsert({
        //upsert por causa de idempotência
        where: {
          id_user_id_recipe: {
            id_user,
            id_recipe,
          },
        },
        update: {},
        create: {
          id_user,
          id_recipe,
        },
      });
    } catch (error) {
      this.handleError(error, 'FavoritesService', 'create');
    }
  }

  async findAll(id_user: string) {
    try {
      return await this.prisma.favorite_recipes.findMany({
        where: { id_user },
      });
    } catch (error) {
      this.handleError(error, 'FavoritesService', 'findAll');
    }
  }

  async findOne(id_user: string, id_recipe: number) {
    try {
      const result = await this.prisma.favorite_recipes.findUnique({
        where: {
          id_user_id_recipe: {
            id_user,
            id_recipe,
          },
        },
      });
      if (!result) {
        throw new NotFoundException('Não existe receita com este id');
      }
    } catch (error) {
      this.handleError(error, 'FavoritesService', 'findOne');
    }
  }

  /*  async update(id_user: string, id_recipe: number) {
    return `This action updates a #${id} favorite`;
  }*/

  async delete(id_user: string, id_recipe: number) {
    try {
      return await this.prisma.favorite_recipes.delete({
        where: {
          id_user_id_recipe: {
            id_user,
            id_recipe,
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'FavoritesService', 'delete');
    }
  }
  private handleError(error: unknown, context: string, methods: MethodsType) {
    const options = { ...this.optionsMethods, [methods]: true };

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' && options.create) {
        throw new ConflictException(
          `${error.message} receita já favoritada em ${context}`,
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `${error.message} erro de fk. o usuário ou receita deste token não existe mais em ${context}`,
        );
      }
      if (error.code === 'P2025' && options.delete) {
        throw new NotFoundException(
          `${error.message} Não existe receita com este id em ${context}`,
        );
      }
    }
    throw new BadGatewayException(
      `${error instanceof Error ? error.message : String(error)} Erro na comunicação da proxy com API em ${context}`,
    );
  }
}
