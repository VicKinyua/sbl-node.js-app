# Silver & Bosnia Ltd — Fullstack Website

A complete fullstack website for **Silver & Bosnia Limited** (Nairobi), a software & IoT
solutions company — built from the company's IoT offering analysis: 14 IoT solution areas,
5 use-case clusters, 6 connectivity protocols, 14 industries, 8 software service lines and a
7-stage delivery model.

## Stack

| Layer     | Tech                                                        |
|-----------|-------------------------------------------------------------|
| Frontend  | React 18 + Vite + React Router, hand-written design system  |
| Backend   | Node.js + Express (REST API)                                |
| Database  | SQLite via `better-sqlite3` (WAL)                           |
| Auth      | JWT (admin console) + bcrypt password hashing               |
| Charts    | Custom SVG charts (no chart library)                        |
| Images    | 9 generated photorealistic images + supplied brand logo     |

## Run

```bash
npm install            # root (server) dependencies
cd client && npm install && cd ..
npm run build          # build the frontend into client/dist
npm start              # serve API + website on http://localhost:3000
```

Dev mode (hot reload): `npm run dev:server` and `npm run dev:client` (Vite proxies `/api`).

## 📧 Email via cPanel SMTP — HostPinnacle (contact form delivery)

Contact-form submissions are **always saved to the database first**, then emailed:

1. **Notification** → your company mailbox (`MAIL_TO`) with all form details and a
   one-click link to the admin console
2. **Auto-reply** → the sender, acknowledging receipt within one business day
3. **Newsletter subscribers** → a short notification to the company mailbox

Configure your HostPinnacle cPanel relay once (~2 minutes):

```bash
cp server/.env.example server/.env
```

In **HostPinnacle cPanel → Email → Email Accounts → "Connect Devices"** next to
`info@silverandbosnia.co.ke`, copy the **Secure SSL/TLS** values into `server/.env`:

```ini
SMTP_HOST=mail.silverandbosnia.co.ke   # exactly as cPanel prints it (may be the server hostname)
SMTP_PORT=465                          # 465 = SSL (recommended); 587 = STARTTLS
SMTP_USER=info@silverandbosnia.co.ke   # full email address
SMTP_PASS=your-cpanel-mailbox-password
MAIL_TO=info@silverandbosnia.co.ke
```

```bash
npm start                               # restart the server after editing .env
```

Then open `/admin` → **“Test SMTP”** to send a verification email through
HostPinnacle's relay. Check **cPanel → Email Deliverability** (SPF/DKIM) if test
mail lands in spam. Until SMTP is configured the site still works — enquiries are
stored and visible in the admin console (delivery is logged as skipped on the server).

## 🚀 Deploying to HostPinnacle (cPanel)

HostPinnacle plans include **Node.js support**, and the site runs in two layers:
Apache serves the pre-built pages, and cPanel's Node.js app runs the API
(contact forms, newsletter, admin console, portal, email).

### ✅ Option A — upload straight into `public_html` (easiest)

A ready-made archive exists: **`silver-and-bosnia-public_html.zip`** — its
contents extract *directly* into `public_html`: the built site lands at the top
level (plus a protective `.htaccess`), so there is nothing to move afterwards.

1. **cPanel → Files → File Manager → `public_html` → Upload** → choose the zip →
   **Go Back** → select the zip → **Extract → Extract File(s**).
2. **cPanel → Software → Setup Node.js App → Create Application**
   - Application Root: `/home/<cpanel-user>/public_html`
   - Application Startup File: **`app.js`**
   - Node.js version: **18 or newer** → **Create Application**
   - Click **Run NPM Install**, then **Start** (or *Restart app*) — the server
     already listens on `process.env.PORT`, so it is Passenger-ready.
3. **Email:** create the mailbox `info@silverandbosnia.co.ke`
   (**Email → Email Accounts**), then in File Manager create `server/.env` from
   `server/.env.example` with the SMTP values (see the Email section above) and
   restart the Node app.
4. Open the site → `/admin` → **“Test SMTP”** to confirm end-to-end delivery.

