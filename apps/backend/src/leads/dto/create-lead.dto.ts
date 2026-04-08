import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  acreage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cropFocus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedProgramIds?: string[];
}
