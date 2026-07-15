import React from 'react'

export default function ForecastTable({ data, amount, currencyDisplay, t }) {
  const rows = data.forecast.dates.map((d, i) => {
    const v = data.forecast.ensemble[i]
    const change = v - data.current_rate
    const chgP = (change / data.current_rate) * 100
    return {
      date: d,
      price: v,
      lower: data.forecast.lower_band[i],
      upper: data.forecast.upper_band[i],
      change, chgP,
      payment: amount * v,
    }
  })

  function downloadCsv() {
    const header = ['Tarehe', `Bei (${currencyDisplay}/TZS)`, 'Upeo wa Chini', 'Upeo wa Juu', 'Mabadiliko %', `Malipo (${amount} ${currencyDisplay})`]
    const lines = rows.map(r => [
      r.date, r.price.toFixed(2), r.lower.toFixed(2), r.upper.toFixed(2), r.chgP.toFixed(2), Math.round(r.payment)
    ].join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currencyDisplay.toLowerCase()}_forecast_${rows.length}days.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chart-card">
      <div className="eyebrow">Bei Inayotarajiwa — Kila Siku</div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tarehe</th>
              <th>Bei ({currencyDisplay}/TZS)</th>
              <th>Upeo wa Chini</th>
              <th>Upeo wa Juu</th>
              <th>Mabadiliko</th>
              <th>Malipo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.date}>
                <td>{r.date}</td>
                <td>TZS {r.price.toFixed(2)}</td>
                <td>TZS {r.lower.toFixed(2)}</td>
                <td>TZS {r.upper.toFixed(2)}</td>
                <td>{r.change >= 0 ? '▲' : '▼'} {Math.abs(r.change).toFixed(2)} ({r.chgP >= 0 ? '+' : ''}{r.chgP.toFixed(2)}%)</td>
                <td>TZS {Math.round(r.payment).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="download-btn" onClick={downloadCsv}>{t.downloadCsv}</button>
    </div>
  )
}