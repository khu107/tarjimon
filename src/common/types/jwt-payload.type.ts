import { AppLanguage, Role, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: Role;
  tokenVersion: number;
  appLanguage: AppLanguage;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  tokenVersion: number;
  appLanguage: AppLanguage;
}
