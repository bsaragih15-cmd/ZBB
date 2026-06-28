import { useEffect, useState } from 'react'
import type { Fleet, Line, Decision } from './domain/types'
import { loadFleet, loadElbLines } from './data/load'
import { loadDecisions } from './domain/decision-store'
import { FleetCockpit } from './screens/FleetCockpit'
import { AssetDrill } from './screens/AssetDrill'
import { ChallengeWorkspace } from './screens/ChallengeWorkspace'
import { CostOutBridge } from './screens/CostOutBridge'

type Screen = 'fleet' | 'asset' | 'challenge' | 'bridge'

export default function App() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [elbLines, setElbLines] = useState<Line[]>([])
  const [decisions, setDecisions] = useState<Decision[]>(loadDecisions())
  const [screen, setScreen] = useState<Screen>('fleet')
  const [activeAsset, setActiveAsset] = useState<string>('MEB')

  useEffect(() => { loadFleet().then(setFleet); loadElbLines().then(setElbLines) }, [])
  if (!fleet) return <div className="p-8">Loading…</div>

  const nav = (
    <nav className="flex gap-2 p-3 border-b bg-white sticky top-0">
      {(['fleet', 'asset', 'challenge', 'bridge'] as Screen[]).map((s) => (
        <button key={s} onClick={() => setScreen(s)}
          className={`px-3 py-1 rounded text-sm ${screen === s ? 'bg-[#006CB8] text-white' : 'bg-gray-100'}`}>
          {s}
        </button>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {nav}
      <main className="p-6">
        {screen === 'fleet' && <FleetCockpit fleet={fleet}
          onDrill={(code) => { setActiveAsset(code); setScreen('asset') }} />}
        {screen === 'asset' && <AssetDrill fleet={fleet} assetCode={activeAsset}
          onChallenge={() => setScreen('challenge')} />}
        {screen === 'challenge' && <ChallengeWorkspace assetCode={activeAsset}
          lines={activeAsset === 'ELB' ? elbLines : []} fleet={fleet}
          decisions={decisions} setDecisions={setDecisions} />}
        {screen === 'bridge' && <CostOutBridge fleet={fleet} decisions={decisions} />}
      </main>
    </div>
  )
}
