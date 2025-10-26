import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterpreterStatus } from '@prisma/client';

export class AdminFilterInterpreterDto {
  @ApiProperty({
    example: 'PENDING_APPROVAL',
    description: 'Interpreter status filter',
    enum: InterpreterStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InterpreterStatus)
  status?: InterpreterStatus;

  @ApiProperty({
    example: 'Teshmat',
    description: 'Search by name or phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
