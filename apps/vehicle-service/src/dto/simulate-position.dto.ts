import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SimulatePositionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  speed?: number;
}
