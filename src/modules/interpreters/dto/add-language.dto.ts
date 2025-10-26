import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLanguageDto {
  @ApiProperty({
    example: 'ko',
    description: 'Language code (ko, en, ja, zh, etc)',
  })
  @IsString()
  @IsNotEmpty()
  languageCode: string;
}
