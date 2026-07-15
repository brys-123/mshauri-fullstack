import React from 'react'

export default function PaymentCalculator({ data, amount, steps, currencyDisplay }) {
  const { advice, current_rate } = data
  const futureClass = advice.saving_direction === 'okoa' ? 'pay-future-okoa'
    : advice.saving_direction === 'hasara' ? 'pay-future-hasara' : 'pay-future-stable'

  const fmt = n => Math.round(n).toLocaleString()

  return (
    <div className="col-block">
      <div className="eyebrow">Hesabu ya Fedha Yako</div>
      <div className="pay-grid">
        <div className="pay-3d pay-today">
          <div className="pb-label">Ukilipa LEO</div>
          <div className="pb-val">TZS {fmt(advice.tzs_now)}</div>
          <div className="pb-note">{currencyDisplay} {amount.toFixed(2)} × {current_rate.toFixed(2)}</div>
        </div>
        <div className={`pay-3d ${futureClass}`}>
          <div className="pb-label">Baada ya Siku {steps}</div>
          <div className="pb-val">TZS {fmt(advice.tzs_later)}</div>
          <div className="pb-note">Tabiri: TZS {advice.avg_future.toFixed(2)}</div>
        </div>
      </div>

      {advice.saving_direction === 'okoa' && (
        <div className="savings-banner sb-okoa">
          <div>
            <div className="sb-label">💡 Ukifuata ushauri, utaokoa:</div>
            <div className="sb-sub">Tofauti kati ya leo na baada ya siku {steps}</div>
          </div>
          <div className="sb-amount">TZS {fmt(advice.saving_amount)}</div>
        </div>
      )}
      {advice.saving_direction === 'hasara' && (
        <div className="savings-banner sb-hasara">
          <div>
            <div className="sb-label">⚠️ Ukisubiri badala ya kulipa sasa, utapoteza:</div>
            <div className="sb-sub">Bei itapanda — lipa sasa kulinda fedha yako</div>
          </div>
          <div className="sb-amount">TZS {fmt(advice.saving_amount)}</div>
        </div>
      )}
      {advice.saving_direction === 'stable' && (
        <div className="savings-banner sb-stable">
          <div>
            <div className="sb-label">📊 Tofauti ya kulipa leo vs siku {steps}:</div>
            <div className="sb-sub">Bei iko stable — hakuna haraka</div>
          </div>
          <div className="sb-amount">TZS {fmt(Math.abs(advice.tzs_now - advice.tzs_later))}</div>
        </div>
      )}
    </div>
  )
}