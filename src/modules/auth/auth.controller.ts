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
  @ApiOperation({ summary: 'Send SMS verification code' })
  async sendVerificationCode(@Body() sendSmsDto: SendSmsDto) {
    return this.authService.sendVerificationCode(sendSmsDto.phone);
  }

  @Post('sms/verify/user')
  @ApiOperation({ summary: 'Verify SMS code and login as USER' })
  async verifyCodeAndLoginAsUser(
    @Body() verifySmsDto: VerifySmsDto,
    @Req() req: Request,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.authService.verifyCodeAndLoginAsUser(
      verifySmsDto,
      deviceInfo,
      ipAddress,
    );
  }

  @Post('sms/verify/interpreter')
  @ApiOperation({ summary: 'Verify SMS code and login as INTERPRETER' })
  async verifyCodeAndLoginAsInterpreter(
    @Body() verifySmsDto: VerifySmsDto,
    @Req() req: Request,
  ) {
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    return this.authService.verifyCodeAndLoginAsInterpreter(
      verifySmsDto,
      deviceInfo,
      ipAddress,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout (invalidate refresh token)' })
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }
}
