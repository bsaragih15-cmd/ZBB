import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client for the ZBB cost cockpit.
 *
 * Configured via Vite env vars (set in .env.local for dev, and in the Vercel
 * project settings for production):
 *   VITE_SUPABASE_URL       = https://<ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY  = <publishable / anon key>
 *
 * When the vars are absent the client is null and every data-access helper
 * falls back to the bundled static JSON + localStorage, so the app keeps
 * working offline and in CI without a backend.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, { auth: { persistSession: false } })
  : null
