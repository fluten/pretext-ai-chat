export const SAMPLE_ID = 'sample-demo'

export const SAMPLE_CONVERSATION = {
  id: SAMPLE_ID,
  title: 'Pretext 是什么？',
  messages: [
    { role: 'user', content: 'Pretext 是什么？用简单的话解释一下。' },
    { role: 'assistant', content: 'Pretext 是一个纯 JavaScript 文本测量库。它能在**不触碰 DOM** 的情况下，精确预测任意文本在给定宽度下的渲染高度。\n\n## 为什么需要它？\n\n浏览器渲染文本时，需要经历一个叫 **reflow** 的过程——计算每个字符的位置、换行点、最终高度。这个过程很昂贵，尤其在流式输出（streaming）场景下：\n\n1. 每到达一个 token，追加到 DOM\n2. 浏览器被迫重新计算布局\n3. 页面发生抖动（layout shift）\n\nPretext 通过纯 JS 实现了同样的文本测量，完全绕过 DOM，从而实现 **零抖动** 的流式渲染。' },
    { role: 'user', content: '给我看一个代码示例' },
    { role: 'assistant', content: '最基本的用法只需要两个 API：\n\n```javascript\nimport { prepare, layout } from \'@chenglou/pretext\'\n\n// 1. 解析文本结构（可缓存）\nconst prepared = prepare(text, \'14px Inter\')\n\n// 2. 计算渲染尺寸\nconst { height } = layout(prepared, containerWidth, 22.4)\n\n// 3. 先设高度，再写内容 → 零抖动\nelement.style.height = height + \'px\'\nelement.textContent = text\n```\n\n关键点：\n- `prepare()` 的结果可以缓存，后续 `layout()` 调用在微秒级完成\n- 字体字符串必须和 CSS 声明完全一致（如 `\'14px Inter\'`）\n- `layout()` 的第三个参数是 `line-height`，单位是 px（14 × 1.6 = 22.4）' },
    { role: 'user', content: '和原生 DOM 相比性能差多少？' },
    { role: 'assistant', content: '差距非常大。我们的 Benchmark 测试显示：\n\n| 指标 | 原生 DOM | Pretext |\n|------|---------|----------|\n| Reflow 次数 | 每字符 1 次 | **0 次** |\n| 高度跳变 | 10-20 次 | **0 次** |\n| 1000 条消息高度计算 | ~800ms | **~15ms** |\n\n> 核心区别：原生 DOM 每次 `offsetHeight` 读取都会强制同步 reflow，而 Pretext 在纯 JS 层完成计算，完全不触发浏览器布局引擎。\n\n你可以点击左侧的 **Benchmark** 按钮亲自对比效果 🚀' },
  ]
}

/**
 * Alternative responses pool, keyed by message index (assistant message position).
 * Index 1, 3, 5 are assistant messages in the sample.
 */
