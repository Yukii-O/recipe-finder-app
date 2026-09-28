import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

import type { usersModel } from '../generated/prisma/models.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(email: string, senhaHash: string): Promise<usersModel> {
    return await this.prisma.users.create({
      data: { email, senha: senhaHash },
    });
  }
  async findByEmail(email: string): Promise<usersModel | null> {
    return await this.prisma.users.findUnique({ where: { email } });
  }
}
