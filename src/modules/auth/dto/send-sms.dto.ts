import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, IsNotEmpty } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+821012345678',
  })
  @IsNotEmpty()
  @IsPhoneNumber('KR')
  @IsString()
  phone: string;
}
