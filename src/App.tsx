import { useEffect, useState } from 'react'
import type { Fleet, Line, Decision } from './domain/types'
import { loadFleet, loadElbLines } from './data/load'
import { loadDecisions } from './domain/decision-store'
import { LandingPage } from './screens/LandingPage'
import { AssetDrill } from './screens/AssetDrill'
import { ChallengeWorkspace } from './screens/ChallengeWorkspace'
import { CostOutBridge } from './screens/CostOutBridge'

type Screen = 'cross-asset' | 'l3l4' | 'l5' | 'bridge'

const NAV: { id: Screen; label: string }[] = [
  { id: 'cross-asset', label: '1 · Cross-asset' },
  { id: 'l3l4', label: '2 · L3–L4 per asset' },
  { id: 'l5', label: '3 · L5 per asset' },
  { id: 'bridge', label: 'Cost-out bridge' },
]

export default function App() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [elbLines, setElbLines] = useState<Line[]>([])
  const [decisions, setDecisions] = useState<Decision[]>(loadDecisions())
  const [screen, setScreen] = useState<Screen>('cross-asset')
  const [activeAsset, setActiveAsset] = useState<string>('MEB')

  useEffect(() => { loadFleet().then(setFleet); loadElbLines().then(setElbLines) }, [])
  if (!fleet) return <div className="p-8">Loading…</div>

  const nav = (
    <nav className="flex items-center gap-2 px-4 py-2.5 border-b bg-white sticky top-0 z-10">
      <span className="font-bold text-[#006CB8] mr-3 text-sm">MPI Cost Challenge</span>
      {NAV.map((n) => (
        <button key={n.id} onClick={() => setScreen(n.id)}
          className={`px-3 py-1 rounded text-sm ${screen === n.id ? 'bg-[#006CB8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {n.label}
        </button>
      ))}
      {screen !== 'cross-asset' && screen !== 'bridge' && (
        <span className="ml-auto text-xs text-gray-500">asset: <b className="text-gray-700">{activeAsset}</b></span>
      )}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {nav}
      <main className="p-6">
        {screen === 'cross-asset' && <LandingPage fleet={fleet}
          onDrill={(code) => { setActiveAsset(code); setScreen('l3l4') }} />}
        {screen === 'l3l4' && <AssetDrill fleet={fleet} assetCode={activeAsset}
          onChallenge={() => setScreen('l5')} />}
        {screen === 'l5' && <ChallengeWorkspace assetCode={activeAsset}
          lines={activeAsset === 'ELB' ? elbLines : []} fleet={fleet}
          decisions={decisions} setDecisions={setDecisions} />}
        {screen === 'bridge' && <CostOutBridge fleet={fleet} decisions={decisions} />}
      </main>
    </div>
  )
}
