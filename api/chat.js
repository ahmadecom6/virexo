import OpenAI from 'openai'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return response.status(503).json({ error: 'AI is not configured. Add OPENAI_API_KEY in Vercel Environment Variables.' })
  }

  const messages = request.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return response.status(400).json({ error: 'A chat message is required.' })
  }

  const safeMessages = messages.slice(-10).filter((message) => (
    message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
  )).map((message) => ({ role: message.role, content: message.content.slice(0, 1000) }))

  try {
    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
    console.error('AI request failed:', error.message)
    if (error.status === 401 || error.status === 403) {
      return response.status(503).json({ error: 'OpenAI rejected the configured API key. Update OPENAI_API_KEY in Vercel, then redeploy.' })
    }
    if (error.status === 404) {
      return response.status(503).json({ error: 'The configured OpenAI model is unavailable. Check OPENAI_MODEL in Vercel, then redeploy.' })
    }
    if (error.status === 429) {
      return response.status(429).json({ error: 'The AI service is busy. Please try again shortly.' })
    }
    return response.status(502).json({ error: 'The AI assistant is temporarily unavailable. Please try again shortly.' })
  }
}