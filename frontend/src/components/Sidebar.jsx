import React from 'react'
import { PURPOSES, CURRENCIES, TIMEFRAMES, PRESETS } from '../translations'

export default function Sidebar({
  t, lang, setLang,
  purposeLabel, setPurposeLabel,
  currencyLabel, setCurrencyLabel,
  timeframeLabel, setTimeframeLabel,
  amount, setAmount,
  purposeKey,
  onRefresh,
}) {
  const currencyCode = CURRENCIES[currencyLabel].toUpperCase()
  const presets = PRESETS[purposeKey] || PRESETS.nyingine

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">💱 Mshauri</div>

      <select className="sb-select" value={lang} onChange={e => setLang(e.target.value)}>
        <option value="sw">Kiswahili (sw)</option>
        <option value="en">English (en)</option>
      </select>

      <div className="sb-title">🎯 Lengo la Malipo</div>
      <select className="sb-select" value={purposeLabel} onChange={e => setPurposeLabel(e.target.value)}>
        {Object.keys(PURPOSES).map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <div className="sb-title">💱 Sarafu &amp; Muda</div>
      <select className="sb-select" value={currencyLabel} onChange={e => setCurrencyLabel(e.target.value)}>
        {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="sb-select" value={timeframeLabel} onChange={e => setTimeframeLabel(e.target.value)}>
        {Object.keys(TIMEFRAMES).map(tf => <option key={tf} value={tf}>{tf}</option>)}
      </select>

      <div className="sb-title">{t.paymentTitle}</div>
      <p className="preset-lbl">Chaguo la haraka:</p>
      <div className="preset-row">
        {presets.map(([lbl, val]) => (
          <button key={lbl} className="preset-btn" onClick={() => setAmount(val)}>{lbl}</button>
        ))}
      </div>
      <input
        type="number"
        className="sb-input"
        min="0.01"
        step="1"
        value={amount}
        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
      />
      <span className="sb-input-suffix">{currencyCode}</span>

      <button className="refresh-btn" onClick={onRefresh}>{t.refreshButton}</button>

      <p className="sb-disclaimer">
        ⚠️ Ushauri kulingana na data ya kihistoria. Thibitisha na{' '}
        <a href="https://www.bot.go.tz" target="_blank" rel="noreferrer">BOT</a> au benki yako.
      </p>
    </aside>
  )
}