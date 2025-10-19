import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AligoService } from '../../common/services/aligo.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { VerifySmsDto } from './dto/verify-sms.dto';
import { SmsVerificationPurpose } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private aligoService: AligoService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // SMS 인증 코드 발송
  async sendVerificationCode(phone: string) {
    const code = await this.aligoService.sendVerificationCode(phone);

    const hashedCode = await bcrypt.hash(code, 10);

    // 기존 미인증 코드 삭제
    await this.prisma.smsVerification.deleteMany({
      where: {
        phone,
      },
    });

    // 새 인증코드 저장
    await this.prisma.smsVerification.create({
      data: {
        phone,
        code: hashedCode,
        purpose: SmsVerificationPurpose.LOGIN,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
      },
    });

    return {
      success: true,
      message: 'Verification code sent',
    };
  }

  // 인증 코드 검증 + 로그인
  async verifyCodeAndLogin(
    verifySmsDto: VerifySmsDto,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    // DB에서 유효한 인증코드 조회
    const { phone, code } = verifySmsDto;

    const smsVerification = await this.prisma.smsVerification.findFirst({
      where: {
        phone,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!smsVerification) {
      throw new UnauthorizedException('Verification code not found or expired');
    }

    // 인증코드 검증
    const isValidCode = await bcrypt.compare(code, smsVerification.code);
    if (!isValidCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // 인증 성공 시 즉시 삭제 (재사용 방지)
    await this.prisma.smsVerification.delete({
      where: { id: smsVerification.id },
    });

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

    // 프로필 완성 여부 체크
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
      isProfileComplete,
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
