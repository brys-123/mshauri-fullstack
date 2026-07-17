import React, { useState, useEffect, useCallback } from 'react'
import { getForecast } from './api'
import { TRANSLATIONS, PURPOSES, CURRENCIES, TIMEFRAMES } from './translations'
import Sidebar from './components/Sidebar'
import HeroBanner from './components/HeroBanner'
import MetricCards from './components/MetricCards'
import RecommendationCard from './components/RecommendationCard'
import PaymentCalculator from './components/PaymentCalculator'
import InsightCards from './components/InsightCards'
import PriceChart from './components/PriceChart'
import ForecastTable from './components/ForecastTable'
import AnalysisTab from './components/AnalysisTab'

export default function App() {
  const [lang, setLang] = useState('sw')
  const [purposeLabel, setPurposeLabel] = useState(Object.keys(PURPOSES)[0])
  const [currencyLabel, setCurrencyLabel] = useState(Object.keys(CURRENCIES)[0])
  const [timeframeLabel, setTimeframeLabel] = useState(Object.keys(TIMEFRAMES)[0])
  const [amount, setAmount] = useState(15)
  const [activeTab, setActiveTab] = useState('advice')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const t = TRANSLATIONS[lang]
  const purposeKey = PURPOSES[purposeLabel]
  const currencyKey = CURRENCIES[currencyLabel]
  const steps = TIMEFRAMES[timeframeLabel]

  // amount is intentionally NOT sent to the backend and NOT a dependency here.
  // Rates/advice only depend on currency/steps/purpose. All amount x rate math
  // (payment today, payment later, savings) is computed locally in the
  // components below, so typing any amount -- including 0 -- updates instantly
  // without a network round-trip and without ever hitting backend validation.
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getForecast({
        currency: currencyKey,
        steps,
        purpose: purposeKey,
      })
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currencyKey, steps, purposeKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="app-shell">
      <Sidebar
        t={t}
        lang={lang} setLang={setLang}
        purposeLabel={purposeLabel} setPurposeLabel={setPurposeLabel}
        currencyLabel={currencyLabel} setCurrencyLabel={setCurrencyLabel}
        timeframeLabel={timeframeLabel} setTimeframeLabel={setTimeframeLabel}
        amount={amount} setAmount={setAmount}
        purposeKey={purposeKey}
        onRefresh={fetchData}
      />

      <main className="main-content">
        {loading && (
          <div className="loading-state">Inachambua {currencyLabel.split(' ')[0]}/TZS...</div>
        )}

        {error && (
          <div className="error-state">❌ Hitilafu: {error}</div>
        )}

        {data && !loading && (
          <>
            <HeroBanner t={t} data={data} currencyDisplay={data.currency} />

            <div className="tab-bar">
              <button className={activeTab === 'advice' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('advice')}>{t.tabAdvice}</button>
              <button className={activeTab === 'trend' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('trend')}>{t.tabTrend}</button>
              <button className={activeTab === 'analysis' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('analysis')}>{t.tabAnalysis}</button>
            </div>

            <div className="tab-panel">
              {activeTab === 'advice' && (
                <>
                  <MetricCards data={data} />
                  <div className="row-2col">
                    <RecommendationCard data={data} />
                    <PaymentCalculator data={data} amount={amount} steps={steps} currencyDisplay={data.currency} />
                  </div>
                  <InsightCards data={data} />
                </>
              )}

              {activeTab === 'trend' && (
                <>
                  <PriceChart data={data} steps={steps} />
                  <ForecastTable data={data} amount={amount} currencyDisplay={data.currency} t={t} />
                </>
              )}

              {activeTab === 'analysis' && (
                <AnalysisTab data={data} currencyKey={currencyKey} t={t} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}