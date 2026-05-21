import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { IncidentType } from '../models/incident.model';

const INCIDENT_TYPES: IncidentType[] = [
  'ACCIDENT',
  'CONSTRUCTION',
  'ROAD_CLOSED',
  'TRAFFIC_JAM',
];

export class CreateIncidentDto {
  @IsIn(INCIDENT_TYPES)
  type: IncidentType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  reportedBy: string;
}
