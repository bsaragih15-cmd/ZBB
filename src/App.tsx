import { useEffect, useState, useCallback } from 'react'
import type { Fleet, Decision, Line } from './domain/types'
import type { BenchmarkMode } from './domain/cockpit-model'
import { loadFleet } from './data/load'
import { loadDecisions, loadDecisionsRemote } from './domain/decision-store'
import {
  resolveLines, parseLinesCsv, saveUploadedLines, clearUploadedLines, type LineSource,
} from './data/line-source'
import { LandingPage } from './screens/LandingPage'
import { AssetDrill } from './screens/AssetDrill'
import { DriverWorkspace } from './screens/DriverWorkspace'
import { ChallengeWorkspace } from './screens/ChallengeWorkspace'
import { BoardPack } from './screens/BoardPack'

type Screen = 'cross-asset' | 'l3l4' | 'l5' | 'challenge' | 'board'

const NAV: { id: Screen; label: string }[] = [
  { id: 'cross-asset', label: '1 · Cross-asset' },
  { id: 'l3l4', label: '2 · L3–L4 per asset' },
  { id: 'l5', label: '3 · L5 per asset' },
  { id: 'challenge', label: '4 · Challenge' },
  { id: 'board', label: 'Board pack' },
]

const BENCH: { label: string; mode: BenchmarkMode }[] = [
  { label: 'Absolute', mode: 'absolute' },
  { label: 'Like-for-like', mode: 'normalized' },
]

const AMBITION: { label: string; cap: number }[] = [
  { label: 'Light · 25%', cap: 0.25 },
  { label: 'Base · 50%', cap: 0.5 },
  { label: 'Stretch · 100%', cap: 1 },
]

export default function App() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>(loadDecisions())
  const [screen, setScreen] = useState<Screen>('cross-asset')
  const [activeAsset, setActiveAsset] = useState<string>('MEB+DEB')
  const [activeBlock, setActiveBlock] = useState<string>('Consumable')
  const [cap, setCap] = useState(0.5)
  const [benchMode, setBenchMode] = useState<BenchmarkMode>('absolute')
  const [lineData, setLineData] = useState<{ lines: Line[]; source: LineSource }>({ lines: [], source: 'modeled' })

  useEffect(() => { loadFleet().then(setFleet) }, [])
  useEffect(() => { loadDecisionsRemote().then(setDecisions) }, [])

  const reloadLines = useCallback(() => {
    if (!fleet) return
    const a = fleet.assets.find((x) => x.code === activeAsset) ?? fleet.assets[0]
    if (a) resolveLines(a, fleet).then(setLineData)
  }, [fleet, activeAsset])
  useEffect(() => { reloadLines() }, [reloadLines])

  if (!fleet) return <div className="wrap" style={{ color: 'var(--muted)' }}>Loading…</div>

  const onUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const lines = parseLinesCsv(String(reader.result ?? ''))
      if (lines.length) { saveUploadedLines(activeAsset, lines); reloadLines() }
    }
    reader.readAsText(file)
  }
  const onClear = () => { clearUploadedLines(activeAsset); reloadLines() }

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
          onChallenge={() => setScreen('challenge')}
          onSelectAsset={setActiveAsset}
          onDrillBlock={(b) => { setActiveBlock(b); setScreen('l5') }} />}
        {screen === 'l5' && <DriverWorkspace fleet={fleet} assetCode={activeAsset} block={activeBlock} benchMode={benchMode}
          onSelectAsset={setActiveAsset} onSelectBlock={setActiveBlock} />}
        {screen === 'challenge' && <ChallengeWorkspace assetCode={activeAsset}
          lines={lineData.lines} source={lineData.source}
          decisions={decisions} setDecisions={setDecisions} onUpload={onUpload} onClear={onClear} />}
        {screen === 'board' && <BoardPack fleet={fleet} cap={cap} benchMode={benchMode} decisions={decisions} />}
      </div>
    </div>
  )
}
