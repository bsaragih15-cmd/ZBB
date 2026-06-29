/**
 * Cost-line (L3) ownership — the accountability layer of a ZBB system: every
 * cost package has a named owner answerable for its target. Names here are
 * DUMMY placeholders; override (localStorage) to map your real cost-package
 * owners without touching code.
 */
export interface Owner {
  name: string
  role: string
}

export const COST_LINE_OWNERS: Record<string, Owner> = {
  'Maintenance Service Agreement': { name: 'Rangga Wibowo', role: 'Head of Maintenance Contracts' },
  'Maintenance Cost': { name: 'Siti Nurhaliza', role: 'Maintenance Manager' },
  Consumable: { name: 'Budi Santoso', role: 'Materials & Inventory Lead' },
  'Salary & Allowance': { name: 'Dewi Lestari', role: 'HR Business Partner' },
  'Professional Service': { name: 'Andi Pratama', role: 'Procurement Manager' },
  Rental: { name: 'Maya Kusuma', role: 'Facilities Lead' },
  'Contract Service': { name: 'Eko Nugroho', role: 'Contract Services Manager' },
  Transportation: { name: 'Rina Hartati', role: 'Logistics Lead' },
  'Other Opex': { name: 'Fajar Ramadhan', role: 'Plant Controller' },
  Insurance: { name: 'Lina Marlina', role: 'Risk & Insurance Manager' },
  'Management Fees': { name: 'Hendra Gunawan', role: 'Finance Director' },
}

export const FALLBACK_OWNER: Owner = { name: 'Unassigned', role: '—' }

const KEY = 'mpi-zbb-owners'

export function loadOwners(): Record<string, Owner> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Record<string, Owner>
  } catch { /* ignore */ }
  return COST_LINE_OWNERS
}

export function saveOwners(o: Record<string, Owner>): void {
  localStorage.setItem(KEY, JSON.stringify(o))
}

export function ownerFor(block: string, o: Record<string, Owner> = COST_LINE_OWNERS): Owner {
  return o[block] ?? FALLBACK_OWNER
}

/** "Dewi Lestari" → "DL" for compact avatars. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