> The bundled `.htaccess` keeps `server/`, `client/`, `docs/`, `*.md`, `.env*`
> and the SQLite database **web-inaccessible** and routes page URLs to the SPA.
> The design renders before step 2 finishes, but the API (forms, admin, portal)
> needs the Node.js app running. A `HOW-TO-DEPLOY.txt` checklist ships in the
> same zip.

### Option B — keep all code outside the web root

Upload `silver-and-bosnia-website.zip` instead, extract it in your **home**
directory (not `public_html`), then create the Node.js app with Application Root
= the extracted `silverbosnia` folder and startup file `server/index.js`, and
assign your domain to it on the same screen.

### Notes

- **Data:** enquiries and subscribers live in `server/data/silverbosnia.db`
  (auto-created on first run; both zips contain the current data). Back it up
  and carry it between deployments.
- `better-sqlite3` is a native module — if **Run NPM Install** fails to compile,
  ask HostPinnacle support to enable compilers for your account, then re-run it.
- Shared-hosting alternative (if Setup Node.js App is missing): SSH →
  `npm install` → `pm2 start server/index.js --name silverbosnia`.

## 📁 Repository layout

```
silverbosnia/
├── README.md              ← this documentation
├── HOW-TO-DEPLOY.txt      ← 5-step deploy checklist (no credentials)
├── app.js                 ← cPanel "Startup File" entry (Passenger → server/index.js)
├── .htaccess              ← blocks private files + SPA routing in public_html
├── package.json           ← server deps + scripts (install, build, start)
├── docs/                  ← original IoT offering analysis (PDF) + logo
├── server/
│   ├── index.js           ← Express app (API + static serving of client/dist)
│   ├── content.js         ← all site content (company, solutions, industries, …)
│   ├── db.js              ← better-sqlite3 setup (WAL, auto-creates tables)
│   ├── mailer.js          ← SMTP notification + auto-reply emails
│   ├── telemetry.js       ← simulated portal telemetry
│   ├── env.js             ← .env loading
│   ├── .env.example       ← HostPinnacle SMTP template (copy to .env)
│   └── data/              ← SQLite database files (auto-created)
└── client/
    ├── public/            ← images (no people), logo
    ├── src/               ← React app (11 pages, components, design system)
    └── dist/              ← pre-built frontend (served by Express)
```

The **public_html zip additionally contains the built site at its top level**
(`index.html`, `assets/`, `img/`, `favicon.svg`, `logo.png`) so Apache can serve
it directly after a single Extract.


## Features

**Public site**
- Home with hero, stats, dual-practice story, solutions, clusters, platform band,
  industries, differentiators, 7-stage process and CTA
- 14 IoT solution areas — searchable/filterable listing + individual detail pages
- Industries, Platform (connectivity · platform · security · hardware supply),
  Software (8 service lines), About (vision, delivery model, commitments)
- Contact form with server-side validation → stored in SQLite
- Newsletter subscription
- FAQ accordion, mobile-first responsive design, scroll-reveal animations

**Client Portal demo** (`/portal`)
- Live simulated telemetry (8 devices, 5-second tick): KPIs, device fleet, time-series
  chart with 8h/24h ranges, fuel gauge, category donut, sparklines, alert feed with
  acknowledgement

**Admin console** (`/admin`)
- JWT login → enquiry inbox (KPIs, filters, read/expand, status workflow, delete),
  subscriber list, sign-out

### Demo admin credentials

```
email:    admin@silverbosnia.co.ke
password: SilverBosnia#2026
```

## API overview

```
GET  /api/health | /api/company | /api/solutions | /api/solutions/:slug
GET  /api/clusters | /api/industries | /api/services | /api/process | /api/faqs
GET  /api/technology
POST /api/contact | /api/subscribe
GET  /api/demo/summary | /api/demo/devices | /api/demo/series | /api/demo/alerts
POST /api/demo/alerts/:id/ack
POST /api/admin/login                       → { token }
GET  /api/admin/me | /api/admin/messages | /api/admin/subscribers   (Bearer)
PATCH/DELETE /api/admin/messages/:id                            (Bearer)
```

## Contact (from company materials)

Phone/WhatsApp: +254 700 367 978 · info@silverandbosnia.co.ke · Nairobi, Kenya
Tagline: *Innovating Today. Connecting Tomorrow. Empowering Businesses.*
