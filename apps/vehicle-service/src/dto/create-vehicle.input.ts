import { Field, Float, InputType } from '@nestjs/graphql';
import { VehicleStatus, VehicleType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class CreateVehicleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  @Matches(/^[A-Z0-9-]+$/i)
  plateNumber: string;

  @Field(() => VehicleType)
  @IsEnum(VehicleType)
  type: VehicleType;

  @Field(() => VehicleStatus)
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
