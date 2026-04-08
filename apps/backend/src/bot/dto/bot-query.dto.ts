import { IsString, MinLength } from 'class-validator';

export class BotQueryDto {
  @IsString()
  @MinLength(2)
  message!: string;
}
