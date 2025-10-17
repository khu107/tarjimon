import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifySmsDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '01012345678',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
  })
  @IsString()
  code: string;
}
