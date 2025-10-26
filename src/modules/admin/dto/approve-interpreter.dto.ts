import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveInterpreterDto {
  @ApiProperty({
    example: '자격증이 적합하여 승인합니다.',
    description: 'Admin note for approval',
    required: false,
  })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
