import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifySmsDto {
  @ApiProperty({
    description: '전화번호 (국가코드 포함)',
    example: '+821012345678',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: '6자리 인증 코드',
    example: '123456',
  })
  @IsString()
  code: string;
}
