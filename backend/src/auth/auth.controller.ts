import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LoginDto } from './login.dto.js';
import { AuthService } from './auth.service.js';
import { AdminAuthGuard } from './admin-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { token } = await this.auth.login(dto.email, dto.password);
    response.cookie('admin_session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
});

    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {

    response.clearCookie('admin_session', {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});


    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me() {
    return { authenticated: true, role: 'admin' };
  }
}
