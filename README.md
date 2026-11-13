# Shree Self Driving & Car Rental Service — Quotation Calculator 2.0

A modern, responsive, offline-first static web application for creating professional self-drive car rental quotations, generating instant WhatsApp Business messages, booking calendar management, GST invoice generation, and exporting full-size A4 executive PDF quotations.

---

## 🌟 Key Features (Version 2.0)

- **✨ 3D Glassmorphism Premium UI:**
  - Modern ultra-sleek 3D card depth, frosted glass effects, neon accents, and smooth animations.
  - WCAG AAA high-contrast text rendering across both Dark and Light themes.

- **📅 Realtime Booking Calendar (`/calendar/`):**
  - Track vehicle availability, active rentals, upcoming pickups, and returns.
  - Synchronized vehicle registry and instant booking creation.

- **🧾 GST-Ready Invoice Generator (`/invoice/`):**
  - Convert quotations or confirmed bookings directly into GST-compliant tax invoices.
  - 18% CGST/SGST breakdown, reverse charge, and print-ready A4 PDF invoice export.

- **🔄 Automatic GitHub Synchronizer:**
  - Background live watcher (`auto-sync.py` / `start-autosync.bat`) that immediately commits and pushes all code modifications to GitHub repository in real time.

- **⚡ Instant Automatic Calculations:**
  - Auto-calculates trip duration, days, extra hours, and total rental.
  - **Dynamic Included KM:** Automatically calculates `300 km/day × days` (custom editable with live preview hint).
  - Discount engine (flat ₹ or % discount).
  - Net payable amount breakdown at vehicle handover.

- **⏰ Quotation Validity:**
  - Select validity periods: `24 Hours`, `48 Hours`, `3 Days`, `7 Days`, or `Valid for Today Only`.
  - Displayed in live quotation card, PDF export, and WhatsApp message.

- **📝 Special Notes & Remarks:**
  - Dedicated editable remarks section for FASTag toll rules, original driving licence/Aadhaar checks, and handover inspection notes.

- **📱 WhatsApp & WhatsApp Business Ready:**
  - One-click share button supporting native mobile app selector (`whatsapp://` intent) for WhatsApp Business and regular WhatsApp.
  - Clean Unicode formatted quotation message ready to send to clients.

- **📄 Full-Size A4 PDF Export:**
  - Print-optimized CSS (`@media print`) tailored to fill an executive A4 page without miniature scaling or awkward cut-offs.

- **🌗 Luxury Dual-Theme UI:**
  - Premium Dark & Light themes with high WCAG AAA contrast ratio.
  - Theme preference persisted across sessions in `localStorage`.

- **🚗 Vehicle Preset Management:**
  - Select, add, customize, and save vehicle parameters directly in the browser.

---

## 🚀 Live Demo & Pages

- **Landing Hub:** `index.html` (or `/`)
- **Quotation Calculator:** `quote/index.html` (or `/quote/`)
- **Direct Zip Download:** Accessible from the header button.

---

## 📦 How to Deploy on GitHub Pages (Free Hosting)

### Method 1: GitHub Web (Fastest — 2 Minutes, No Terminal Needed)
1. Go to [github.com/new](https://github.com/new) and sign in.
2. Enter Repository name (e.g., `shree-quotation-calculator`).
3. Set visibility to **Public** and click **Create repository**.
4. Click **uploading an existing file** on the repository page.
5. Drag and drop all files from this folder (`index.html`, `styles.css`, `theme.js`, `calc.js`, `quote/`, `README.md`, etc.).
6. Click **Commit changes**.
7. Go to **Settings** > **Pages** (in the left sidebar).
8. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
9. Your site will be live in 1–2 minutes at:  
   `https://<your-username>.github.io/shree-quotation-calculator/`

---

### Method 2: Git Command Line (CLI)
If Git is installed on your computer, run:
```bash
# 1. Initialize git
git init

# 2. Add files and make initial commit
git add .
git commit -m "Deploy Shree Self Driving Quotation Calculator"

# 3. Rename branch to main
git branch -M main

# 4. Add your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/shree-quotation-calculator.git

# 5. Push to GitHub
git push -u origin main
```
Then go to **Settings** > **Pages** > Select `main` branch > **Save**.

---

## 💻 Local Development

Run locally using any static web server:
```bash
# Using Node.js npx serve
npx serve . -l 3000

# Or using Python
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/quote](http://localhost:3000/quote).

---

## 📞 Business Information
- **Business Name:** Shree Self Driving & Car Rental Service
- **Booking Hotline:** +91 9768010603
- **Email:** shreeselfdriving@gmail.com
- **Website:** [www.shreeselfdriving.in](https://www.shreeselfdriving.in)
- **Address:** Near Kia Motors Showroom, Bhoomi Landmark, Sector 17, Khanda Colony, Panvel, Navi Mumbai – 410206
