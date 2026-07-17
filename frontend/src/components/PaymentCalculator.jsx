import React from 'react'

export default function PaymentCalculator({ data, amount, steps, currencyDisplay }) {
  const { advice, current_rate } = data
  const futureClass = advice.saving_direction === 'okoa' ? 'pay-future-okoa'
    : advice.saving_direction === 'hasara' ? 'pay-future-hasara' : 'pay-future-stable'

  const fmt = n => Math.round(n).toLocaleString()

  // All money math is computed HERE from the live `amount`, not from
  // advice.tzs_now / advice.tzs_later (which reflect whatever amount the
  // backend last saw). This keeps the numbers always in sync with what's
  // typed -- including 0, which now correctly zeroes out everything below
  // instead of showing stale nonzero figures next to "0.00".
  const tzsNow = amount * current_rate
  const tzsLater = amount * advice.avg_future

  // NEW: even in the "stable" case, work out the real direction of the
  // small difference, instead of hiding it behind Math.abs(). This
  // answers directly: would the customer have saved, or lost, by waiting?
  const diff = tzsNow - tzsLater  // positive = waiting is cheaper (saves)
  const stableDirection = diff > 0 ? 'okoa' : diff < 0 ? 'hasara' : 'sawa'
  const savingAmount = Math.abs(diff)

  return (
    <div className="col-block">
      <div className="eyebrow">Hesabu ya Fedha Yako</div>
      <div className="pay-grid">
        <div className="pay-3d pay-today">
          <div className="pb-label">Ukilipa LEO</div>
          <div className="pb-val">TZS {fmt(tzsNow)}</div>
          <div className="pb-note">{currencyDisplay} {amount.toFixed(2)} × {current_rate.toFixed(2)}</div>
        </div>
        <div className={`pay-3d ${futureClass}`}>
          <div className="pb-label">Baada ya Siku {steps}</div>
          <div className="pb-val">TZS {fmt(tzsLater)}</div>
          <div className="pb-note">Tabiri: TZS {advice.avg_future.toFixed(2)}</div>
        </div>
      </div>

      {advice.saving_direction === 'okoa' && (
        <div className="savings-banner sb-okoa">
          <div>
            <div className="sb-label">💡 Ukifuata ushauri, UTAOKOA:</div>
            <div className="sb-sub">Tofauti kati ya leo na baada ya siku {steps}</div>
          </div>
          <div className="sb-amount">TZS {fmt(savingAmount)}</div>
        </div>
      )}
      {advice.saving_direction === 'hasara' && (
        <div className="savings-banner sb-hasara">
          <div>
            <div className="sb-label">⚠️ Ukisubiri badala ya kulipa sasa, UTAPOTEZA:</div>
            <div className="sb-sub">Bei itapanda — lipa sasa kulinda fedha yako</div>
          </div>
          <div className="sb-amount">TZS {fmt(savingAmount)}</div>
        </div>
      )}
      {advice.saving_direction === 'stable' && stableDirection === 'okoa' && (
        <div className="savings-banner sb-stable">
          <div>
            <div className="sb-label">📊 Bei iko stable, lakini ukisubiri UTAOKOA Shilingi:</div>
                      <div className="sb-amount">TZS {fmt(Math.abs(diff))}</div>

            <div className="sb-sub">Tofauti ni ndogo si lazima uharakishe</div>
          </div>
        </div>
      )}
      {advice.saving_direction === 'stable' && stableDirection === 'hasara' && (
        <div className="savings-banner sb-stable">
          <div>
            <div className="sb-label">📊 Bei iko stable, lakini ukisubiri UTAPOTEZA kidogo:</div>
            <div className="sb-sub">Tofauti ni ndogo — si lazima uharakishe</div>
          </div>
          <div className="sb-amount">TZS {fmt(Math.abs(diff))}</div>
        </div>
      )}
      {advice.saving_direction === 'stable' && stableDirection === 'sawa' && (
        <div className="savings-banner sb-stable">
          <div>
            <div className="sb-label">📊 Bei iko stable — hakuna tofauti:</div>
            <div className="sb-sub">Unaweza kulipa leo au kusubiri, ni sawa</div>
          </div>
          <div className="sb-amount">TZS 0</div>
        </div>
      )}
    </div>
  )
}