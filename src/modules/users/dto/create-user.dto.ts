import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: '전화번호',
    example: '+821012345678',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: '사용자 역할',
    enum: Role,
    default: 'USER',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
