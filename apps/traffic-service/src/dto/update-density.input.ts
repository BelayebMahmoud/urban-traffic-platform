import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class UpdateDensityInput {
  @Field(() => ID)
  @IsUUID()
  zoneId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  density: number;
}
