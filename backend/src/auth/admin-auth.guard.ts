import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const bearer = request.headers.authorization?.startsWith('Bearer ')
      ? request.headers.authorization.slice(7)
      : undefined;
    const token = request.cookies?.admin_session as string | undefined ?? bearer;
    if (!token) throw new UnauthorizedException();

    try {
      await this.auth.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
