import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EnvConfig } from 'src/config/env.validation';

@Injectable()
export class AligoService {
  private readonly apiKey: string;
  private readonly userId: string;
  private readonly sender: string;
  private readonly apiUrl = 'https://apis.aligo.in/send/';

  constructor(private configService: ConfigService<EnvConfig, true>) {
    const apiKey = this.configService.get<string>('ALIGO_API_KEY', {
      infer: true,
    });
    const userId = this.configService.get<string>('ALIGO_USER_ID', {
      infer: true,
    });
    const sender = this.configService.get<string>('ALIGO_SENDER', {
      infer: true,
    });

    if (!apiKey || !userId || !sender) {
      throw new Error('Aligo credentials are not configured');
    }

    this.apiKey = apiKey;
    this.userId = userId;
    this.sender = sender;
  }

  private formatPhoneNumber(phone: string): string {
    // +82로 시작하면 0으로 변경
    if (phone.startsWith('+82')) {
      return '0' + phone.slice(3);
    }
    // - 제거
    return phone.replace(/-/g, '');
  }

  /**
   * 6자리 랜덤 인증코드 생성
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 알리고 SMS 발송
   */
  async sendSms(phone: string, message: string): Promise<void> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      const params = new URLSearchParams({
        key: this.apiKey,
        user_id: this.userId,
        sender: this.sender,
        receiver: formattedPhone,
        msg: message,
        msg_type: 'SMS',
        testmode_yn: 'N',
        // this.configService.get('NODE_ENV') === 'development' ? 'Y' : 'N',
      });

      const response = await axios.post(this.apiUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.result_code !== '1') {
        throw new Error(`Aligo SMS failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Aligo SMS Error:', error);
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }

  /**
   * 인증코드 발송
   */
  async sendVerificationCode(phone: string): Promise<string> {
    const code = this.generateVerificationCode();
    const message = `Hello_Helper 인증번호는 [${code}]입니다.`;

    await this.sendSms(phone, message);

    return code;
  }
}
