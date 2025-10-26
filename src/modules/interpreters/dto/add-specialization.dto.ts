import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSpecializationDto {
  @ApiProperty({
    example: '의료',
    description: 'Specialization name (의료, 법률, 기술, etc)',
  })
  @IsString()
  @IsNotEmpty()
  specializationName: string;
}
