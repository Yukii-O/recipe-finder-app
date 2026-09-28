import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import type { usersModel } from '../generated/prisma/models.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(
    email: string,
    senha: string,
  ): Promise<Omit<usersModel, 'senha'>> {
    throw new Error('Not implemented');
  }
  async login(email: string, senha: string): Promise<{ access_token: string }> {
    throw new Error('Not implemented');
  }
}
