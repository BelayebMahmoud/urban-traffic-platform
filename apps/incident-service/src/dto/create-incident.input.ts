import { Field, Float, InputType } from '@nestjs/graphql';
import { IncidentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateIncidentInput {
  @Field(() => IncidentType)
  @IsEnum(IncidentType)
  type: IncidentType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

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

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  zoneId?: string;
}
