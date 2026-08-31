const systemInstruction = 'You are Virexo Innovations\' concise and helpful project assistant. Explain services, discovery, timelines, and next steps. Do not invent prices, promises, or company facts.'

export const fallbackReply = (messages) => {
  const question = messages.at(-1)?.content?.toLowerCase() || ''
  if (question.includes('service') || question.includes('offer')) return 'Virexo supports strategic consulting, brand identity, web development, digital marketing, and innovation workshops. Which area would you like to explore?'
  if (question.includes('contact') || question.includes('project') || question.includes('start')) return 'You can start a project through the contact section, or email virexoinnovations@gmail.com. Share your goals and we will help identify a clear next step.'
  if (question.includes('career') || question.includes('job')) return 'Visit the Careers section to submit your profile and select your specialization. Our team will contact you when a suitable opportunity is available.'
  return 'Thanks for reaching out to Virexo Innovations. We can help with digital strategy, design, web development, and growth. What would you like to build?'
}

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

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const timeout = AbortSignal.timeout(12_000)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: timeout,
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents: safeMessages, generationConfig: { maxOutputTokens: 180 } }),
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
