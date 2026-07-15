import React from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

export default function PriceChart({ data, steps }) {
  const historyPoints = data.history.dates.map((d, i) => ({
    date: d, historical: data.history.values[i],
  }))
  const forecastPoints = data.forecast.dates.map((d, i) => ({
    date: d,
    forecast: data.forecast.ensemble[i],
    lower: data.forecast.lower_band[i],
    upper: data.forecast.upper_band[i],
    band: data.forecast.upper_band[i] - data.forecast.lower_band[i],
  }))
  const combined = [...historyPoints, ...forecastPoints]

  return (
    <div className="chart-card">
      <div className="eyebrow">📈 Mwenendo wa Bei na Utabiri</div>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={combined} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,124,123,0.08)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" stackId="band" />
          <Area type="monotone" dataKey="band" stroke="none" fill="rgba(14,124,123,0.15)" stackId="band" name="Upeo wa Utabiri" />
          <Line type="monotone" dataKey="historical" stroke="#0B5457" strokeWidth={2.5} dot={false} name="Bei ya Kihistoria" />
          <Line type="monotone" dataKey="forecast" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} name={`Utabiri (Siku ${steps})`} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}