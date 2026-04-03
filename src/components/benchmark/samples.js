export const SAMPLES = [
  {
    label: '中文',
    text: '大语言模型的核心能力在于理解和生成自然语言。通过海量数据的预训练，模型学会了语法结构、语义关联和常识推理。在实际应用中，流式输出是用户体验的关键环节——用户期望看到文字逐步呈现，而不是等待数秒后一次性显示全部内容。\n\n然而传统的 DOM 渲染方式存在一个根本性问题：每次追加文本都会触发浏览器的 reflow 计算。当容器高度因为新增文字而改变时，页面布局会发生抖动，滚动条会跳跃，整个阅读体验变得不稳定。这种现象在移动端尤为明显，因为移动设备的渲染性能相对有限。\n\nPretext 通过纯 JavaScript 实现文本测量，在文字写入 DOM 之前就精确预测渲染高度，从而实现真正的零抖动流式输出。这意味着无论文本多长、容器多窄，用户看到的始终是平滑、稳定的内容流。',
  },
  {
    label: 'English',
    text: 'Large language models have fundamentally changed how we interact with computers. The streaming output pattern — where tokens appear one by one — has become the standard UX for AI chat interfaces.\n\nThe technical challenge lies in maintaining visual stability during streaming. In a traditional DOM-based approach, each new token causes the browser to recalculate layout. This "reflow" operation is expensive: the browser must re-measure text, recompute element dimensions, and repaint affected regions.\n\nA typical streaming implementation looks like this:\n\n```javascript\nfunction appendToken(container, token) {\n  container.textContent += token;\n  // This triggers a forced reflow!\n  const newHeight = container.offsetHeight;\n  scrollToBottom();\n}\n```\n\nThe problem is that `offsetHeight` forces the browser to synchronously recalculate layout. When this happens 30-60 times per second during streaming, the result is visible jitter and dropped frames.\n\nPretext solves this by performing text measurement entirely in JavaScript, without touching the DOM. It predicts the exact rendered height of any text at any container width, allowing the UI to pre-allocate space before writing content. The result is perfectly smooth streaming with zero layout shift.',
  },
  {
    label: '中英混排',
    text: 'AI 应用的前端渲染是一个被低估的技术挑战。当 GPT-4 或 Claude 以 streaming 方式输出时，每个 token 到达都会触发 DOM reflow，导致页面 layout shift。\n\nThis is especially problematic for CJK (Chinese, Japanese, Korean) text rendering. Unlike Latin scripts where word boundaries are marked by spaces, CJK text requires more complex line-breaking algorithms. The browser\'s built-in text layout engine handles this well, but at the cost of expensive reflow operations.\n\n解决方案是 Pretext —— 一个纯 JS 文本排版库。它的核心 API 只有两个：prepare() 解析文本结构，layout() 计算渲染尺寸。通过缓存 prepare() 的结果，后续的 layout() 调用可以在微秒级完成，比 DOM reflow 快 10-100 倍。\n\n实测数据 📊：在 1000 条消息的聊天记录中，传统方案需要逐条渲染才能获取高度，耗时约 800ms。而 Pretext 的 layout() 批量计算只需 15ms，提升超过 50x 🚀。更重要的是，streaming 过程中页面完全没有抖动 ✨，滚动条也不会跳跃，用户体验从「能用」变成了「丝滑」💯。',
  },
]
