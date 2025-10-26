import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AuthenticatedUser,
  JwtPayload,
} from 'src/common/types/jwt-payload.type';
import { Role } from '@prisma/client';
import { EnvConfig } from 'src/config/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService<EnvConfig, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET', {
        infer: true,
      }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        tokenVersion: true,
        role: true,
        status: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // USER 역할만 tokenVersion 체크 (단일 기기만 허용)
    if (user.role === Role.USER && payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException(
        'Token invalidated - logged in from another device',
      );
    }

    // ADMIN, INTERPRETER는 tokenVersion 체크 안 함 (다중 기기 허용)

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
  }
}
