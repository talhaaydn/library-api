import { IsInt, Min, Max } from 'class-validator';

export class ReturnBookDto {
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}

