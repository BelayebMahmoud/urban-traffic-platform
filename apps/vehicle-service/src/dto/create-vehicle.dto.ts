import {
    IsIn,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator';
import { VehicleStatus, VehicleType } from '../models/vehicle.model';

const VEHICLE_TYPES: VehicleType[] = [
    'CAR',
    'BUS',
    'MOTORBIKE',
    'TRUCK',
    'EMERGENCY',
];

const VEHICLE_STATUSES: VehicleStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 20)
    @Matches(/^[A-Z0-9-]+$/i)
    plateNumber: string;

    @IsIn(VEHICLE_TYPES)
    type: VehicleType;

    @IsIn(VEHICLE_STATUSES)
    status: VehicleStatus;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    ownerName: string;
}
