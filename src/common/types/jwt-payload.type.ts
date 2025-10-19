import { Role, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: Role;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  tokenVersion: number;
}
