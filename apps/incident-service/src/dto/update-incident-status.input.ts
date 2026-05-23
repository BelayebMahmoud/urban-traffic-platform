import { Field, ID, InputType } from '@nestjs/graphql';
import { IncidentStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

@InputType()
export class UpdateIncidentStatusInput {
  @Field(() => ID)
  @IsUUID()
  incidentId: string;

  @Field(() => IncidentStatus)
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}
