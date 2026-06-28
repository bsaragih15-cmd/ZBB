export type Technology = 'Gas CCGT' | 'OCGT' | 'Gas engine' | 'Geothermal' | 'Solar PV'

export interface CostBlock {
  name: string
  value_idr: number
  value_rp_bn: number
  semi_committed: boolean
}

export interface Asset {
  code: string
  full_name: string
  mw: number
  technology: Technology
  controllable_om_idr: number
  controllable_om_rp_bn: number
  usd_per_kw_yr: number
  unit_scale: number
  cost_blocks: CostBlock[]
  availability_pct?: number
  forced_outage_rate?: number
}

export interface Fleet {
  fx_2026: number
  best_in_fleet_code: string
  assets: Asset[]
}

export interface Line {
  budget_code: string
  cost_block: string
  l3_activity: string
  l4_equipment: string
  qty: number | null
  freq: number | null
  rate_idr: number | null
  fx: number
  original_currency: string
  basis_of_estimate: string
  value_idr: number
}

export type RuleFamily = 'integrity' | 'variance' | 'plausibility' | 'cross-asset'
export type Severity = 'high' | 'medium' | 'low'

export interface Flag {
  budget_code: string
  family: RuleFamily
  severity: Severity
  message: string
  baseline_label: string
  excess_idr: number
  confidence: number
  score: number
}

export type ZbbLever = 'keep' | 'renegotiate' | 'optimize' | 'challenge' | 'rebuild' | 'eliminate'
export type DecisionOutcome = 'accept' | 'cut' | 'defer'

export interface Decision {
  budget_code: string
  outcome: DecisionOutcome
  lever: ZbbLever
  committed_saving_idr: number
  note: string
  decided_at: string
}
