import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getCompare, getRecent } from '../api'

export default function AnalysisTab({ data, currencyKey, t }) {
  const [compare, setCompare] = useState(null)
  const [recent, setRecent] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    getCompare().then(setCompare).catch(() => {})
    getRecent(currencyKey, 30).then(res => {
      setRecent(res.dates.map((d, i) => ({ date: d, value: res.values[i] })))
    }).catch(() => {})
  }, [currencyKey])

  return (
    <>
      <button className="debug-toggle" onClick={() => setShowDebug(!showDebug)}>
        🔧 Maelezo ya Kiufundi (kwa wataalamu) {showDebug ? '▲' : '▼'}
      </button>
      {showDebug && (
        <div className="debug-panel">
          <p>Models used in this forecast: {JSON.stringify(data.debug.models_used)}</p>
          {Object.keys(data.debug.load_errors).length > 0 && (
            <>
              <p className="debug-warn">Models that FAILED to load:</p>
              {Object.entries(data.debug.load_errors).map(([k, v]) => (
                <pre key={k} className="debug-code">{k}: {v}</pre>
              ))}
            </>
          )}
          <table className="data-table" style={{ marginTop: '0.5rem' }}>
            <thead><tr><th>Model</th><th>Predicted rate</th></tr></thead>
            <tbody>
              {Object.entries(data.debug.per_model_final_day).map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row-2col">
        <div className="col-block">
          <div className="eyebrow">✅ Kwa Nini Niamini Ushauri Huu?</div>
          <div className="model-3d">
            <div className="mc-left">
              <div className="mn">Uhakika wa Utabiri wa Leo</div>
              <div className="md">{data.confidence.note}</div>
            </div>
            <div className="mr">
              <div className="mel">Kiwango</div>
              <div className="mev">{data.confidence.label}</div>
            </div>
          </div>
          <div className="explainer-3d" style={{ marginTop: '1rem' }}>
            Mfumo unachambua miaka kadhaa ya data ya bei halisi kutabiri mwenendo wa siku zijazo.
            Utabiri unajaribiwa dhidi ya bei halisi za nyuma kabla ya kutumika, ili kuhakikisha unaaminika.
            Ushauri ni kwa mtu anayetaka <strong>KULIPA</strong> kwa sarafu ya kigeni.
          </div>
        </div>

        <div className="col-block">
          <div className="eyebrow">{t.compareTitle}</div>
          <div className="cur-cards">
            {compare && compare.currencies.map(c => {
              const isBest = c.rate === Math.min(...compare.currencies.map(x => x.rate))
              return (
                <div key={c.currency} className={`cur-card ${isBest ? 'best-cur' : ''}`}>
                  {isBest && <div className="best-badge">✅ Nafuu Zaidi</div>}
                  <div className="cur-row"><span className="cur-lbl">Sarafu</span><span className="cur-val">{c.currency}</span></div>
                  <div className="cur-row"><span className="cur-lbl">Bei (TZS)</span><span className="cur-val">{c.rate.toLocaleString()}</span></div>
                  <div className="cur-row"><span className="cur-lbl">Mabadiliko</span><span className="cur-val">{c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change_pct).toFixed(2)}%</span></div>
                </div>
              )
            })}
          </div>

          {recent && (
            <div className="chart-card" style={{ marginTop: '1rem' }}>
              <div className="eyebrow">📊 Mwenendo wa Siku 30 Zilizopita</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={recent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,124,123,0.08)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={30} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0E7C7B" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  )
}