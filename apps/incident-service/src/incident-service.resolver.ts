import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { CreateIncidentInput } from './dto/create-incident.input';
import { UpdateIncidentStatusInput } from './dto/update-incident-status.input';
import { IncidentGql } from './models/incident-gql.model';
import { IncidentServiceService } from './incident-service.service';

@Resolver(() => IncidentGql)
export class IncidentServiceResolver {
  constructor(private readonly incidentSvc: IncidentServiceService) {}

  @Query(() => [IncidentGql])
  incidents(): Promise<any[]> {
    return this.incidentSvc.getIncidents();
  }

  @Query(() => IncidentGql)
  incident(@Args('id', { type: () => ID }) id: string): Promise<any> {
    return this.incidentSvc.getIncident(id);
  }

  @Mutation(() => IncidentGql)
  @UseGuards(JwtAuthGuard)
  declareIncident(
    @Args('input') input: CreateIncidentInput,
    @CurrentUser() user: { id: string },
  ): Promise<any> {
    return this.incidentSvc.declareIncident(input, user.id);
  }

  @Mutation(() => IncidentGql)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateIncidentStatus(@Args('input') input: UpdateIncidentStatusInput): Promise<any> {
    return this.incidentSvc.updateIncidentStatus(input.incidentId, input.status);
  }
}
