import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';
import type { usersModel } from '../generated/prisma/models.js';
import { Prisma } from '../generated/prisma/client.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly hashFalso = argon2Hash('senha-falsa-para-igualar-o-tempo');
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    senha: string,
  ): Promise<Omit<usersModel, 'senha'>> {
    const hash = await argon2Hash(senha);
    try {
      const user = await this.usersService.createUser(email, hash);
      const { senha: _senha, ...publico } = user;
      return publico;
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException('Email já cadastrado');
      }
      throw erro;
    }
  }

  async login(email: string, senha: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);
    const senhaHash = user ? user.senha : await this.hashFalso;
    const verify = await argon2Verify(senhaHash, senha);

    if (!user || !verify) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = await this.jwtService.signAsync({ sub: user.id_user });
    return { access_token: token };
  }
}
