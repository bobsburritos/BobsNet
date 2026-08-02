# Google setup (bound sheet)

**Sheet:** https://docs.google.com/spreadsheets/d/1zC1mxVI3cAnyktj7yqSEhiCd4_YkbwFa024lOGtg7IE/edit  
**Sheet ID:** `1zC1mxVI3cAnyktj7yqSEhiCd4_YkbwFa024lOGtg7IE`  
**Owner email:** `bobsburritosco@gmail.com`

## Why this is manual

Google Sheets + Apps Script deployment require a browser login and OAuth consent for the business account. There is no `clasp` / `gcloud` session on this machine, and the shared sheet returns 401 without that login. Automation stops at the clipboard + open-sheet helper.

## Fast path

In PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\MiguelAznar\007_PersonalProjects\200_BobsBurritos\local\setup-apps-script.ps1"
```

That copies `local/bobs-burritos-backend.READY.gs` (already has `OWNER_EMAIL` + `PORTAL_KEY`) and opens the sheet.

Then: **Extensions → Apps Script → paste → Run `setupSheets` → Deploy Web app (Anyone) → copy URL**.

## After you have the Web app URL

Send it to the agent (or set `SCRIPT_URL=` in `local/config.env`). We will:

1. Set `SCRIPT_URL` in public `index.html` and push  
2. Set `SCRIPT_URL` in `local/bobs-kitchen.html` (never committed)  
3. Smoke-test order flow  

## Deploy rule

Every future edit to the Apps Script needs **Deploy → Manage deployments → edit → New version**, or the live Web app keeps serving old code.
