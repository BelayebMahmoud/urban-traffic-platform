import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SimulatePositionDto {
    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(300)
    speed?: number;
}
