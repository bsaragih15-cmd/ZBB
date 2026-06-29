import { useRef, useState } from 'react'
import { streamCopilot, type CopilotMessage } from '../domain/ai/copilot-client'

/**
 * AI Copilot chat, grounded in the live cockpit `context`. Streams answers from
 * the /api/copilot Edge function. Degrades gracefully: if the backend isn't
 * configured (no ANTHROPIC_API_KEY) it shows a clear, non-blocking notice.
 */
export function CopilotChat({ context, suggestions = [] }:
  { context: string; suggestions?: string[] }) {
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [streaming, setStreaming] = useState('')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setError(null)
    setInput('')
    const next: CopilotMessage[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setBusy(true)
    setStreaming('')
    try {
      let acc = ''
      const full = await streamCopilot(next, context, (chunk) => {
        acc += chunk
        setStreaming(acc)
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      })
      setMessages([...next, { role: 'assistant', content: full || acc }])
    } catch (e) {
      setError((e as Error).message || 'Copilot unavailable')
      setMessages(messages) // roll back the unanswered question
    } finally {
      setStreaming('')
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="lbl" style={{ margin: '12px 0 2px' }}>ask the copilot</div>

      {(messages.length > 0 || streaming) && (
        <div ref={scrollRef} style={{
          maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          gap: 8, paddingRight: 4,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              color: m.role === 'user' ? 'var(--teal-bright)' : 'var(--text)',
              borderLeft: m.role === 'assistant' ? '2px solid var(--teal)' : 'none',
              paddingLeft: m.role === 'assistant' ? 8 : 0,
            }}>{m.content}</div>
          ))}
          {streaming && (
            <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text)', borderLeft: '2px solid var(--teal)', paddingLeft: 8 }}>
              {streaming}<span style={{ opacity: 0.5 }}>▋</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: 'var(--amber)', lineHeight: 1.4 }}>
          {error.includes('not configured')
            ? 'AI Copilot needs an ANTHROPIC_API_KEY set in the Vercel project. The static recommendations above still apply.'
            : error}
        </div>
      )}

      {messages.length === 0 && !streaming && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s) => (
            <button key={s} className="pill teal" style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
              onClick={() => send(s)} disabled={busy}>{s}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Thinking…' : 'Challenge a line, draft a memo, ask anything…'}
          disabled={busy}
          style={{
            flex: 1, background: 'var(--panel, #0c1614)', color: 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px',
            fontSize: 12, fontFamily: 'inherit',
          }}
        />
        <button type="submit" disabled={busy || !input.trim()} className="pill gold"
          style={{ cursor: busy ? 'default' : 'pointer', border: 'none', opacity: busy || !input.trim() ? 0.5 : 1 }}>
          {busy ? '…' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
