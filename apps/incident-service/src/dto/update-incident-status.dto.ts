import { IsIn } from 'class-validator';
import type { IncidentStatus } from '../models/incident.model';

const INCIDENT_STATUSES: IncidentStatus[] = [
  'REPORTED',
  'IN_PROGRESS',
  'RESOLVED',
];

export class UpdateIncidentStatusDto {
  @IsIn(INCIDENT_STATUSES)
  status: IncidentStatus;
}
