import {
  Field,
  Float,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { TrafficLevel } from '@prisma/client';

registerEnumType(TrafficLevel, { name: 'TrafficLevel' });

@ObjectType()
export class TrafficZoneGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float)
  radius: number;

  @Field(() => Float)
  density: number;

  @Field(() => TrafficLevel)
  level: TrafficLevel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
