import { Field, InputType } from '@nestjs/graphql';
import { VehicleStatus, VehicleType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

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
}
