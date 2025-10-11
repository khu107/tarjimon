import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Phone number with country code',
    example: '+821012345678',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
    default: 'USER',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
