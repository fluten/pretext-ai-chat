import { useState } from 'preact/hooks'
import { ArrowUp } from 'lucide-preact'
import styles from './ChatView.module.css'

export function ChatView({ sidebarCollapsed }) {
  const [inputValue, setInputValue] = useState('')
  const hasContent = inputValue.trim().length > 0

  return (
    <main className={styles.chatView}>
      <div className={styles.messageArea}>
        <div className={styles.emptyState}>
          <p>Send a message to start a conversation</p>
        </div>
      </div>

      <div className={styles.inputBar} style={{ left: sidebarCollapsed ? 0 : 260 }}>
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.input}
            placeholder="Type a message..."
            rows={1}
            value={inputValue}
            onInput={(e) => setInputValue(e.target.value)}
          />
          <button className={`${styles.sendButton} ${hasContent ? styles.active : ''}`}>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </main>
  )
}
