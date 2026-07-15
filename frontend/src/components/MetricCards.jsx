import React from 'react'

export default function MetricCards({ data }) {
  const up = data.rate_delta >= 0
  const arrow = up ? '▲' : '▼'
  const color = up ? '#D94E1F' : '#0E9F6E'
  const urgClass = { "Juu": "g-rose", "Kati": "g-amber", "Ndogo": "g-emerald" }[data.advice.urgency_level] || "g-sky"

  return (
    <div className="metric-grid">
      <div className="glass-card g-indigo">
        <div className="gc-label">Bei ya Wastani</div>
        <div className="gc-value">TZS {Math.round(data.current_rate).toLocaleString()}</div>
        <div className="gc-note" style={{ color, fontWeight: 600 }}>{arrow} {Math.abs(data.rate_delta_pct).toFixed(2)}% leo</div>
        <div className="gc-icon">📊</div>
      </div>
      <div className="glass-card g-emerald">
        <div className="gc-label">Bei ya Kununua</div>
        <div className="gc-value">TZS {Math.round(data.buying).toLocaleString()}</div>
        <div className="gc-note">Benki inanunua {data.currency}</div>
        <div className="gc-icon">🏦</div>
      </div>
      <div className="glass-card g-violet">
        <div className="gc-label">Bei ya Kuuza</div>
        <div className="gc-value">TZS {Math.round(data.selling).toLocaleString()}</div>
        <div className="gc-note">Benki inakuuzia {data.currency}</div>
        <div className="gc-icon">💰</div>
      </div>
      <div className={`glass-card ${urgClass}`}>
        <div className="gc-label">Hatari ya Dharura</div>
        <div className="gc-value">{data.advice.urgency_level}</div>
        <div className="gc-note">{data.advice.urgency_note}</div>
        <div className="gc-icon">⚠️</div>
      </div>
    </div>
  )
}