import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { SimulatePositionInput } from './dto/simulate-position.input';
import { GpsPositionGql, VehicleGql } from './models/vehicle-gql.model';
import { VehicleServiceService } from './vehicle-service.service';

@Resolver(() => VehicleGql)
export class VehicleServiceResolver {
  constructor(private readonly vehicleSvc: VehicleServiceService) {}

  @Query(() => [VehicleGql])
  @UseGuards(JwtAuthGuard)
  vehicles(): Promise<any[]> {
    return this.vehicleSvc.getVehicles();
  }

  @Query(() => VehicleGql)
  @UseGuards(JwtAuthGuard)
  vehicle(@Args('id', { type: () => ID }) id: string): Promise<any> {
    return this.vehicleSvc.getVehicle(id);
  }

  @Mutation(() => VehicleGql)
  @UseGuards(JwtAuthGuard)
  createVehicle(
    @Args('input') input: CreateVehicleInput,
    @CurrentUser() user: { id: string },
  ): Promise<any> {
    return this.vehicleSvc.createVehicle({ ...input, ownerId: user.id });
  }

  @Mutation(() => GpsPositionGql)
  @UseGuards(JwtAuthGuard)
  recordGpsPosition(@Args('input') input: SimulatePositionInput): Promise<any> {
    return this.vehicleSvc.recordGpsPosition(input.vehicleId, {
      latitude: input.latitude,
      longitude: input.longitude,
      speed: input.speed,
    });
  }

  @Query(() => [GpsPositionGql])
  @UseGuards(JwtAuthGuard)
  vehicleHistory(
    @Args('vehicleId', { type: () => ID }) vehicleId: string,
  ): Promise<any[]> {
    return this.vehicleSvc.getMovementHistory(vehicleId);
  }
}
