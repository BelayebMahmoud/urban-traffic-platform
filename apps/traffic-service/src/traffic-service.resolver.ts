import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { CreateZoneInput } from './dto/create-zone.input';
import { UpdateDensityInput } from './dto/update-density.input';
import { TrafficZoneGql } from './models/traffic-zone.model';
import { TrafficServiceService } from './traffic-service.service';

@Resolver(() => TrafficZoneGql)
export class TrafficServiceResolver {
  constructor(private readonly traffic: TrafficServiceService) {}

  @Query(() => [TrafficZoneGql])
  trafficZones(): Promise<any[]> {
    return this.traffic.getZones();
  }

  @Query(() => TrafficZoneGql)
  trafficZone(@Args('id', { type: () => ID }) id: string): Promise<any> {
    return this.traffic.getZone(id);
  }

  @Query(() => [TrafficZoneGql])
  congestedZones(): Promise<any[]> {
    return this.traffic.getCongestedZones();
  }

  @Mutation(() => TrafficZoneGql)
  @UseGuards(JwtAuthGuard)
  createTrafficZone(@Args('input') input: CreateZoneInput): Promise<any> {
    return this.traffic.createZone(input);
  }

  @Mutation(() => TrafficZoneGql)
  @UseGuards(JwtAuthGuard)
  updateTrafficDensity(@Args('input') input: UpdateDensityInput): Promise<any> {
    return this.traffic.updateDensity(input);
  }
}
