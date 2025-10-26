import { IsString, IsOptional, IsISO8601, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddCertificationDto {
  @ApiProperty({
    example: '공인 번역사',
    description: 'Certification name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '대한민국',
    description: 'Issuing organization',
    required: false,
  })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiProperty({
    example: '2020-01-15',
    description: 'Issue date (YYYY-MM-DD)',
  })
  @IsISO8601()
  @Transform(({ value }) => {
    if (value && !value.includes('T')) {
      return new Date(value).toISOString();
    }
    return value;
  })
  issueDate: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Expiry date (YYYY-MM-DD, optional)',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => {
    if (value && !value.includes('T')) {
      return new Date(value).toISOString();
    }
    return value;
  })
  expiryDate?: string;

  @ApiProperty({
    example: 'https://example.com/certificate.pdf',
    description: 'Document URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}
