import Anthropic from '@anthropic-ai/sdk'

/**
 * AI Cost Copilot — Vercel Edge function.
 *
 * Streams Claude's answer to a budget-challenge question. The client sends the
 * conversation plus a compact, pre-computed grounding context (fleet benchmark
 * matrix, the active view, flagged lines) so Claude reasons over real rupiah
 * figures rather than hallucinating them — no tool round-trip needed.
 *
 * Requires the ANTHROPIC_API_KEY env var (set in Vercel project settings,
 * server-only — never exposed to the browser).
 */
export const config = { runtime: 'edge' }

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('Copilot is not configured (missing ANTHROPIC_API_KEY).', { status: 503 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }
  if (!body.messages?.length) {
    return new Response('No messages provided', { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })
  const system = body.context
    ? `${SYSTEM}\n\n=== CONTEXT (live figures from the cockpit) ===\n${body.context}`
    : SYSTEM

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ai = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 1500,
          system,
          messages: body.messages,
        })
        for await (const event of ai) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[Copilot error: ${(err as Error).message}]`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
