# -*- coding: utf-8 -*-
"""
Release-day synthetic order matrix against live Apps Script.

- Does NOT send real money (orders only land in the sheet + optional email)
- Covers menu combos, multi-cart, validation failures, dedupe
- Order IDs: BB-RELxxxx — delete those rows after review

Usage:
  python scripts/release_matrix_test.py
  python scripts/release_matrix_test.py --url "https://script.google.com/.../exec"
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_URL = (
    "https://script.google.com/macros/s/"
    "AKfycbwpvyRwhYQJIiz-lmPypoKC-2GvWzzMOzfD_RL_0-GLO36U2r2voebsNX6lpIyPqcIO/exec"
)

PRICES = {"soyrizo": 10, "cali": 12, "heavy": 10, "avo": 2}


def next_sunday_iso() -> str:
    today = date.today()
    # days until next Sunday (1..7)
    days = (6 - today.weekday()) % 7
    if days == 0:
        days = 7
    return (today + timedelta(days=days)).isoformat()


def expected_total(items: list[dict]) -> float:
    qty = {"soyrizo": 0, "soyrizoAvo": 0, "cali": 0, "heavy": 0, "heavyAvo": 0}
    for it in items:
        q = int(it.get("qty") or 0)
        if q <= 0:
            continue
        iid = it["id"]
        if iid == "soyrizo":
            qty["soyrizo"] += q
            if it.get("avo"):
                qty["soyrizoAvo"] += q
        elif iid == "cali":
            qty["cali"] += q
        elif iid == "heavy":
            qty["heavy"] += q
            if it.get("avo"):
                qty["heavyAvo"] += q
    total = (
        qty["soyrizo"] * PRICES["soyrizo"]
        + qty["soyrizoAvo"] * PRICES["avo"]
        + qty["cali"] * PRICES["cali"]
        + qty["heavy"] * PRICES["heavy"]
        + qty["heavyAvo"] * PRICES["avo"]
    )
    return round(total, 2)


def post(url: str, payload: dict, timeout: int = 45) -> tuple[int, dict | str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "text/plain;charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(body)
            except json.JSONDecodeError:
                return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, body
    except Exception as e:
        return 0, str(e)


def case_happy(order_id: str, name: str, unit: str, items: list[dict], phone: str = "") -> dict:
    d = next_sunday_iso()
    return {
        "id": order_id,
        "expect_ok": True,
        "expect_total": expected_total(items),
        "payload": {
            "orderId": order_id,
            "name": name,
            "unit": unit,
            "phone": phone,
            "deliverySunday": "RELEASE MATRIX TEST — delete row",
            "deliveryDate": d,
            "items": items,
        },
    }


def build_matrix() -> list[dict]:
    cases: list[dict] = []

    # --- Single-variant happy paths (all menu options) ---
    singles = [
        ("BB-REL01S", "soyrizo", False, 1, "Soyrizo classic x1"),
        ("BB-REL01A", "soyrizo", True, 1, "Soyrizo +avo x1"),
        ("BB-REL01C", "cali", False, 1, "Cali x1"),
        ("BB-REL01H", "heavy", False, 1, "Heavy classic x1"),
        ("BB-REL01B", "heavy", True, 1, "Heavy +avo x1"),
    ]
    for oid, iid, avo, qty, label in singles:
        cases.append(
            case_happy(
                oid,
                f"RELTEST {label}",
                "101",
                [{"id": iid, "qty": qty, "avo": avo}],
                phone="3105550100",
            )
        )

    # --- Qty ladder on one item ---
    for qty, oid in [(2, "BB-REL02A"), (5, "BB-REL02B"), (10, "BB-REL02C")]:
        cases.append(
            case_happy(
                oid,
                f"RELTEST qty ladder {qty}",
                "102",
                [{"id": "cali", "qty": qty, "avo": False}],
            )
        )

    # --- Multi-line carts (button combinations) ---
    combos = [
        (
            "BB-REL03A",
            "Soyrizo+Cali",
            [
                {"id": "soyrizo", "qty": 1, "avo": False},
                {"id": "cali", "qty": 1, "avo": False},
            ],
        ),
        (
            "BB-REL03B",
            "All three classic",
            [
                {"id": "soyrizo", "qty": 1, "avo": False},
                {"id": "cali", "qty": 1, "avo": False},
                {"id": "heavy", "qty": 1, "avo": False},
            ],
        ),
        (
            "BB-REL03C",
            "Both avo options + Cali",
            [
                {"id": "soyrizo", "qty": 2, "avo": True},
                {"id": "heavy", "qty": 1, "avo": True},
                {"id": "cali", "qty": 2, "avo": False},
            ],
        ),
        (
            "BB-REL03D",
            "Party tray",
            [
                {"id": "soyrizo", "qty": 3, "avo": False},
                {"id": "soyrizo", "qty": 2, "avo": True},  # split lines same id
                {"id": "cali", "qty": 4, "avo": False},
                {"id": "heavy", "qty": 2, "avo": False},
                {"id": "heavy", "qty": 1, "avo": True},
            ],
        ),
        (
            "BB-REL03E",
            "Max-ish variety",
            [
                {"id": "soyrizo", "qty": 5, "avo": True},
                {"id": "cali", "qty": 5, "avo": False},
                {"id": "heavy", "qty": 5, "avo": True},
            ],
        ),
    ]
    for oid, label, items in combos:
        cases.append(case_happy(oid, f"RELTEST {label}", "203", items, phone="9295550199"))

    # --- Input edge (still valid) ---
    cases.append(
        case_happy(
            "BB-REL04A",
            "  Name  With   Spaces  ",
            "  704  ",
            [{"id": "cali", "qty": 1, "avo": False}],
            phone="(310) 555-0199",
        )
    )
    cases.append(
        case_happy(
            "BB-REL04B",
            "A" * 80,  # max name length
            "U" * 20,
            [{"id": "heavy", "qty": 1, "avo": False}],
        )
    )
    cases.append(
        case_happy(
            "BB-REL04C",
            "Unicode Café Ñoño",
            "12B",
            [{"id": "soyrizo", "qty": 1, "avo": True}],
            phone="+1 310 555 0101",
        )
    )

    # --- Expect FAIL validation ---
    d = next_sunday_iso()
    fails = [
        (
            "BB-RELFAIL1",
            False,
            "missing name",
            {
                "orderId": "BB-RELFAIL1",
                "name": "",
                "unit": "1",
                "deliveryDate": d,
                "items": [{"id": "cali", "qty": 1, "avo": False}],
            },
        ),
        (
            "BB-RELFAIL2",
            False,
            "missing unit",
            {
                "orderId": "BB-RELFAIL2",
                "name": "X",
                "unit": "",
                "deliveryDate": d,
                "items": [{"id": "cali", "qty": 1, "avo": False}],
            },
        ),
        (
            "BB-RELFAIL3",
            False,
            "bad orderId",
            {
                "orderId": "NOT-VALID",
                "name": "X",
                "unit": "1",
                "deliveryDate": d,
                "items": [{"id": "cali", "qty": 1, "avo": False}],
            },
        ),
        (
            "BB-RELFAIL4",
            False,
            "no burritos",
            {
                "orderId": "BB-RELFAIL4",
                "name": "X",
                "unit": "1",
                "deliveryDate": d,
                "items": [{"id": "cali", "qty": 0, "avo": False}],
            },
        ),
        (
            "BB-RELFAIL5",
            False,
            "empty items",
            {
                "orderId": "BB-RELFAIL5",
                "name": "X",
                "unit": "1",
                "deliveryDate": d,
                "items": [],
            },
        ),
        (
            "BB-RELFAIL6",
            False,
            "bad date",
            {
                "orderId": "BB-RELFAIL6",
                "name": "X",
                "unit": "1",
                "deliveryDate": "08/03/2026",
                "items": [{"id": "cali", "qty": 1, "avo": False}],
            },
        ),
        (
            "BB-RELFAIL7",
            False,
            "unknown item only",
            {
                "orderId": "BB-RELFAIL7",
                "name": "X",
                "unit": "1",
                "deliveryDate": d,
                "items": [{"id": "taco", "qty": 2, "avo": False}],
            },
        ),
    ]
    for oid, expect_ok, label, payload in fails:
        cases.append(
            {
                "id": oid,
                "label": label,
                "expect_ok": expect_ok,
                "expect_total": None,
                "payload": payload,
            }
        )

    # too many burritos (>40)
    cases.append(
        {
            "id": "BB-RELFAIL8",
            "label": "too many burritos",
            "expect_ok": False,
            "expect_total": None,
            "payload": {
                "orderId": "BB-RELFAIL8",
                "name": "Party",
                "unit": "1",
                "deliveryDate": d,
                "items": [
                    {"id": "cali", "qty": 20, "avo": False},
                    {"id": "heavy", "qty": 20, "avo": False},
                    {"id": "soyrizo", "qty": 5, "avo": False},
                ],
            },
        }
    )

    return cases


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--sleep", type=float, default=0.35, help="seconds between posts")
    ap.add_argument(
        "--out",
        default=str(ROOT / "docs" / "RELEASE_MATRIX_RESULTS.md"),
    )
    args = ap.parse_args()

    cases = build_matrix()
    # Dedupe test: run first happy case twice at end
    dedupe_payload = None
    for c in cases:
        if c["expect_ok"] and c["id"] == "BB-REL01C":
            dedupe_payload = dict(c["payload"])
            break

    results = []
    passed = failed = 0

    print(f"URL: {args.url}")
    print(f"Cases: {len(cases)} + dedupe\n")

    for i, c in enumerate(cases, 1):
        label = c.get("label") or c["payload"].get("name") or c["id"]
        status, body = post(args.url, c["payload"])
        ok = isinstance(body, dict) and bool(body.get("ok"))
        exp = c["expect_ok"]
        total_ok = True
        if exp and isinstance(body, dict) and c.get("expect_total") is not None:
            got = body.get("total")
            if got is not None and abs(float(got) - float(c["expect_total"])) > 0.001:
                total_ok = False
        success = (ok == exp) and total_ok and (status == 200 or not exp)
        # For failures, HTTP 200 with ok:false is fine
        if exp:
            success = status == 200 and ok and total_ok
        else:
            success = status == 200 and (isinstance(body, dict) and body.get("ok") is False)

        if success:
            passed += 1
            mark = "PASS"
        else:
            failed += 1
            mark = "FAIL"

        line = f"[{mark}] {c['id']} — {label} → {body}"
        print(line)
        results.append(
            {
                "mark": mark,
                "id": c["id"],
                "label": label,
                "expect_ok": exp,
                "expect_total": c.get("expect_total"),
                "status": status,
                "body": body,
            }
        )
        time.sleep(args.sleep)

    # Dedupe
    if dedupe_payload:
        status, body = post(args.url, dedupe_payload)
        # first was already inserted; second should ok + deduped
        success = (
            status == 200
            and isinstance(body, dict)
            and body.get("ok") is True
            and body.get("deduped") is True
        )
        mark = "PASS" if success else "FAIL"
        if success:
            passed += 1
        else:
            failed += 1
        print(f"[{mark}] BB-REL01C-DEDUPE — second identical post → {body}")
        results.append(
            {
                "mark": mark,
                "id": "BB-REL01C-DEDUPE",
                "label": "dedupe same orderId",
                "expect_ok": True,
                "expect_total": None,
                "status": status,
                "body": body,
            }
        )

    total = passed + failed
    print(f"\n=== {passed}/{total} passed, {failed} failed ===")

    # Write report
    out = Path(args.out)
    lines = [
        "# Release matrix results",
        "",
        f"**Run:** synthetic orders against live Apps Script (no payments).",
        f"**Endpoint:** `{args.url[:60]}…`",
        f"**Score:** **{passed}/{total}** passed, {failed} failed",
        "",
        "## Cleanup",
        "",
        "In Google Sheet **Orders**, delete whole rows whose OrderID starts with `BB-REL`.",
        "",
        "## Results",
        "",
        "| Result | Order ID | Case | HTTP | Response |",
        "|--------|----------|------|------|----------|",
    ]
    for r in results:
        body_s = json.dumps(r["body"], ensure_ascii=False)[:120].replace("|", "/")
        lines.append(
            f"| {r['mark']} | `{r['id']}` | {r['label'][:40]} | {r['status']} | `{body_s}` |"
        )
    lines.extend(
        [
            "",
            "## Menu matrix covered",
            "",
            "- Soyrizo classic / Soyrizo+avo",
            "- Cali",
            "- Heavy classic / Heavy+avo",
            "- Qty 1, 2, 5, 10",
            "- Multi-item combos including all three + avo mix",
            "- Name/unit trim, max length, unicode, phone formats",
            "- Validation: missing name/unit, bad orderId, empty cart, bad date, unknown item, too many",
            "- Dedupe same orderId",
            "",
            "## Manual UI (do on phone + desktop)",
            "",
            "See `docs/RELEASE_UI_MATRIX.md`",
            "",
        ]
    )
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
