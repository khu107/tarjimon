import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInterpreterDto {
  @ApiProperty({
    example: 'Teshmat',
    description: 'Interpreter name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'men 10 yildan beri tarjimonlik bilan shugulanaman..... bla bla',
    description: 'Interpreter biography',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    example: 'UZBEKISTAN',
    description: 'Nationality',
    required: false,
  })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({
    example: 10,
    description: 'Years of experience',
    required: false,
  })
  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiProperty({
    example: '서울',
    description: 'Current location',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentLocation?: string;

  @ApiProperty({
    example: true,
    description: 'Online status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  onlineStatus?: boolean;
}
