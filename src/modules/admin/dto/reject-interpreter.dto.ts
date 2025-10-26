import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectInterpreterDto {
  @ApiProperty({
    example: '자격증이 유효하지 않습니다.',
    description: 'Reason for rejection (required)',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
