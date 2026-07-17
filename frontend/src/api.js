const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getForecast({ currency, steps, purpose }) {
  // amount is deliberately excluded: it's pure client-side multiplication
  // (amount x rate) done in the components, so it never needs a round-trip
  // to the backend and can never trigger a backend validation error.
  const params = new URLSearchParams({ currency, steps, purpose })
  const res = await fetch(`${API_URL}/api/forecast?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    let message
    if (Array.isArray(err.detail)) {
      // FastAPI validation errors come back as a list of {msg, loc, ...} objects
      message = err.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
    } else if (typeof err.detail === 'string') {
      message = err.detail
    } else {
      message = `Request failed: ${res.status}`
    }
    throw new Error(message)
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