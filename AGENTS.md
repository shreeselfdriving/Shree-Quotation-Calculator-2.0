# Shree Self Drive — Quotation Calculator

## What this project is
A static web app (no backend, no build step, zero dependencies) that turns
trip details + rates into a formatted WhatsApp-ready self-drive quotation,
plus a printable single-page A4 PDF. Part of the wider **Shree Self Driving**
car-rental business, whose main site/CRM is built on Laravel.

## Stack
Plain HTML / CSS / vanilla JS only. No framework, no npm build. Keep it that
way unless explicitly asked to change it.

## File map
- `index.html` — landing page
- `quote/index.html` — the quotation calculator (main page)
- `calc.js` — all calculation logic + quotation text/view rendering
- `theme.js` — dark/light theme toggle (persisted in `localStorage`, key `sdr-theme`)
- `styles.css` — themes + responsive layout
- `tests.html` — calculation/test runner; every case must show ✅
- `vercel.json` — deploy config (Framework: Other, no build command, output = root)
- `PRD.md` / `README.md` — product spec and usage docs; update these if behaviour changes

## Billing rules (source of truth — don't change without confirming with the user)
```
totalHours   = ceil(returnTime - pickupTime)
days         = max(1, floor(totalHours / 24))
includedHrs  = days * 24
extraHours   = max(0, totalHours - includedHrs)
rental       = days * ratePerDay
extraCharge  = extraHours * extraHourRate
totalRental  = rental + extraCharge
discount     = flat amount, OR percent of totalRental — capped at totalRental
payable      = totalRental - discount + deposit - token
```
- Missing dates or empty day rate → validation error, never a misleading quote.
- Negative amounts clamp to 0.
- Extra-KM billing is intentionally out of scope (needs an odometer reading at
  return); included-KM and extra-KM rate are shown on the quotation only, not
  calculated.

## Conventions
- All numbers recalculate live on every input change — there is no submit button.
- Quotation text must keep the existing WhatsApp template format (bold `*`,
  emojis, ₹ with Indian digit grouping).
- Mobile-first responsive: staff mostly use this on a phone.
- No customer/quote data is ever persisted — only the theme preference.

## Run & test locally
```
npx serve . -l 3000     # or: python -m http.server 3000
```
Then open `http://localhost:3000` (landing), `/quote` (calculator) and
`/tests.html` (must be all green before shipping a change).

## Out of scope for v1 (don't add unless asked)
Login, saved quotes, invoice numbers, GST, customer database, auto extra-KM
billing. Possible v2 ideas already noted in `PRD.md`: cap extra hours at one
day's rate, quote history, per-vehicle presets, business logo/phone number on
the quotation.
