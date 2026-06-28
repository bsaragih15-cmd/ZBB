"""Extract the four-asset controllable-O&M fleet view -> public/data/fleet.json.

Run from the etl/ directory:  python3 extract_fleet.py
"""
import json
from pathlib import Path

import openpyxl

from asset_config import (
    ASSETS,
    BLOCK_DISPLAY,
    CONTROLLABLE_BLOCKS,
    FX_2026,
    SEMI_COMMITTED,
    YEAR_2026_COL,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "fleet.json"


def _first_label(row):
    for c in row[:6]:
        if isinstance(c, str) and c.strip():
            return c.strip()
    return None


def extract_blocks(code, meta):
    """Return {block_label: value_idr} for the 2026 controllable blocks."""
    wb = openpyxl.load_workbook(meta["workbook"], read_only=True, data_only=True)
    ws = wb[meta["cost_summary_sheet"]]
    scale = meta["unit_scale"]

    raw = {}
    for row in ws.iter_rows(values_only=True):
        label = _first_label(row)
        if label in CONTROLLABLE_BLOCKS and label not in raw:
            v = row[YEAR_2026_COL] if YEAR_2026_COL < len(row) else None
            raw[label] = (v * scale) if isinstance(v, (int, float)) else 0.0
    wb.close()
    return raw


def build_asset(code, meta):
    raw = extract_blocks(code, meta)
    cost_blocks = []
    total = 0.0
    for block in CONTROLLABLE_BLOCKS:
        val = raw.get(block, 0.0)
        total += val
        cost_blocks.append({
            "name": BLOCK_DISPLAY[block],
            "value_idr": round(val),
            "value_rp_bn": round(val / 1e9, 2),
            "semi_committed": block in SEMI_COMMITTED,
        })

    mw = meta["mw"]
    usd_per_kw_yr = total / (mw * 1000) / FX_2026
    return {
        "code": code,
        "full_name": meta["full_name"],
        "mw": mw,
        "technology": "Gas CCGT",
        "controllable_om_idr": round(total),
        "controllable_om_rp_bn": round(total / 1e9, 2),
        "usd_per_kw_yr": round(usd_per_kw_yr, 2),
        "unit_scale": meta["unit_scale"],
        "cost_blocks": cost_blocks,
    }


def main():
    assets = [build_asset(code, meta) for code, meta in ASSETS.items()]
    best = min(assets, key=lambda a: a["usd_per_kw_yr"])
    payload = {
        "fx_2026": FX_2026,
        "best_in_fleet_code": best["code"],
        "assets": assets,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))

    print(f"Wrote {OUT}")
    print(f"{'Asset':6} {'Rp Bn':>8} {'$/kW-yr':>9}")
    for a in assets:
        print(f"{a['code']:6} {a['controllable_om_rp_bn']:>8.1f} {a['usd_per_kw_yr']:>9.1f}")
    print(f"best_in_fleet: {best['code']} ({best['usd_per_kw_yr']:.1f} $/kW-yr)")


if __name__ == "__main__":
    main()
