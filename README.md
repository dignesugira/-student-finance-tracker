# Student Finance Tracker

A small single page app for logging student expenses, built with HTML, CSS and JavaScript. Records live and saves in the browser through localStorage and can be exported/imported as JSON file.

Live site: https://dignesugira.github.io/-student-finance-tracker/

## Features

- Add, edit and delete transactions 
- Dashboard: total records, total money spent, top category, last 7 days chart
- Weekly spending cap with live announcement 
- Live regex search across all fields 
- Sort by date, description or amount in either direction
- Settings: display currency (RWF base, USD, EUR) with manual rates; editable category list
- Auto save to localStorage, JSON export, JSON import with structure validation
- Load sample data from `seed.json`
- Mobile-first responsive layout (cards on mobile, table from 768px, sidebar nav from 1024px)

## Regex catalog

| Rule | Pattern | Example pass | Example fail |
|---|---|---|---|
| Description | `^\S(?:.*\S)?$` | `Lunch at cafeteria` | ` Lunch` |
| Duplicate word (back-reference) | `\b(\w+)\s+\1\b` | `tea then tea` | `coffee coffee` |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | `12.50` | `007` |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2026-10-13` | `2026-13-01` |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Self-care` | `Food2` |

Search examples: `(coffee|tea)`, `\.\d{2}\b`, `\b(\w+)\s+\1\b`. Invalid patterns show an error instead of crashing.

## Keyboard map

- Tab / Shift+Tab : move between controls; first stop is the skip link
- Enter : submit form, activate buttons and links
- Space : toggle checkbox, activate buttons
- Arrow keys : change select options
- Esc : cancel a confirmation dialog

## Accessibility notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and a single `h1`
- Skip link, visible focus ring, full keyboard flow
- Labels bound to inputs; errors linked with `aria-describedby`
- `role="status"` for messages; cap overage uses `aria-live="assertive"`
- Table headers kept for screen readers on mobile; matches highlighted with `<mark>`
- Text contrast ≈16:1, links/buttons ≈7:1

## Running locally

Serve the folder with any static server, e.g.

    python3 -m http.server 8000

then open `http://localhost:8000`. Opening `index.html` directly from the file system won't work because ES modules need a server.

## Running tests

Open `http://localhost:8000/tests.html`. Each assertion prints PASS or FAIL, with a summary at the bottom.

## demo video link

https://www.loom.com/share/c272c7e5dbf443d5921603c8913ea072