import { cn } from '@/lib/utils';
import type {
    VehicleStatus, VehicleType, IncidentType, IncidentStatus, TrafficLevel,
} from '@/types';

// ─── Vehicle Status ──────────────────────────────────────────────────────────

const vehicleStatusMap: Record<VehicleStatus, string> = {
    ACTIVE: 'badge bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
    INACTIVE: 'badge bg-slate-700/50  text-slate-400 ring-1 ring-slate-600/30',
    MAINTENANCE: 'badge bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20',
};

const vehicleTypeMap: Record<VehicleType, string> = {
    CAR: 'badge bg-blue-500/15   text-blue-400   ring-1 ring-blue-500/20',
    TRUCK: 'badge bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20',
    BUS: 'badge bg-cyan-500/15   text-cyan-400   ring-1 ring-cyan-500/20',
    MOTORCYCLE: 'badge bg-pink-500/15   text-pink-400   ring-1 ring-pink-500/20',
};

const incidentTypeMap: Record<IncidentType, string> = {
    ACCIDENT: 'badge bg-red-500/15    text-red-400    ring-1 ring-red-500/20',
    CONSTRUCTION: 'badge bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20',
    ROAD_CLOSED: 'badge bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
    TRAFFIC_JAM: 'badge bg-amber-500/15  text-amber-400  ring-1 ring-amber-500/20',
};

const incidentStatusMap: Record<IncidentStatus, string> = {
    REPORTED: 'badge bg-blue-500/15  text-blue-400  ring-1 ring-blue-500/20',
    IN_PROGRESS: 'badge bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20',
    RESOLVED: 'badge bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
};

const trafficLevelMap: Record<TrafficLevel, string> = {
    LOW: 'badge bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
    MEDIUM: 'badge bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20',
    HIGH: 'badge bg-red-500/15   text-red-400   ring-1 ring-red-500/20',
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
    return <span className={vehicleStatusMap[status]}>{status}</span>;
}

export function VehicleTypeBadge({ type }: { type: VehicleType }) {
    return <span className={vehicleTypeMap[type]}>{type}</span>;
}

export function IncidentTypeBadge({ type }: { type: IncidentType }) {
    const label = type.replace('_', ' ');
    return <span className={incidentTypeMap[type]}>{label}</span>;
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
    const label = status.replace('_', ' ');
    return <span className={incidentStatusMap[status]}>{label}</span>;
}

export function TrafficLevelBadge({ level }: { level: TrafficLevel }) {
    return <span className={trafficLevelMap[level]}>{level}</span>;
}
