import {
  Field,
  Float,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { VehicleStatus, VehicleType } from '@prisma/client';

registerEnumType(VehicleType, { name: 'VehicleType' });
registerEnumType(VehicleStatus, { name: 'VehicleStatus' });

@ObjectType()
export class GpsPositionGql {
  @Field(() => ID)
  id: string;

  @Field()
  vehicleId: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float, { nullable: true })
  speed?: number | null;

  @Field()
  timestamp: Date;
}

@ObjectType()
export class VehicleGql {
  @Field(() => ID)
  id: string;

  @Field()
  plateNumber: string;

  @Field(() => VehicleType)
  type: VehicleType;

  @Field(() => VehicleStatus)
  status: VehicleStatus;

  @Field()
  ownerId: string;

  @Field(() => [GpsPositionGql], { nullable: true })
  positions?: GpsPositionGql[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
