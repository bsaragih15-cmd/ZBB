"""Shared configuration for the MPI ZBB ETL.

All four "Template Driver" workbooks share the same Cost Summary layout: the
year header row carries 2024..2035 and the 2026 budget column resolves to
zero-based column index 17 for every row (subtotals and detail lines alike).
This was verified empirically against the ACCEPTANCE controllable-O&M totals.

MRPR is denominated in IDR thousands (unit_scale = 1000); the other three are
in raw IDR (unit_scale = 1).
"""
from pathlib import Path

DOWNLOADS = Path("/Users/saragihberthin/Downloads")

FX_2026 = 16500           # IDR per USD
INFLATION_2026 = 0.03     # 3%

# Verified against the real year-header row: 2026 budget lives at 0-based col 17.
YEAR_2026_COL = 17

# code -> metadata. workbook is an absolute Path to the real file.
ASSETS = {
    "ELB": {
        "full_name": "Energi Listrik Batam",
        "mw": 109.0,
        "unit_scale": 1,
        "workbook": DOWNLOADS / "ELB_Template Driver_2025-2035 Rev 250925 (1).xlsx",
        "cost_summary_sheet": "Cost Summary",
    },
    "DEB": {
        "full_name": "Dalle Energy Batam",
        "mw": 76.0,
        "unit_scale": 1,
        "workbook": DOWNLOADS / "DEB_Template Driver_2025-2035 Compile 20251019.xlsx",
        "cost_summary_sheet": "COST SUMMARY",
    },
    "MEB": {
        "full_name": "Mitra Energi Batam",
        "mw": 82.1,
        "unit_scale": 1,
        "workbook": DOWNLOADS / "MEB_Template Driver_LTP 2026 Adj Tariff 1_251025.xlsx",
        "cost_summary_sheet": "COST SUMMARY",
    },
    "MRPR": {
        "full_name": "Medco Ratch Power Riau",
        "mw": 275.0,
        "unit_scale": 1000,  # workbook is in IDR thousands
        "workbook": DOWNLOADS / "MRPR_Template Driver_2025-2035 - rev19_CF60 Update 4.xlsx",
        "cost_summary_sheet": "COST SUMMARY",
    },
}

# Controllable O&M (ex-fuel) = COGS-less-fuel + G&A detail lines.
# These are the exact Cost Summary row labels, in display order.
CONTROLLABLE_BLOCKS = [
    "Maintenance Service Agreement",
    "Maintenance Cost",
    "Consumable",
    "Salary and benefits",
    "Professional Service",
    "Rental Expense",
    "Contract Service",
    "Transportation",
    "Other Operating Expense",
    "Insurance Expense",
    "Management Fees",
]

# Blocks the CFO treats as semi-committed (hard to flex in-year).
SEMI_COMMITTED = {"Insurance Expense", "Management Fees"}

# Everything below the controllable line: excluded from the $/kW-yr metric.
EXCLUDED_BLOCKS = {
    "Fuel Cost",
    "Construction Cost IFRS",
    "Depreciation",
    "Depreciation RoU",
    "Amortization Expense",
    "Finance Costs",
    "Finance Income",
    "Interest Lease Liabilities",
    "Other Expenses",
    "Other Income",
    "Other (Income) / Expenses",
    "Current Tax",
    "Capex",
    "Building",
    "Machinery",
    "Equipment and Vehicles",
    "Supporting Assets",
    "Others",
    "STG Recovery",
    "Task Force",
    "Contract Penalties",
}

# Friendly display names for the controllable cost blocks (UI labels).
BLOCK_DISPLAY = {
    "Maintenance Service Agreement": "Maintenance Service Agreement",
    "Maintenance Cost": "Maintenance Cost",
    "Consumable": "Consumable",
    "Salary and benefits": "Salary & Allowance",
    "Professional Service": "Professional Service",
    "Rental Expense": "Rental",
    "Contract Service": "Contract Service",
    "Transportation": "Transportation",
    "Other Operating Expense": "Other Opex",
    "Insurance Expense": "Insurance",
    "Management Fees": "Management Fees",
}
