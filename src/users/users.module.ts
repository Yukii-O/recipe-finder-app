import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Module({ imports: [], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}
