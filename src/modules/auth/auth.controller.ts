import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { SendSmsDto } from './dto/send-sms.dto';
import { VerifySmsDto } from './dto/verify-sms.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms/send')
  @ApiOperation({ summary: 'SMS 인증 코드 발송' })
  async sendVerificationCode(@Body() sendSmsDto: SendSmsDto) {
    return this.authService.sendVerificationCode(sendSmsDto.phone);
  }

  @Post('sms/verify')
  @ApiOperation({ summary: 'SMS 인증 코드 검증 및 로그인' })
  async verifyCodeAndLogin(
    @Body() verifySmsDto: VerifySmsDto,
    @Req() req: Request,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.authService.verifyCodeAndLogin(
      verifySmsDto.phone,
      verifySmsDto.code,
      deviceInfo,
      ipAddress,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access Token 재발급' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃 (Refresh Token 무효화)' })
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }
}
