import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, IsNotEmpty } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({
    description: '전화번호 (국가코드 포함)',
    example: '+821012345678',
  })
  @IsNotEmpty()
  @IsPhoneNumber('KR')
  @IsString()
  phone: string;
}
