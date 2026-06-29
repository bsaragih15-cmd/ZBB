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
  const [activeAsset, setActiveAsset] = useState<string>('Asset 3')
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
    <nav className="nav" aria-label="Primary">
      <div className="brand">
        <span className="glyph" aria-hidden="true" />
        MPI Cost Cockpit <small>budgeting · stress-test</small>
      </div>
      <div className="tabs" role="tablist">
        {NAV.map((n) => (
          <button key={n.id} role="tab" aria-current={screen === n.id ? 'page' : undefined}
            className={`tab ${screen === n.id ? 'active' : ''}`} onClick={() => setScreen(n.id)}>
            {n.label}
          </button>
        ))}
      </div>
      <div className="scen">
        <span className="lbl" id="bench-lbl">benchmark</span>
        <div className="seg" role="group" aria-labelledby="bench-lbl">
          {BENCH.map((b) => (
            <button key={b.mode} aria-pressed={benchMode === b.mode} className={benchMode === b.mode ? 'on' : ''}
              onClick={() => setBenchMode(b.mode)}>{b.label}</button>
          ))}
        </div>
        <span className="lbl" id="amb-lbl">ambition</span>
        <div className="seg" role="group" aria-labelledby="amb-lbl">
          {AMBITION.map((a) => (
            <button key={a.label} aria-pressed={Math.round(cap * 100) === Math.round(a.cap * 100)}
              className={Math.round(cap * 100) === Math.round(a.cap * 100) ? 'on' : ''}
              onClick={() => setCap(a.cap)}>{a.label}</button>
          ))}
        </div>
      </div>
    </nav>
  )

  const crumb = (label: string, to?: Screen) => to
    ? <button onClick={() => setScreen(to)}>{label}</button>
    : <span className="cur">{label}</span>
  const sep = <span className="sep" aria-hidden="true">/</span>
  const crumbs = (screen === 'l3l4' || screen === 'l5' || screen === 'challenge') && (
    <div className="crumbs" aria-label="Breadcrumb">
      {crumb('Cross-asset', 'cross-asset')}{sep}
      {crumb(activeAsset, screen === 'l3l4' ? undefined : 'l3l4')}
      {screen === 'l5' && <>{sep}{crumb(activeBlock)}</>}
      {screen === 'challenge' && <>{sep}{crumb('Challenge')}</>}
    </div>
  )

  return (
    <div>
      {nav}
      <main className="wrap">
        {crumbs}
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
      </main>
    </div>
  )
}
