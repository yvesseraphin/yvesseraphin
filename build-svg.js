import fs from 'fs/promises'

const emojis = {
  0: '☀️',
  1: '🌤',
  2: '⛅',
  3: '☁️',
  45: '🌫',
  48: '🌫',
  51: '🌧',
  53: '🌧',
  55: '🌧',
  56: '🌧',
  57: '🌧',
  61: '🌧',
  63: '🌧',
  65: '🌧',
  66: '🌧',
  67: '🌧',
  71: '🌨',
  73: '🌨',
  75: '❄️',
  77: '🌨',
  80: '🌦',
  81: '🌦',
  82: '🌧',
  85: '🌨',
  86: '❄️',
  95: '⛈',
  96: '⛈',
  99: '⛈',
}

// Huye, Rwanda
const LATITUDE = -2.5967
const LONGITUDE = 29.7394

const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
  new Date(),
)

const values = {
  degF: '78',
  degC: '26',
  weatherEmoji: '☀️',
  todayDay,
  dayBubbleWidth: dayBubbleWidths[todayDay],
}

const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=temperature_2m_max,weather_code&temperature_unit=fahrenheit&timezone=auto`

try {
  console.log(`Fetching weather for Huye, Rwanda...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`)
  }

  const json = await response.json()
  const degF = Math.round(json.daily.temperature_2m_max[0])
  const weatherCode = json.daily.weather_code[0]

  values.degF = String(degF)
  values.degC = String(Math.round(((degF - 32) * 5) / 9))
  values.weatherEmoji = emojis[weatherCode] || '🌡'
} catch (error) {
  console.warn('Weather update skipped; using fallback values.')
  console.warn(error.message)
}

// Read base64 strings for light and dark contribution images
const lightBuf = await fs.readFile('Seraphin.png')
const darkBuf = await fs.readFile('Seraphin-Dark.png')

values.imgLightBase64 = lightBuf.toString('base64')
values.imgDarkBase64 = darkBuf.toString('base64')

let svg = await fs.readFile('template.svg', 'utf-8')

for (const [key, value] of Object.entries(values)) {
  svg = svg.replaceAll(`{${key}}`, value)
}

// 1. Generate chat.svg (Light mode default + prefers-color-scheme media query)
await fs.writeFile('chat.svg', svg)
console.log('Successfully updated chat.svg')

// 2. Generate chat-dark.svg (Dark mode default for GitHub README proxy)
const darkSvg = svg
  .replace('.img-light {\n      display: inline;\n    }', '.img-light {\n      display: none;\n    }')
  .replace('.img-dark {\n      display: none;\n    }', '.img-dark {\n      display: inline;\n    }')

await fs.writeFile('chat-dark.svg', darkSvg)
console.log('Successfully updated chat-dark.svg')
