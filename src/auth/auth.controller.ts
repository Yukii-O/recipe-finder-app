import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; senha: string }) {
    return await this.authService.register(body.email, body.senha);
  }
  @Post('login')
  async login(@Body() body: { email: string; senha: string }) {
    return await this.authService.login(body.email, body.senha);
  }
}
