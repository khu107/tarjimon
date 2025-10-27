import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSpecializationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Specialization ID',
  })
  @IsString()
  @IsNotEmpty()
  specializationId: string;
}
