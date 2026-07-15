import React from 'react'

export default function InsightCards({ data }) {
  const bd = data.best_day
  return (
    <>
      <div className="eyebrow" style={{ marginTop: '1rem' }}>📅 Siku Bora ya Kulipa — Uchambuzi wa Kihistoria</div>
      <div className="insight-grid">
        <div className="insight-3d ins-purple">
          <div className="ins-label">Siku Bora ya Wiki</div>
          <div className="ins-value">🗓 {bd.best_weekday}</div>
          <div className="ins-note">Bei ya wastani iko chini zaidi siku hii</div>
        </div>
        <div className="insight-3d ins-indigo">
          <div className="ins-label">Wiki Bora ya Mwezi</div>
          <div className="ins-value">📆 {bd.best_wom}</div>
          <div className="ins-note">Bei iko chini zaidi katika wiki hii ya mwezi</div>
        </div>
        <div className="insight-3d ins-teal">
          <div className="ins-label">Akiba ya Wastani kwa Wiki</div>
          <div className="ins-value">💰 TZS {Math.round(bd.avg_saving_wd).toLocaleString()}</div>
          <div className="ins-note">Tofauti ya bei kati ya siku bora na mbaya zaidi</div>
        </div>
      </div>
    </>
  )
}