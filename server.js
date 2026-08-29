import 'dotenv/config'
import express from 'express'
import OpenAI from 'openai'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT || 3001)
const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(projectRoot, 'dist')

if (!process.env.GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set. Add it to your .env file before using the AI assistant.')
}

app.use(express.json({ limit: '20kb' }))

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

app.use(express.static(distPath))

app.get('/{*splat}', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`AI server is running at http://localhost:${port}`)
})