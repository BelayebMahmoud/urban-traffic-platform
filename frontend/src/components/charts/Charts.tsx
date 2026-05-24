'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// ─── Area Chart ───────────────────────────────────────────────────────────────

interface AreaData {
  name: string;
  value: number;
}

export function TrafficAreaChart({ data }: { data: AreaData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f62ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4f62ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#818cf8' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#4f62ff"
          strokeWidth={2}
          fill="url(#colorVal)"
          dot={false}
          activeDot={{ r: 4, fill: '#4f62ff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────

interface PieData {
  name: string;
  value: number;
  color: string;
}

export function StatusPieChart({ data }: { data: PieData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            fontSize: 12,
          }}
          itemStyle={{ color: '#94a3b8' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarData {
  name: string;
  incidents: number;
  resolved: number;
}

export function IncidentBarChart({ data }: { data: BarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: '#1e293b' }}
        />
        <Legend
          formatter={(v) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>
          )}
        />
        <Bar dataKey="incidents" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
