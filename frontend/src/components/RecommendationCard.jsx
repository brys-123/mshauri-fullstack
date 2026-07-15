import React from 'react'

const STYLE_MAP = {
  "LIPA SASA": "rec-go",
  "SUBIRI": "rec-wait",
  "ANGALIA": "rec-watch",
}
const URG_CLASS = { "Juu": "urg-high", "Kati": "urg-mid", "Ndogo": "urg-low" }
const CONF_CLASS = { "Juu": "conf-high", "Kati": "conf-mid", "Chini": "conf-low" }

export default function RecommendationCard({ data }) {
  const { advice, confidence } = data
  const recClass = STYLE_MAP[advice.action] || "rec-watch"

  return (
    <div className="col-block">
      <div className="eyebrow">Ushauri wa Leo</div>
      <div className={`rec-3d ${recClass}`}>
        <div className="rec-3d-action">{advice.icon} {advice.action}</div>
        <div className="rec-3d-headline">{advice.headline}</div>
        <div className="rec-3d-purpose">{advice.purpose_text}</div>
      </div>
      <span className={`urg-chip ${URG_CLASS[advice.urgency_level] || 'urg-mid'}`}>
        ● Hatari: {advice.urgency_level} — {advice.urgency_note}
      </span>
      <span className={`confidence-badge ${CONF_CLASS[confidence.label] || 'conf-mid'}`}>
        ✓ Uhakika: {confidence.label} — {confidence.note}
      </span>
    </div>
  )
}