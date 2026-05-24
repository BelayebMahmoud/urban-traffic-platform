'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/auth';
import type { Vehicle, TrafficZone, Incident } from '@/types';

// Webpack strips the default icon URLs — patch them back in
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface VehiclePositionEvent {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
}

interface Props {
  vehicles: Vehicle[];
  zones: TrafficZone[];
  incidents: Incident[];
}

const ZONE_COLOR: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#22c55e',
};

function vehicleIcon(status: string) {
  const color =
    status === 'ACTIVE'
      ? '#22c55e'
      : status === 'MAINTENANCE'
        ? '#f59e0b'
        : '#64748b';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}90"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function incidentIcon(type: string) {
  const color =
    type === 'ACCIDENT'
      ? '#ef4444'
      : type === 'CONSTRUCTION'
        ? '#f97316'
        : type === 'ROAD_CLOSED'
          ? '#8b5cf6'
          : '#f59e0b';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:10px;height:10px;background:${color};border:2px solid #fff;box-shadow:0 0 6px ${color}90;transform:rotate(45deg)"></span>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export default function VehicleMapInner({ vehicles, zones, incidents }: Props) {
  const { user } = useAuth();

  // Seed vehicle positions from the last recorded GPS fix
  const [positions, setPositions] = useState<
    Record<string, VehiclePositionEvent>
  >(() => {
    const init: Record<string, VehiclePositionEvent> = {};
    for (const v of vehicles) {
      const last = v.positions?.at(-1);
      if (last) {
        init[v.id] = {
          vehicleId: v.id,
          latitude: last.latitude,
          longitude: last.longitude,
          speed: last.speed,
        };
      }
    }
    return init;
  });

  const [liveZones, setLiveZones] = useState<TrafficZone[]>(zones);
  const [liveIncidents, setLiveIncidents] = useState<Incident[]>(incidents);

  // Keep local state in sync if the parent re-fetches
  useEffect(() => {
    setLiveZones(zones);
  }, [zones]);
  useEffect(() => {
    setLiveIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const socket = io(url, { transports: ['websocket'] });

    socket.on('connect', () => {
      if (user?.id) socket.emit('join', user.id);
    });

    socket.on('vehicle:position', (data: VehiclePositionEvent) => {
      setPositions((prev) => ({ ...prev, [data.vehicleId]: data }));
    });

    socket.on('zone:updated', (zone: TrafficZone) => {
      setLiveZones((prev) => prev.map((z) => (z.id === zone.id ? zone : z)));
    });

    socket.on('incident:new', (incident: Incident) => {
      setLiveIncidents((prev) => [incident, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const vehicleLookup = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const posArr = Object.values(positions);
  const center: [number, number] =
    posArr.length > 0
      ? [
          posArr.reduce((s, p) => s + p.latitude, 0) / posArr.length,
          posArr.reduce((s, p) => s + p.longitude, 0) / posArr.length,
        ]
      : [48.8566, 2.3522];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
      />

      {liveZones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.latitude, zone.longitude]}
          radius={zone.radius}
          pathOptions={{
            color: ZONE_COLOR[zone.level] ?? '#64748b',
            fillOpacity: 0.12,
            weight: 1.5,
          }}
        >
          <Popup>
            <strong>{zone.name}</strong>
            <br />
            Level: {zone.level} &mdash; Density: {zone.density.toFixed(1)}%
          </Popup>
        </Circle>
      ))}

      {posArr.map((pos) => {
        const v = vehicleLookup[pos.vehicleId];
        if (!v) return null;
        return (
          <Marker
            key={pos.vehicleId}
            position={[pos.latitude, pos.longitude]}
            icon={vehicleIcon(v.status)}
          >
            <Popup>
              <strong>{v.plateNumber}</strong>
              <br />
              {v.type} &mdash; {v.status}
              <br />
              {pos.speed != null
                ? `${pos.speed.toFixed(1)} km/h`
                : 'Speed unknown'}
            </Popup>
          </Marker>
        );
      })}

      {liveIncidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.latitude, inc.longitude]}
          icon={incidentIcon(inc.type)}
        >
          <Popup>
            <strong>{inc.type.replace('_', ' ')}</strong>
            <br />
            {inc.status}
            <br />
            {inc.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
