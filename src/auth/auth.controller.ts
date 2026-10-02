import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { registerSchema, type RegisterDto } from './dto/register.dto.js';
import { loginSchema, type LoginDto } from './dto/login.dto.js';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto, //nota --> como nao fiz dto tipado, so zod, virando type, nao class; caso eu nao passe o constructor pro pipe, passando só 'ZodValidationPipe', o js nao vai ler e dará erro
  ) {
    return await this.authService.register(body.email, body.senha);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return await this.authService.login(body.email, body.senha);
  }

  @UseGuards(JwtAuthGuard)
  @Get('meu-perfil')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
