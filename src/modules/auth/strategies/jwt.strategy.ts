import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || '',
    });
  }

  async validate(payload: any) {
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
    if (user.role === 'USER' && payload.tokenVersion !== user.tokenVersion) {
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
