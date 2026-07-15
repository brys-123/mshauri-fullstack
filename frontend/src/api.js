const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getForecast({ currency, steps, purpose, amount }) {
  const params = new URLSearchParams({ currency, steps, purpose, amount })
  const res = await fetch(`${API_URL}/api/forecast?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function getCompare() {
  const res = await fetch(`${API_URL}/api/compare`)
  if (!res.ok) throw new Error('Failed to fetch comparison data')
  return res.json()
}

export async function getRecent(currency, days = 30) {
  const params = new URLSearchParams({ currency, days })
  const res = await fetch(`${API_URL}/api/recent?${params}`)
  if (!res.ok) throw new Error('Failed to fetch recent data')
  return res.json()
}