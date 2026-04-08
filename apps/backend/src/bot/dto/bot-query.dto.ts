import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class BotQueryDto {
  @IsString()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  crop?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  problem?: string;

  @IsOptional()
  @IsBoolean()
  contactRequested?: boolean;
}
