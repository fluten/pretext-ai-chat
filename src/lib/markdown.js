import { h } from 'preact'

/**
 * Lightweight Markdown renderer for AI responses.
 * Supports: headings, bold, italic, inline code, code blocks,
 * blockquotes, tables, ordered/unordered lists, paragraphs.
 */
export function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        h('pre', { key: elements.length, className: 'md-code-block' },
          h('code', { className: lang ? `language-${lang}` : undefined }, codeLines.join('\n'))
        )
      )
      continue
    }

    // Table (line with |)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i])
        i++
      }
      const parsed = parseTable(tableRows, elements.length)
      if (parsed) {
        elements.push(parsed)
        continue
      }
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      elements.push(
        h('blockquote', { key: elements.length, className: 'md-blockquote' },
          renderMarkdown(quoteLines.join('\n'))
        )
      )
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const tag = `h${level}`
      elements.push(h(tag, { key: elements.length, className: `md-h${level}` }, parseInline(headingMatch[2])))
      i++
      continue
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})\s*$/)) {
      elements.push(h('hr', { key: elements.length, className: 'md-hr' }))
      i++
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(h('li', { key: items.length }, parseInline(lines[i].replace(/^[-*]\s+/, ''))))
        i++
      }
      elements.push(h('ul', { key: elements.length, className: 'md-list' }, items))
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(h('li', { key: items.length }, parseInline(lines[i].replace(/^\d+\.\s+/, ''))))
        i++
      }
      elements.push(h('ol', { key: elements.length, className: 'md-list' }, items))
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !lines[i].match(/^(-{3,}|\*{3,}|_{3,})\s*$/) &&
      !(lines[i].includes('|') && lines[i].trim().startsWith('|'))
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      elements.push(h('p', { key: elements.length, className: 'md-p' }, parseInline(paraLines.join('\n'))))
    }
  }

  return elements
}

function parseTable(rows, key) {
  if (rows.length < 2) return null

  const parseCells = (row) =>
    row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length)

  const headerCells = parseCells(rows[0])

  // Check if second row is separator (e.g. |---|---|)
  const isSeparator = rows[1].match(/^\|[\s:-]+\|/)
  const dataStart = isSeparator ? 2 : 1

  const thead = h('thead', null,
    h('tr', null, headerCells.map((cell, ci) =>
      h('th', { key: ci }, parseInline(cell))
    ))
  )

  const bodyRows = rows.slice(dataStart).map((row, ri) => {
    const cells = parseCells(row)
    return h('tr', { key: ri }, cells.map((cell, ci) =>
      h('td', { key: ci }, parseInline(cell))
    ))
  })

  const tbody = bodyRows.length > 0 ? h('tbody', null, bodyRows) : null

  return h('div', { key, className: 'md-table-wrapper' },
    h('table', { className: 'md-table' }, [thead, tbody])
  )
}

/**
 * Renders Markdown to an HTML string (for direct DOM use via innerHTML).
 * Mirrors renderMarkdown() but outputs strings instead of Preact VNodes.
 */
export function renderMarkdownToHTML(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const parts = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      const langAttr = lang ? ` class="language-${esc(lang)}"` : ''
      parts.push(`<pre class="md-code-block"><code${langAttr}>${esc(codeLines.join('\n'))}</code></pre>`)
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      parts.push(`<h${level} class="md-h${level}">${inlineToHTML(headingMatch[2])}</h${level}>`)
      i++
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(`<li>${inlineToHTML(lines[i].replace(/^[-*]\s+/, ''))}</li>`)
        i++
      }
      parts.push(`<ul class="md-list">${items.join('')}</ul>`)
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(`<li>${inlineToHTML(lines[i].replace(/^\d+\.\s+/, ''))}</li>`)
        i++
      }
      parts.push(`<ol class="md-list">${items.join('')}</ol>`)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^\d+\.\s+/)
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      parts.push(`<p class="md-p">${inlineToHTML(paraLines.join('\n'))}</p>`)
    }
  }

  return parts.join('')
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inlineToHTML(text) {
  let result = esc(text)
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  return result
}

function parseInline(text) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`/)
    // Bold
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/)
    // Italic
    const italicMatch = remaining.match(/^(.*?)(?<!\*)\*([^*]+)\*(?!\*)/)

    // Find earliest match
    let earliest = null
    let type = null

    if (codeMatch && (!earliest || codeMatch[1].length < earliest[1].length)) {
      earliest = codeMatch
      type = 'code'
    }
    if (boldMatch && (!earliest || boldMatch[1].length < earliest[1].length)) {
      earliest = boldMatch
      type = 'bold'
    }
    if (italicMatch && type !== 'bold' && (!earliest || italicMatch[1].length < earliest[1].length)) {
      earliest = italicMatch
      type = 'italic'
    }

    if (!earliest) {
      parts.push(remaining)
      break
    }

    if (earliest[1]) {
      parts.push(earliest[1])
    }

    if (type === 'code') {
      parts.push(h('code', { key: key++, className: 'md-inline-code' }, earliest[2]))
    } else if (type === 'bold') {
      parts.push(h('strong', { key: key++ }, earliest[2]))
    } else if (type === 'italic') {
      parts.push(h('em', { key: key++ }, earliest[2]))
    }

    remaining = remaining.slice(earliest[0].length)
  }

  return parts
}
