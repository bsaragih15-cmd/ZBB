export interface CopilotMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Stream a Copilot answer from the /api/copilot Edge function.
 * Calls onDelta with each text chunk as it arrives. Returns the full text.
 * Throws on HTTP errors (e.g. 503 when ANTHROPIC_API_KEY is unset) so the UI
 * can fall back to the static template narrative.
 */
export async function streamCopilot(
  messages: CopilotMessage[],
  context: string,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
    signal,
  })
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Copilot request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onDelta(chunk)
  }
  return full
}
