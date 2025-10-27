import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AligoService } from '../../common/services/aligo.service';
import { UsersService } from '../users/users.service';
import { VerifySmsDto } from './dto/verify-sms.dto';
import { Role, SmsVerificationPurpose } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EnvConfig } from 'src/config/env.validation';

@Injectable()
export class AuthService {
  //  관리자 전화번호 목록 추가
  private readonly ADMIN_PHONES = [
    '01043879779', // 대표
    '010-9999-9999',
    // CTO
  ];

  constructor(
    private prisma: PrismaService,
    private aligoService: AligoService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvConfig, true>,
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

  // 공통 인증 로직 (private)
  private async verifyCodeAndCreateUser(
    verifySmsDto: VerifySmsDto,
    role: 'USER' | 'INTERPRETER',
    deviceInfo?: string,
    ipAddress?: string,
  ) {
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

    const isValidCode = await bcrypt.compare(code, smsVerification.code);
    if (!isValidCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.smsVerification.delete({
      where: { id: smsVerification.id },
    });

    //  관리자 전화번호 체크
    const isAdmin = this.ADMIN_PHONES.includes(phone);
    const finalRole = isAdmin ? Role.ADMIN : role;

    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      user = await this.usersService.create({
        phone,
        role: finalRole, //  ADMIN 또는 USER/INTERPRETER
      });

      //  역할에 따라 프로필 생성 (ADMIN은 생성 안 함)
      if (finalRole === Role.USER) {
        await this.prisma.userProfile.create({
          data: {
            userId: user.id,
            name: phone,
          },
        });
      } else if (finalRole === Role.INTERPRETER) {
        await this.prisma.interpreter.create({
          data: {
            userId: user.id,
          },
        });
      }
    } else if (isAdmin && user.role !== Role.ADMIN) {
      //  기존 사용자인데 관리자 번호면 ADMIN으로 업그레이드
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: Role.ADMIN },
      });
    }

    // USER 역할만 tokenVersion 증가 + 기존 토큰 무효화
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: 'ACTIVE',
      };

      if (user.role === Role.USER) {
        updateData.tokenVersion = { increment: 1 };
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (user.role === Role.USER) {
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

    return {
      success: true,
      user: updatedUser,
      ...tokens,
    };
  }

  // 사용자 로그인
  async verifyCodeAndLoginAsUser(
    verifySmsDto: VerifySmsDto,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const result = await this.verifyCodeAndCreateUser(
      verifySmsDto,
      Role.USER,
      deviceInfo,
      ipAddress,
    );

    if (result.user.role === Role.ADMIN) {
      return {
        ...result,
        isProfileComplete: true, // 관리자는 항상 완성
      };
    }

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: result.user.id },
      select: {
        name: true,
        nationality: true,
      },
    });

    const isProfileComplete = profile
      ? profile.name !== result.user.phone && profile.nationality !== null
      : false;

    return {
      ...result,
      isProfileComplete,
    };
  }

  // 통역사 로그인
  async verifyCodeAndLoginAsInterpreter(
    verifySmsDto: VerifySmsDto,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const result = await this.verifyCodeAndCreateUser(
      verifySmsDto,
      Role.INTERPRETER,
      deviceInfo,
      ipAddress,
    );

    //  ADMIN이면 프로필 완성 체크 안 함
    if (result.user.role === Role.ADMIN) {
      return {
        ...result,
        isProfileComplete: true, // 관리자는 항상 완성
      };
    }

    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId: result.user.id },
      include: {
        languages: true,
        specializations: true,
      },
    });

    const isProfileComplete =
      interpreter &&
      interpreter.bio &&
      interpreter.nationality &&
      interpreter.languages.length > 0 &&
      interpreter.specializations.length > 0;

    return {
      ...result,
      isProfileComplete,
    };
  }

  // 기존 메서드 (하위호환성)
  async verifyCodeAndLogin(
    verifySmsDto: VerifySmsDto,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    return this.verifyCodeAndLoginAsUser(verifySmsDto, deviceInfo, ipAddress);
  }

  // Access Token + Refresh Token 생성
  private async generateTokens(
    userId: string,
    role: string,
    tokenVersion: number,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    // 🆕 User의 appLanguage 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { appLanguage: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: userId,
      role,
      tokenVersion,
      appLanguage: user.appLanguage,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET', {
          infer: true,
        }),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', {
          infer: true,
        }),
      }),
      // Refresh Token
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
          infer: true,
        }),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', {
          infer: true,
        }),
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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
          infer: true,
        }),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          tokenVersion: true,
          role: true,
          status: true,
          appLanguage: true, // 🆕 추가
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // USER 역할만 tokenVersion 검증
      if (
        user.role === Role.USER &&
        payload.tokenVersion !== user.tokenVersion
      ) {
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
          appLanguage: user.appLanguage, // 🆕 추가
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET', {
            infer: true,
          }),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', {
            infer: true,
          }),
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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
          infer: true,
        }),
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
