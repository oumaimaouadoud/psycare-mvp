import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const expectedEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!expectedEmail || email.toLowerCase() !== expectedEmail) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const hash = process.env.ADMIN_PASSWORD_HASH;
    const plain = process.env.ADMIN_PASSWORD;
    const valid = hash ? await bcrypt.compare(password, hash) : plain ? password === plain : false;

    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 24) throw new Error('JWT_SECRET must be at least 24 characters');

    const token = await this.jwt.signAsync(
      { sub: expectedEmail, role: 'admin' },
      { secret, expiresIn: '8h', issuer: 'psycare-api', audience: 'psycare-admin' },
    );

    return { token };
  }

  async verify(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException();
    return this.jwt.verifyAsync(token, {
      secret,
      issuer: 'psycare-api',
      audience: 'psycare-admin',
    });
  }
}
