import { useEffect, useState } from 'react'
import type { Fleet } from './domain/types'
import type { BenchmarkMode } from './domain/cockpit-model'
import { loadFleet } from './data/load'
import { LandingPage } from './screens/LandingPage'
import { AssetDrill } from './screens/AssetDrill'
import { DriverWorkspace } from './screens/DriverWorkspace'

type Screen = 'cross-asset' | 'l3l4' | 'l5'

const BENCH: { label: string; mode: BenchmarkMode }[] = [
  { label: 'Absolute', mode: 'absolute' },
  { label: 'Like-for-like', mode: 'normalized' },
]

const NAV: { id: Screen; label: string }[] = [
  { id: 'cross-asset', label: '1 · Cross-asset' },
  { id: 'l3l4', label: '2 · L3–L4 per asset' },
  { id: 'l5', label: '3 · L5 per asset' },
]

const AMBITION: { label: string; cap: number }[] = [
  { label: 'Light · 25%', cap: 0.25 },
  { label: 'Base · 50%', cap: 0.5 },
  { label: 'Stretch · 100%', cap: 1 },
]

export default function App() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [screen, setScreen] = useState<Screen>('cross-asset')
  const [activeAsset, setActiveAsset] = useState<string>('MEB+DEB')
  const [activeBlock, setActiveBlock] = useState<string>('Consumable')
  const [cap, setCap] = useState(0.5)
  const [benchMode, setBenchMode] = useState<BenchmarkMode>('absolute')

  useEffect(() => { loadFleet().then(setFleet) }, [])
  if (!fleet) return <div className="wrap" style={{ color: 'var(--muted)' }}>Loading…</div>

  const nav = (
    <div className="nav">
      <div className="brand">
        <span className="glyph" />
        MPI Cost Cockpit <small>budgeting · stress-test</small>
      </div>
      <div className="tabs">
        {NAV.map((n) => (
          <button key={n.id} className={`tab ${screen === n.id ? 'active' : ''}`} onClick={() => setScreen(n.id)}>
            {n.label}
          </button>
        ))}
      </div>
      <div className="scen">
        <span className="lbl">benchmark</span>
        <div className="seg">
          {BENCH.map((b) => (
            <button key={b.mode} className={benchMode === b.mode ? 'on' : ''}
              onClick={() => setBenchMode(b.mode)}>{b.label}</button>
          ))}
        </div>
        <span className="lbl">ambition</span>
        <div className="seg">
          {AMBITION.map((a) => (
            <button key={a.label} className={Math.round(cap * 100) === Math.round(a.cap * 100) ? 'on' : ''}
              onClick={() => setCap(a.cap)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {nav}
      <div className="wrap">
        {screen === 'cross-asset' && <LandingPage fleet={fleet} cap={cap} onCap={setCap} benchMode={benchMode}
          onDrill={(code) => { setActiveAsset(code); setScreen('l3l4') }} />}
        {screen === 'l3l4' && <AssetDrill fleet={fleet} assetCode={activeAsset} benchMode={benchMode}
          onChallenge={() => setScreen('l5')}
          onSelectAsset={setActiveAsset}
          onDrillBlock={(b) => { setActiveBlock(b); setScreen('l5') }} />}
        {screen === 'l5' && <DriverWorkspace fleet={fleet} assetCode={activeAsset} block={activeBlock}
          onSelectAsset={setActiveAsset} onSelectBlock={setActiveBlock} />}
      </div>
    </div>
  )
}
