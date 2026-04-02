import { Sparkles } from 'lucide-preact'
import { renderMarkdown } from '../../lib/markdown'
import styles from './Message.module.css'

export function Message({ role, content, streaming, noKey, onOpenSettings }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className={styles.userRow}>
        <div className={styles.userBubble}>
          {noKey ? (
            <div>
              <p>还没有配置 API Key，点击下方按钮前往设置。</p>
              <button className={styles.settingsLink} onClick={onOpenSettings}>
                打开设置
              </button>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.assistantRow}>
      <div className={styles.avatar}>
        <Sparkles size={16} />
      </div>
      <div className={styles.assistantContent}>
        {noKey ? (
          <div>
            <p>还没有配置 API Key，点击下方按钮前往设置。</p>
            <button className={styles.settingsLink} onClick={onOpenSettings}>
              打开设置
            </button>
          </div>
        ) : (
          <>
            <div className={styles.markdown}>
              {renderMarkdown(content)}
            </div>
            {streaming && <span className={styles.cursor} />}
          </>
        )}
      </div>
    </div>
  )
}
