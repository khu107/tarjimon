import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'KR',
    description: 'Nationality code (ISO 3166-1 alpha-2)',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile image URL (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
