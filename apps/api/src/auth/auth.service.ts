import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { demoUser } from '../common/data';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  login(input: { loginId?: string; organization?: string; username?: string; password: string }) {
    const loginId = input.loginId?.trim();
    const organization = (input.organization?.trim() || loginId?.slice(0, 4) || '').toUpperCase();
    const username = input.username?.trim() || loginId?.slice(4) || '';
    const password = input.password.trim();

    if (organization !== demoUser.organization || username.toLowerCase() !== demoUser.username.toLowerCase() || password !== demoUser.password) {
      throw new UnauthorizedException('Invalid organization, user, or password');
    }

    const user = {
      organization,
      username,
      displayName: demoUser.displayName,
      role: demoUser.role,
    };

    return {
      token: this.jwt.sign(user),
      user,
    };
  }

  verify(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    try {
      return this.jwt.verify(token);
    } catch {
      return null;
    }
  }
}
