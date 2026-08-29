import OpenAI from 'openai'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  if (!process.env.GROQ_API_KEY) {
    return response.status(503).json({ error: 'Groq is not configured. Add GROQ_API_KEY in Vercel Environment Variables.' })
  }

  const messages = request.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return response.status(400).json({ error: 'A chat message is required.' })
  }

  const safeMessages = messages.slice(-10).filter((message) => (
    message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
  )).map((message) => ({ role: message.role, content: message.content.slice(0, 1000) }))

  try {
    const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'groq/compound-mini',
      messages: [
        { role: 'system', content: 'You are Virexo Innovations\' concise and helpful project assistant. Explain services, discovery, timelines, and next steps. Do not invent prices, promises, or company facts.' },
        ...safeMessages,
      ],
      max_tokens: 300,
    })
    const message = completion.choices[0]?.message?.content?.trim()
    if (!message) throw new Error('Empty Groq response')
    return response.status(200).json({ message })
  } catch (error) {
    console.error('Groq request failed:', error.message)
    return response.status(502).json({ error: 'The AI assistant is temporarily unavailable. Please try again shortly.' })
  }
}