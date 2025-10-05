import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private verifyServiceSid: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const verifyServiceSid = this.configService.get<string>(
      'TWILIO_VERIFY_SERVICE_SID',
    );

    if (!accountSid || !authToken || !verifyServiceSid) {
      throw new Error('Twilio credentials are not configured');
    }

    this.verifyServiceSid = verifyServiceSid;
    this.client = twilio(accountSid, authToken);
  }

  // SMS 인증 코드 발송
  async sendVerificationCode(phone: string) {
    return this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });
  }

  // 인증 코드 검증
  async verifyCode(phone: string, code: string) {
    return this.client.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({
        to: phone,
        code: code,
      });
  }
}
