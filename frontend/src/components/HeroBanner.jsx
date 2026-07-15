import React from 'react'

export default function HeroBanner({ t, data, currencyDisplay }) {
  const up = data.rate_delta >= 0
  const arrow = up ? '▲' : '▼'
  const color = up ? '#D94E1F' : '#0E9F6E'

  return (
    <>
      <div className="hero-row">
        <div className="hero-banner">
          <div className="hero-title">{t.headerTitle}</div>
          <p className="hero-sub">{t.headerSub}</p>
        </div>

        <div className="glass-card g-indigo hero-pill">
          <div className="gc-label">Bei ya Sasa · {currencyDisplay}/TZS</div>
          <div className="gc-value">TZS {data.current_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="gc-note" style={{ color, fontWeight: 600 }}>
            {arrow} {Math.abs(data.rate_delta).toFixed(2)} ({Math.abs(data.rate_delta_pct).toFixed(2)}%) tangu jana
          </div>
          <div className="gc-icon">💱</div>
        </div>
      </div>

      {data.days_old > 2 && (
        <div className="data-warn-3d">
          📅 Bei ni ya <b>{data.last_date}</b> (siku {data.days_old} zilizopita). Kwa bei halisi tembelea{' '}
          <a href="https://www.bot.go.tz" target="_blank" rel="noreferrer">www.bot.go.tz</a>.
        </div>
      )}

      <div className="shimmer-line"></div>
    </>
  )
}