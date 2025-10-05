import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TwilioService } from '../../common/services/twilio.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private twilioService: TwilioService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // SMS 인증 코드 발송
  async sendVerificationCode(phone: string) {
    const verification = await this.twilioService.sendVerificationCode(phone);

    await this.prisma.smsVerification.create({
      data: {
        phone,
        code: 'twilio_managed',
        purpose: 'LOGIN',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return {
      success: true,
      message: 'Verification code sent',
      sid: verification.sid,
    };
  }

  // 인증 코드 검증 + 로그인
  async verifyCodeAndLogin(
    phone: string,
    code: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const verification = await this.twilioService.verifyCode(phone, code);

    if (verification.status !== 'approved') {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      user = await this.usersService.create({
        phone,
        role: 'USER',
      });

      await this.prisma.userProfile.create({
        data: {
          userId: user.id,
          name: phone,
        },
      });
    }

    // USER 역할만 tokenVersion 증가 + 기존 토큰 무효화
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: 'ACTIVE',
      };

      // USER만 tokenVersion 증가
      if (user.role === 'USER') {
        updateData.tokenVersion = { increment: 1 };
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // USER만 기존 RefreshToken 무효화
      if (user.role === 'USER') {
        await tx.refreshToken.updateMany({
          where: {
            userId: user.id,
            isRevoked: false,
          },
          data: { isRevoked: true },
        });
      }

      return updated;
    });

    const tokens = await this.generateTokens(
      updatedUser.id,
      updatedUser.role,
      updatedUser.tokenVersion,
      deviceInfo,
      ipAddress,
    );

    // ✅ 프로필 완성 여부 체크 추가
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: updatedUser.id },
      select: {
        name: true,
        birthDate: true,
        nationality: true,
      },
    });

    const isProfileComplete = profile
      ? profile.name !== phone &&
        profile.birthDate !== null &&
        profile.nationality !== null
      : false;

    return {
      success: true,
      user: updatedUser,
      isProfileComplete, // ✅ 추가
      ...tokens,
    };
  }

  // Access Token + Refresh Token 생성
  private async generateTokens(
    userId: string,
    role: string,
    tokenVersion: number,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const payload = {
      sub: userId,
      role,
      tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      }),
      // Refresh Token
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    // Refresh Token DB에 저장
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo,
        ipAddress,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Refresh Token으로 새 Access Token 발급
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { tokenVersion: true, role: true, status: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // USER 역할만 tokenVersion 검증
      if (user.role === 'USER' && payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException(
          'Token invalidated - logged in from another device',
        );
      }

      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      let isValid = false;
      for (const storedToken of storedTokens) {
        const match = await bcrypt.compare(refreshToken, storedToken.token);
        if (match) {
          isValid = true;
          break;
        }
      }

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // 로그아웃
  async logout(refreshToken: string) {
    try {
      // Refresh Token 검증
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // DB에서 해당 Refresh Token 찾아서 무효화
      const storedTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: payload.sub,
          isRevoked: false,
        },
      });

      // 저장된 토큰 중 매칭되는 것 찾기
      for (const storedToken of storedTokens) {
        const match = await bcrypt.compare(refreshToken, storedToken.token);
        if (match) {
          await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
          });
          break;
        }
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
