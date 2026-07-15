export const TRANSLATIONS = {
  sw: {
    sidebarTitle: '⚙️ Niambie Zaidi',
    purposeLabel: 'Unataka kulipa nini?',
    currencyLabel: 'Sarafu ya malipo',
    timeframeLabel: 'Angalia mwenendo wa muda gani?',
    refreshButton: '🔄 Rudisha Data',
    paymentTitle: '🧮 Kiasi cha Malipo',
    downloadCsv: '⤓ Pakua utabiri kama CSV',
    tabAdvice: '💬 Ushauri Wangu',
    tabTrend: '📈 Mwenendo wa Bei',
    tabAnalysis: '🔬 Uchambuzi wa Kina',
    compareTitle: '🌍 Kulinganisha Sarafu za Sasa',
    headerTitle: '💱 Mshauri wa Malipo ya Kigeni',
    headerSub: 'Inakusaidia kujua wakati mzuri wa kulipa kwa USD, EUR, au CNY',
  },
  en: {
    sidebarTitle: '⚙️ Tell me more',
    purposeLabel: 'What are you paying for?',
    currencyLabel: 'Payment currency',
    timeframeLabel: 'Check horizon',
    refreshButton: '🔄 Refresh data',
    paymentTitle: '🧮 Payment amount',
    downloadCsv: '⤓ Download forecast CSV',
    tabAdvice: '💬 My advice',
    tabTrend: '📈 Price trend',
    tabAnalysis: '🔬 Deep analysis',
    compareTitle: '🌍 Current currency comparison',
    headerTitle: '💱 Foreign Payment Advisor',
    headerSub: 'Helps you decide when to pay in USD, EUR, or CNY',
  },
}

export const PURPOSES = {
  "💳 Netflix / Spotify / huduma za mtandaoni": "streaming",
  "📦 Bidhaa / mizigo kutoka nje": "bidhaa",
  "✈️ Tiketi / safari nje ya nchi": "safari",
  "📤 Kutuma pesa kwa familia": "kutuma",
  "🎓 Ada ya masomo nje ya nchi": "masomo",
  "💊 Dawa / huduma za afya": "afya",
  "🔄 Malipo mengine ya kigeni": "nyingine",
}

export const CURRENCIES = {
  "USD 🇺🇸 — Dola ya Marekani": "usd",
  "EUR 🇪🇺 — Euro ya Ulaya": "eur",
  "CNY 🇨🇳 — Yuan ya China": "cny",
}

export const TIMEFRAMES = {
  "Wiki 1 (Siku 7)": 7,
  "Wiki 2 (Siku 14)": 14,
  "Mwezi 1 (Siku 30)": 30,
}

export const PRESETS = {
  streaming: [["Netflix 15", 15], ["Spotify 10", 10], ["YouTube 14", 14]],
  bidhaa:    [["Ndogo 100", 100], ["Kati 500", 500], ["Kubwa 2000", 2000]],
  safari:    [["Ndege 300", 300], ["Kati 800", 800], ["Luxury 2k", 2000]],
  kutuma:    [["Kidogo 50", 50], ["Kati 200", 200], ["Kubwa 500", 500]],
  masomo:    [["Sem 1500", 1500], ["Mwaka 3k", 3000], ["Masters 6k", 6000]],
  afya:      [["Dawa 30", 30], ["Tiba 200", 200], ["Upasuaji 2k", 2000]],
  nyingine:  [["Kidogo 50", 50], ["Kati 500", 500], ["Kubwa 2k", 2000]],
}