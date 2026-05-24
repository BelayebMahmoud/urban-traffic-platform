import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { TrafficServiceService } from './traffic-service.service';

@Controller('traffic-zones')
export class TrafficServiceController {
  constructor(private readonly svc: TrafficServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createZone(
    @Body()
    body: {
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
    },
  ) {
    return this.svc.createZone(body);
  }

  @Get()
  getZones() {
    return this.svc.getZones();
  }

  @Get('congested')
  getCongestedZones() {
    return this.svc.getCongestedZones();
  }

  @Get(':id')
  getZone(@Param('id') id: string) {
    return this.svc.getZone(id);
  }

  @Patch('density')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateDensity(@Body() body: { zoneId: string; density: number }) {
    return this.svc.updateDensity(body);
  }
}
