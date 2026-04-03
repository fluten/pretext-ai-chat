import { useState, useCallback } from 'preact/hooks'
import { SAMPLE_CONVERSATION, SAMPLE_ID } from '../lib/sample-conversation'

const STORAGE_KEY = 'conversations'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.length === 0) return [SAMPLE_CONVERSATION]
      // Always restore sample conversation to original state
      const restored = parsed.map(c => c.id === SAMPLE_ID ? SAMPLE_CONVERSATION : c)
      // Ensure sample exists if no other conversations
      if (!restored.find(c => c.id === SAMPLE_ID) && restored.length === 0) {
        return [SAMPLE_CONVERSATION]
      }
      return restored
    }
    return [SAMPLE_CONVERSATION]
  } catch {
    return [SAMPLE_CONVERSATION]
  }
}

function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

function extractTitle(messages) {
  const firstUser = messages.find(m => m.role === 'user')
  if (!firstUser) return ''
  const text = firstUser.content.trim()
  return text.length > 20 ? text.slice(0, 20) + '...' : text
}

export function useConversations() {
  const [conversations, setConversations] = useState(loadConversations)
  const [activeId, setActiveId] = useState(() => {
    const convos = loadConversations()
    return convos.length > 0 ? convos[0].id : null
  })

  const persist = useCallback((updated) => {
    setConversations(updated)
    saveConversations(updated)
  }, [])

  const createConversation = useCallback(() => {
    const id = generateId()
    const newConvo = { id, title: '', messages: [] }
    setConversations(prev => {
      const updated = [newConvo, ...prev]
      saveConversations(updated)
      return updated
    })
    setActiveId(id)
    return id
  }, [])

  const ensureConversation = useCallback(() => {
    if (activeId) return activeId
    const id = generateId()
    const newConvo = { id, title: '', messages: [] }
    setConversations(prev => {
      const updated = [newConvo, ...prev]
      saveConversations(updated)
      return updated
    })
    setActiveId(id)
    return id
  }, [activeId])

  const setActiveConversation = useCallback((id) => {
    setActiveId(id)
  }, [])

  const updateMessages = useCallback((id, messages) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c
        const title = c.title || extractTitle(messages)
        return { ...c, messages, title }
      })
      saveConversations(updated)
      return updated
    })
  }, [])

  const renameConversation = useCallback((id, title) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title } : c)
      saveConversations(updated)
      return updated
    })
  }, [])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id)
      saveConversations(updated)
      return updated
    })
    if (activeId === id) {
      setConversations(prev => {
        setActiveId(prev.length > 0 ? prev[0].id : null)
        return prev
      })
    }
  }, [activeId])

  const activeConversation = conversations.find(c => c.id === activeId) || null

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    ensureConversation,
    setActiveConversation,
    updateMessages,
    renameConversation,
    deleteConversation
  }
}
