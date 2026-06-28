"""Extract ELB line-level driver rows -> public/data/elb_lines.json.

Source: the ELB COMPILE sheet, which consolidates every ROUTINE / NON ROUTINE /
Consumable driver row into one normalized table carrying the authoritative 2026
IDR budget value (the same figures that roll up into the Cost Summary). Each
COMPILE row keeps its Account No (real budget code), Account Grouping (cost
block), WBS/CCTR name (L3 activity), Item Description (L4 equipment/item),
original currency, and source function.

This ELB revision does NOT carry qty / freq / unit-rate columns in either the
COMPILE sheet or the individual driver sheets, so qty / freq / rate_idx are
emitted as null. The 2026 IDR value is taken directly (already FX-converted in
the workbook); fx is recorded as the 2026 rate for USD-denominated lines.

Run from the etl/ directory:  python3 extract_elb_lines.py
"""
import json
from pathlib import Path

import openpyxl

from asset_config import ASSETS, FX_2026

OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "elb_lines.json"

SHEET = "COMPILE"
HEADER_ROW = 11          # 0-based: row with "Account No ", "Account Grouping", ...
COL_ACCOUNT_DESC = 2
COL_BUDGET_CODE = 3      # Account No
COL_COST_BLOCK = 4       # Account Grouping
COL_ITEM_DESC = 5        # Item Description (L4 equipment / item)
COL_WBS_NAME = 6         # WBS/CCTR Name (L3 activity)
COL_CURRENCY = 11        # Original Currency Type
COL_OPEX_CAPEX = 12
COL_FUNCTION = 13        # source function / driver sheet
COL_2026 = 15            # 2026 budget value in IDR


def main():
    meta = ASSETS["ELB"]
    wb = openpyxl.load_workbook(meta["workbook"], read_only=True, data_only=True)
    ws = wb[SHEET]

    lines = []
    in_block = False
    synthesized = 0
    real_codes = 0
    for r, row in enumerate(ws.iter_rows(values_only=True)):
        # Section markers in column 1 ('Start Copy' / 'End Copy') bracket the data.
        marker = row[1] if len(row) > 1 else None
        if isinstance(marker, str):
            if marker.strip() == "Start Copy":
                in_block = True
                continue
            if marker.strip() == "End Copy":
                in_block = False
                continue
        if not in_block:
            continue

        value = row[COL_2026] if len(row) > COL_2026 else None
        if not isinstance(value, (int, float)) or value == 0:
            continue

        item_desc = row[COL_ITEM_DESC] if len(row) > COL_ITEM_DESC else None
        wbs_name = row[COL_WBS_NAME] if len(row) > COL_WBS_NAME else None
        cost_block = row[COL_COST_BLOCK] if len(row) > COL_COST_BLOCK else None
        currency = row[COL_CURRENCY] if len(row) > COL_CURRENCY else None
        function = row[COL_FUNCTION] if len(row) > COL_FUNCTION else None
        raw_code = row[COL_BUDGET_CODE] if len(row) > COL_BUDGET_CODE else None

        if raw_code not in (None, ""):
            budget_code = str(int(raw_code)) if isinstance(raw_code, float) and raw_code.is_integer() else str(raw_code)
            real_codes += 1
        else:
            budget_code = f"ELB-{SHEET}-{r}"
            synthesized += 1

        currency = (str(currency).strip() if currency not in (None, "") else "IDR")
        fx = FX_2026 if currency.upper() == "USD" else 1

        lines.append({
            "budget_code": budget_code,
            "cost_block": str(cost_block).strip() if cost_block not in (None, "") else None,
            "l3_activity": str(wbs_name).strip() if wbs_name not in (None, "") else None,
            "l4_equipment": str(item_desc).strip() if item_desc not in (None, "") else None,
            "qty": None,
            "freq": None,
            "rate_idr": None,
            "fx": fx,
            "original_currency": currency,
            "value_idr": round(float(value)),
            "basis_of_estimate": str(function).strip() if function not in (None, "") else None,
        })
    wb.close()

    payload = {"asset": "ELB", "lines": lines}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))

    print(f"Wrote {OUT}")
    print(f"line count: {len(lines)}  (real budget codes: {real_codes}, synthesized: {synthesized})")
    total = sum(l["value_idr"] for l in lines)
    print(f"sum of line values (2026): Rp {total/1e9:.1f} Bn")
    # sanity lines
    for needle in ("Sodium Hypochlorite", "LTSA GE"):
        hits = [l for l in lines if l["l4_equipment"] == needle]
        for h in hits:
            print(f"  SANITY {needle}: code={h['budget_code']} "
                  f"block={h['cost_block']} cur={h['original_currency']} "
                  f"value=Rp {h['value_idr']:,}")


if __name__ == "__main__":
    main()
