import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT || 3001)
const analyticsFile = path.resolve('uploads', 'analytics.json')

const emptyAnalytics = () => ({ totalVisits: 0, pageViews: 0, sessions: {}, pages: {}, minuteViews: {} })
const loadAnalytics = () => {
  try {
    return { ...emptyAnalytics(), ...JSON.parse(fs.readFileSync(analyticsFile, 'utf8')) }
  } catch {
    return emptyAnalytics()
  }
}
let analytics = loadAnalytics()
const analyticsClients = new Set()
let persistTimer

const analyticsSnapshot = () => {
  const now = Date.now()
  const activeVisitors = Object.values(analytics.sessions).filter((lastSeen) => now - lastSeen < 90_000).length
  const currentMinute = Math.floor(now / 60_000)
  const activity = Array.from({ length: 12 }, (_value, index) => {
    const minute = currentMinute - 11 + index
    return { label: index === 11 ? 'Now' : `${11 - index}m`, value: analytics.minuteViews[minute] || 0 }
  })
  return {
    activeVisitors,
    totalVisits: analytics.totalVisits,
    pageViews: analytics.pageViews,
    pages: Object.entries(analytics.pages).sort(([, countA], [, countB]) => countB - countA).slice(0, 5),
    activity,
    updatedAt: new Date().toISOString(),
  }
}
const broadcastAnalytics = () => {
  const message = `data: ${JSON.stringify(analyticsSnapshot())}\n\n`
  analyticsClients.forEach((client) => client.write(message))
}
const saveAnalytics = () => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => fs.writeFileSync(analyticsFile, JSON.stringify(analytics)), 250)
}

if (!process.env.GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set. Add it to your .env file before using the AI assistant.')
}

app.use(express.json({ limit: '20kb' }))

const applicationsDirectory = path.resolve('uploads', 'applications')
fs.mkdirSync(applicationsDirectory, { recursive: true })

app.post('/api/analytics/track', (request, response) => {
  const { sessionId, page } = request.body ?? {}
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(sessionId) || typeof page !== 'string' || !page.startsWith('/') || page.length > 120) {
    return response.status(400).json({ error: 'A valid anonymous session and page are required.' })
  }
  const isNewVisitor = !analytics.sessions[sessionId]
  analytics.sessions[sessionId] = Date.now()
  analytics.pageViews += 1
  analytics.pages[page] = (analytics.pages[page] || 0) + 1
  const currentMinute = Math.floor(Date.now() / 60_000)
  analytics.minuteViews[currentMinute] = (analytics.minuteViews[currentMinute] || 0) + 1
  Object.keys(analytics.minuteViews).filter((minute) => Number(minute) < currentMinute - 60).forEach((minute) => delete analytics.minuteViews[minute])
  if (isNewVisitor) analytics.totalVisits += 1
  saveAnalytics()
  broadcastAnalytics()
  return response.status(202).json(analyticsSnapshot())
})

app.get('/api/analytics', (_request, response) => response.json(analyticsSnapshot()))

app.get('/api/analytics/stream', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })
  response.write(`data: ${JSON.stringify(analyticsSnapshot())}\n\n`)
  analyticsClients.add(response)
  request.on('close', () => analyticsClients.delete(response))
})

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: applicationsDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase()
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const acceptedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    callback(null, acceptedTypes.has(file.mimetype))
  },
})

app.post('/api/applications', resumeUpload.single('resume'), (request, response) => {
  const { name, email, specialization, experience } = request.body
  if (![name, email, specialization, experience].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ error: 'Please complete every application field.' })
  }
  if (!request.file) {
    return response.status(400).json({ error: 'A PDF, DOC, or DOCX resume is required.' })
  }

  return response.status(201).json({ message: 'Application received.' })
})

app.post('/api/chat', async (request, response) => {
  const messages = request.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return response.status(400).json({ error: 'A chat message is required.' })
  }
  if (!process.env.GROQ_API_KEY) {
    return response.status(503).json({ error: 'Groq is not configured. Add GROQ_API_KEY to your .env file, then restart the server.' })
  }

  const safeMessages = messages.slice(-10).filter((message) => (
    message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
  )).map((message) => ({ role: message.role, content: message.content.slice(0, 1000) }))

  try {
    const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
    const completion = await openai.chat.completions.create({
      model: process.env.GROQ_MODEL || 'groq/compound-mini',
      messages: [
        { role: 'system', content: 'You are Virexo Innovations\' concise and helpful project assistant. Explain services, discovery, timelines, and next steps. Do not invent prices, promises, or company facts.' },
        ...safeMessages,
      ],
      max_tokens: 300,
    })
    const message = completion.choices[0]?.message?.content?.trim()
    if (!message) throw new Error('Empty Groq response')
    return response.json({ message })
  } catch (error) {
    console.error('Groq request failed:', error.message)
    return response.status(502).json({ error: 'The AI assistant is temporarily unavailable. Please try again shortly.' })
  }
})

app.listen(port, () => {
  console.log(`AI server is running at http://localhost:${port}`)
})