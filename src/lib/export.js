/**
 * Export a conversation as a Markdown file and trigger download.
 */
export function exportConversation(conversation) {
  if (!conversation || !conversation.messages?.length) return

  const lines = [`# ${conversation.title || 'Conversation'}`, '']

  for (const msg of conversation.messages) {
    if (msg.role === 'user') {
      lines.push(`## User`, '', msg.content, '')
    } else {
      lines.push(`## Assistant`, '', msg.content, '')
    }
  }

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${conversation.title || 'conversation'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
