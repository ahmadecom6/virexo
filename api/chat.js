import { fallbackReply, generateAiReply } from './ai.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const messages = request.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return response.status(400).json({ error: 'A chat message is required.' })
  }

  try {
    const message = await generateAiReply(messages)
    return response.status(200).json({ message })
  } catch (error) {
    console.error('Gemini request failed:', error.message)
    if (error.status === 400 || error.status === 401 || error.status === 403) return response.status(503).json({ error: 'Gemini rejected its configuration. Update GEMINI_API_KEY in Vercel, then redeploy.' })
    if (error.status === 404) return response.status(503).json({ error: 'The configured Gemini model is unavailable. Check GEMINI_MODEL in Vercel, then redeploy.' })
    if (error.status === 429) {
      return response.status(200).json({ message: fallbackReply(messages), fallback: true })
    }
    return response.status(200).json({ message: fallbackReply(messages), fallback: true })
  }
}