const ALTERNATIVES = {
  1: [
    'Pretext 是一个纯 JavaScript 文本测量库。它能在**不触碰 DOM** 的情况下，精确预测任意文本在给定宽度下的渲染高度。\n\n## 为什么需要它？\n\n浏览器渲染文本时，需要经历一个叫 **reflow** 的过程——计算每个字符的位置、换行点、最终高度。这个过程很昂贵，尤其在流式输出（streaming）场景下：\n\n1. 每到达一个 token，追加到 DOM\n2. 浏览器被迫重新计算布局\n3. 页面发生抖动（layout shift）\n\nPretext 通过纯 JS 实现了同样的文本测量，完全绕过 DOM，从而实现 **零抖动** 的流式渲染。',
    '简单来说，Pretext 做的事情就是：**不让浏览器算文本高度，自己用 JS 算**。\n\n传统流程是这样的：\n\n1. 把文字塞进 DOM\n2. 浏览器计算布局（reflow）\n3. 拿到高度\n\n问题是第 2 步非常慢，而且在 AI 聊天的流式输出中，每来一个字就要算一次，页面就会不停地抖。\n\nPretext 跳过了第 1 和第 2 步，直接用纯 JavaScript 模拟浏览器的文本排版逻辑，在文字还没写进 DOM 之前就把高度算好了。\n\n> 一句话总结：**让流式输出像放电影一样平滑，不跳不抖。**',
    '你可以把 Pretext 理解为一个 **JavaScript 版的文本排版引擎**。\n\n## 它解决的核心问题\n\n在 AI Chat 应用中，模型的回答是逐字输出的。每多一个字，文本框的高度可能就会变化。浏览器为了计算新的高度，需要执行一次 **reflow**——这是一个非常昂贵的操作。\n\n当每秒钟输出 30-60 个字符时，reflow 会导致：\n\n- 页面 **闪烁抖动**\n- 滚动条 **跳来跳去**\n- 用户阅读体验 **极差**\n\n## Pretext 的做法\n\n它在纯 JS 层面复刻了浏览器的文本换行算法，能够：\n\n- 给定一段文本 + 字体 + 容器宽度\n- 在 **微秒级** 计算出渲染高度\n- 完全 **不碰 DOM**\n\n这样我们就可以先设好高度，再写内容，页面完全不会抖动。',
  ],
  3: [
    '最基本的用法只需要两个 API：\n\n```javascript\nimport { prepare, layout } from \'@chenglou/pretext\'\n\n// 1. 解析文本结构（可缓存）\nconst prepared = prepare(text, \'14px Inter\')\n\n// 2. 计算渲染尺寸\nconst { height } = layout(prepared, containerWidth, 22.4)\n\n// 3. 先设高度，再写内容 → 零抖动\nelement.style.height = height + \'px\'\nelement.textContent = text\n```\n\n关键点：\n- `prepare()` 的结果可以缓存，后续 `layout()` 调用在微秒级完成\n- 字体字符串必须和 CSS 声明完全一致（如 `\'14px Inter\'`）\n- `layout()` 的第三个参数是 `line-height`，单位是 px（14 × 1.6 = 22.4）',
    '来看一个流式渲染的完整示例：\n\n```javascript\nimport { prepare, layout } from \'@chenglou/pretext\'\n\nconst FONT = \'14px Inter\'\nconst LINE_HEIGHT = 22.4 // 14px * 1.6\n\nasync function streamWithPretext(container, stream) {\n  let text = \'\'\n  const width = container.offsetWidth\n\n  for await (const token of stream) {\n    text += token\n    // 纯 JS 计算高度，不触发 reflow\n    const prepared = prepare(text, FONT)\n    const { height } = layout(prepared, width, LINE_HEIGHT)\n    // 先设高度，再写内容\n    container.style.height = Math.ceil(height) + \'px\'\n    container.textContent = text\n  }\n}\n```\n\n对比传统的 `textContent += token` 方式：\n- 传统方式：**每个 token 触发一次 reflow**，高度跳变 10-20 次\n- Pretext 方式：**0 次 reflow**，高度预设完全准确',
    '下面是 Shrinkwrap（智能气泡宽度）的代码示例：\n\n```javascript\nimport { prepare, layout } from \'@chenglou/pretext\'\n\nfunction shrinkwrap(text, maxWidth) {\n  const FONT = \'14px Inter\'\n  const LH = 22.4\n  const prepared = prepare(text, FONT)\n\n  // 先算最大宽度下的行数\n  const { height: maxH } = layout(prepared, maxWidth, LH)\n  const lineCount = Math.round(maxH / LH)\n\n  // 二分查找最窄宽度（保持行数不变）\n  let lo = 100, hi = maxWidth\n  while (hi - lo > 1) {\n    const mid = (lo + hi) >> 1\n    const { height } = layout(prepared, mid, LH)\n    if (Math.round(height / LH) <= lineCount) hi = mid\n    else lo = mid\n  }\n  return hi\n}\n```\n\n效果：短消息的气泡不会占满整行，而是自动收缩到刚好包裹文字的宽度。',
  ],
  5: [
    '差距非常大。我们的 Benchmark 测试显示：\n\n| 指标 | 原生 DOM | Pretext |\n|------|---------|----------|\n| Reflow 次数 | 每字符 1 次 | **0 次** |\n| 高度跳变 | 10-20 次 | **0 次** |\n| 1000 条消息高度计算 | ~800ms | **~15ms** |\n\n> 核心区别：原生 DOM 每次 `offsetHeight` 读取都会强制同步 reflow，而 Pretext 在纯 JS 层完成计算，完全不触发浏览器布局引擎。\n\n你可以点击左侧的 **Benchmark** 按钮亲自对比效果 🚀',
    '我用三个场景来对比：\n\n### 场景 1：流式输出 300 字\n\n- 原生 DOM：reflow **300 次**，高度跳变 **15 次**，肉眼可见抖动\n- Pretext：reflow **0 次**，高度跳变 **0 次**，完全丝滑\n\n### 场景 2：虚拟列表（1000 条消息）\n\n要实现虚拟滚动，需要知道每条消息的高度：\n\n- 原生方式：逐条渲染到隐藏 DOM 再测量，耗时 **~800ms**\n- Pretext：`prepare()` + `layout()` 批量计算，耗时 **~15ms**\n\n### 场景 3：Shrinkwrap 气泡\n\n计算最窄气泡宽度需要多次布局计算（二分查找）：\n\n- 原生方式：每次尝试都要改 DOM 宽度再测量\n- Pretext：纯数学计算，**快 50-100 倍**\n\n> 总结：Pretext 的优势在文本量大、计算频繁的场景下最明显。',
    '性能对比的关键在于 **reflow 的代价**。\n\n浏览器的 reflow 做了什么？\n\n1. 解析字体度量（font metrics）\n2. 逐字符计算宽度\n3. 确定换行点\n4. 计算总高度\n5. 更新所有受影响元素的位置\n\n这 5 步每次调用 `offsetHeight` 都会执行一遍。\n\n而 Pretext 只做第 1-4 步，而且：\n- 字体度量 **只解析一次**，后续缓存\n- 换行计算用 **优化过的算法**，比浏览器更快\n- 完全不需要第 5 步（不碰 DOM）\n\n实测数据：\n\n```\nprepare():  ~2ms（首次，后续缓存）\nlayout():   ~0.05ms（50 微秒）\nDOM reflow: ~0.5-2ms（每次）\n```\n\n**单次 layout() 比单次 reflow 快 10-40 倍**，而且 `prepare()` 结果可复用，实际差距更大。',
  ],
}

/**
 * Get a random alternative response for a given message index in the sample conversation.
 * Returns a different response than the current one.
 */
export function getRandomAlternative(msgIndex, currentContent) {
  const pool = ALTERNATIVES[msgIndex]
  if (!pool) return currentContent
  const others = pool.filter(alt => alt !== currentContent)
  if (others.length === 0) return pool[Math.floor(Math.random() * pool.length)]
  return others[Math.floor(Math.random() * others.length)]
}
