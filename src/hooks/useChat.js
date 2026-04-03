import { useState, useRef, useCallback } from 'preact/hooks'
import { loadSettings, getDefaultBaseUrl } from '../lib/api'
import { streamChat } from '../lib/stream'

export function useChat(messages, onMessagesChange) {
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const send = useCallback(async (text) => {
    const current = messagesRef.current
    const settings = loadSettings()
    if (!settings.apiKey || !settings.model) {
      const userMessage = { role: 'user', content: text }
      const noKeyMessage = { role: 'assistant', content: '', noKey: true }
      onMessagesChange([...current, userMessage, noKeyMessage])
      return
    }

    const userMessage = { role: 'user', content: text }
    const assistantMessage = { role: 'assistant', content: '' }
    const updated = [...current, userMessage, assistantMessage]
    onMessagesChange(updated)
    setStreaming(true)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const baseUrl = settings.baseUrl || getDefaultBaseUrl(settings.provider)
      const apiMessages = [...current, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }))

      const stream = streamChat(settings.apiKey, baseUrl, settings.model, apiMessages, abortController.signal)
      let accumulating = updated

      for await (const token of stream) {
        if (abortController.signal.aborted) break
        const next = [...accumulating]
        const last = next[next.length - 1]
        next[next.length - 1] = { ...last, content: last.content + token }
        accumulating = next
        onMessagesChange(next)
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const next = [...current, userMessage, { role: 'assistant', content: err.message }]
        onMessagesChange(next)
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [onMessagesChange])

  const regenerate = useCallback(() => {
    const current = messagesRef.current
    if (current.length < 2) return
    // Find last user message, remove everything after it
    let lastUserIdx = -1
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i].role === 'user') { lastUserIdx = i; break }
    }
    if (lastUserIdx < 0) return
    const userText = current[lastUserIdx].content
    const trimmed = current.slice(0, lastUserIdx)
    onMessagesChange(trimmed)
    // Update ref immediately so send() sees the trimmed messages
    messagesRef.current = trimmed
    send(userText)
  }, [onMessagesChange, send])

  return { streaming, send, regenerate }
}
