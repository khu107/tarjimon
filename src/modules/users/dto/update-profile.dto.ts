import {
  IsString,
  IsDateString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: '홍길동', description: '실제 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1990-01-01', description: '생년월일 (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({ example: 'KR', description: '국적 코드 (ISO 3166-1 alpha-2)' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: '프로필 이미지 URL (선택사항)',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
