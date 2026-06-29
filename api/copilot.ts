import Anthropic from '@anthropic-ai/sdk'

/**
 * AI Cost Copilot — Vercel Node serverless function (streaming).
 *
 * Streams Claude's answer to a budget-challenge question. The client sends the
 * conversation plus a compact, pre-computed grounding context (fleet benchmark
 * matrix, the active view, flagged lines) so Claude reasons over real rupiah
 * figures rather than hallucinating them — no tool round-trip needed.
 *
 * Runs on the Node runtime (the Anthropic SDK pulls in node:fs/node:path, which
 * the Edge runtime rejects). Requires the server-only ANTHROPIC_API_KEY env var
 * set in the Vercel project — never exposed to the browser.
 */
const MODEL = 'claude-opus-4-8'

const SYSTEM = `You are the Cost Copilot inside MPI's zero-based budgeting (ZBB) cockpit — a cost-out stress-test tool for a fleet of Indonesian gas-fired power plants (ELB, DEB, MEB, MRPR). The tool benchmarks each plant's controllable O&M (ex-fuel) on a $/kW-yr basis against the best-in-fleet peer and quantifies the rupiah "gap to best".

Your job: help a finance/operations user challenge the 2026 budget. Be specific, quantitative, and skeptical — name the rupiah figures, cite the cost lines, and propose the precise challenge questions a budget owner must answer.

Rules:
- Ground every claim in the CONTEXT block below. Use its exact numbers; never invent figures.
- All money is Indonesian Rupiah. Format large amounts as "Rp X.X Bn" (billions).
- Semi-committed lines (insurance, management fees) need contract action, not a budget dial — flag that distinction when relevant.
- Don't cut maintenance that protects reliability without noting the availability risk.
- Be concise and lead with the answer. Use short paragraphs or tight bullets. No preamble.`

interface Body {
  messages: { role: 'user' | 'assistant'; content: string }[]
  context?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(503).send('Copilot is not configured (missing ANTHROPIC_API_KEY).')
    return
  }

  let body: Body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    res.status(400).send('Invalid JSON body')
    return
  }
  if (!body?.messages?.length) {
    res.status(400).send('No messages provided')
    return
  }

  const anthropic = new Anthropic({ apiKey })
  const system = body.context
    ? `${SYSTEM}\n\n=== CONTEXT (live figures from the cockpit) ===\n${body.context}`
    : SYSTEM

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')

  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 1500,
      system,
      messages: body.messages,
    })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text)
      }
    }
    res.end()
  } catch (err) {
    res.write(`\n\n[Copilot error: ${(err as Error).message}]`)
    res.end()
  }
}
