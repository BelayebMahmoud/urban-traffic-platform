import {
  Field,
  Float,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IncidentStatus, IncidentType } from '@prisma/client';

registerEnumType(IncidentType, { name: 'IncidentType' });
registerEnumType(IncidentStatus, { name: 'IncidentStatus' });

@ObjectType()
export class IncidentGql {
  @Field(() => ID)
  id: string;

  @Field(() => IncidentType)
  type: IncidentType;

  @Field(() => IncidentStatus)
  status: IncidentStatus;

  @Field()
  description: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  reportedById: string;

  @Field(() => String, { nullable: true })
  zoneId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
