import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppLanguage } from '@prisma/client';

export class UpdateUserLanguageDto {
  @ApiProperty({
    description: 'App language preference',
    enum: AppLanguage,
    example: 'UZ',
  })
  @IsEnum(AppLanguage)
  appLanguage: AppLanguage;
}
