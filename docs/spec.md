# Spec (M1)

purpose: log student expenses, see money spent by category, set a weekly cap, regex searches transactions. Vanilla HTML,CSS and JS, data stored in localStorage.

Sections: Dashboard,Transactions, Add/Edit , Settings , About

## Data model
```json
{ "id": "txn_0001", "description": "Lunch at cafeteria", "amount": 1500,
  "category": "Food", "date": "2026-10-13",
  "createdAt": "2026-10-13T08:12:00Z", "updatedAt": "2026-10-13T08:12:00Z" }
```
Settings: `baseCurrency` (RWF), `rates` {USD, EUR}, `weeklyCap`, `categories`.
Keys: `sft:transactions`, `sft:settings`.

## Regex
 description `^\S(?:.*\S)?$` 
 duplicate word `\b(\w+)\s+\1\b`
 amount `^(0|[1-9]\d*)(\.\d{1,2})?$`
 date `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`
 category `^[A-Za-z]+(?:[ -][A-Za-z]+)*$`

## Breakpoints
360 single column, cards , 768 table + 2-col dashboard · 1024 sidebar nav
git add docs && git commit -m "M1: spec, data model, a11y plan" && git push