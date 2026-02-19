import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, MinLength } from 'class-validator';
import { NewsType, NewsStatus } from '../entities/news.entity';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  content: string;

  @IsEnum(NewsType)
  type: NewsType;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number;
}
