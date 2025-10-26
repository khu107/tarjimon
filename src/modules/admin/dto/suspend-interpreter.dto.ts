import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspendInterpreterDto {
  @ApiProperty({
    example: '부적절한 행동으로 인한 정지',
    description: 'Reason for suspension (required)',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
