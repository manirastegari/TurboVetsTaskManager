import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { User, Role } from '@turbo-vets-task-manager/data';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: NestJwtService) {}

  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
