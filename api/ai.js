const systemInstruction = 'You are Virexo Innovations\' concise and helpful project assistant. Explain services, discovery, timelines, and next steps. Do not invent prices, promises, or company facts.'

export const generateAiReply = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const error = new Error('Gemini is not configured. Add GEMINI_API_KEY and restart or redeploy.')
    error.status = 503
    throw error
  }

  const safeMessages = messages.slice(-10).filter((message) => (
    message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
  )).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content.slice(0, 1000) }] }))

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents: safeMessages, generationConfig: { maxOutputTokens: 300 } }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Gemini request failed.')
    error.status = response.status
    throw error
  }
  const message = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('').trim()
  if (!message) throw new Error('Gemini returned an empty response.')
  return message
}
