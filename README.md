# Silver & Bosnia Ltd — Fullstack Website (Technical)

This repository contains a production-ready fullstack website for Silver & Bosnia Limited (Nairobi). It includes a marketing site (prebuilt SPA), a demo client portal with simulated IoT telemetry, and an admin console for message & subscriber management.

Purpose: serve the public site and provide a lightweight demo/admin backend for enquiries and newsletter management.

Supported Node: 18+

Prerequisites
- Node.js 18+ and npm
- Optional: cPanel with Node.js support (HostPinnacle) or any host that can run a Node.js process
- Recommended for local dev: modern browser, SQLite tooling for inspecting the DB

Quick start (local)

```bash
# install server deps
npm install
# install client deps
cd client && npm install && cd ..
# build frontend
npm run build
# start server (serves client/dist + API) on http://localhost:3000
npm start
```

Development (hot-reload)

```bash
npm run dev:server    # server with reload
npm run dev:client    # Vite dev server, proxies /api -> server
```

Environment (.env)
- Copy server/.env.example → server/.env and set SMTP values when required.
- The server reads SMTP_* and MAIL_TO for mail delivery; without SMTP the app will still save enquiries and mark deliveries as skipped.

Example minimal variables (server/.env):

```ini
PORT=3000
JWT_SECRET=replace-with-a-secure-secret
SMTP_HOST=mail.example.com
SMTP_PORT=465
SMTP_USER=info@example.com
SMTP_PASS=yourpassword
MAIL_TO=info@example.com
```

Database
- SQLite (better-sqlite3) — database file: `server/data/silverbosnia.db` (auto-created on first run).
- WAL mode is enabled via db.js for better concurrency.
- Backup: copy the DB file between deployments or use regular filesystem backups.

Native modules
- `better-sqlite3` is a native module. On some shared hosts, `npm install` may need compilers available. If compilation fails in cPanel, ask HostPinnacle to enable the build toolchain or install via SSH.

Security & production notes
- Demo admin credentials are included for local/demo use only — rotate before production.
- `.htaccess` in the public_html archive blocks private files (.env*, server/, client/, docs/, *.md) when extracted into a web root.
- Use a strong `JWT_SECRET` and secure the server process (systemd/pm2) behind HTTPS in production.

Deployment (HostPinnacle / cPanel)
Two supported workflows are supplied as zip archives in the repo/package distribution: a public_html bundle (static files + Node app ready for cPanel) and a full code archive to keep code outside the web root.

Option A — Extract into public_html (quick)
- Upload `silver-and-bosnia-public_html.zip` to cPanel → File Manager → public_html and extract.
- cPanel → Software → Setup Node.js App
  - Application Root: `/home/<cpanel-user>/public_html`
  - Startup file: `app.js`
  - Node version: 18+
  - Run NPM Install and Start the app
- Create mailbox and set `server/.env` from `.env.example` with SMTP variables.
- Restart Node app and verify `/admin` → Test SMTP.

Option B — Keep code outside web root (recommended for security)
- Upload `silver-and-bosnia-website.zip` and extract in your home directory.
- Setup Node.js app with Application Root = extracted folder and Startup file = `server/index.js`.

If cPanel lacks Setup Node.js App: SSH and run

```bash
npm install
pm run build
pm start
# or use pm2
pm2 start server/index.js --name silverbosnia
```

Repository layout

```
silverbosnia/
├── README.md
├── HOW-TO-DEPLOY.txt
├── app.js                # cPanel startup shim
├── .htaccess
├── package.json
├── docs/                 # analysis PDFs + assets
├── server/
│   ├── index.js          # Express app: API + static serving
│   ├── content.js        # site content (company, solutions, industries...)
│   ├── db.js             # better-sqlite3 setup (WAL)
│   ├── mailer.js         # SMTP notification + auto-reply logic
│   ├── telemetry.js      # simulated portal telemetry
│   ├── env.js            # env loader
│   ├── .env.example
│   └── data/             # SQLite DB file(s)
└── client/
    ├── public/           # images, logo
    ├── src/              # React app (components, pages, design system)
    └── dist/             # built frontend
```

API reference (summary)
- Public content
  - GET /api/health
  - GET /api/company
  - GET /api/solutions
  - GET /api/solutions/:slug
  - GET /api/clusters
  - GET /api/industries
  - GET /api/services
  - GET /api/process
  - GET /api/faqs
  - GET /api/technology
- Forms
  - POST /api/contact        # accepts contact form payload; validates + stores + (optionally) emails
  - POST /api/subscribe      # newsletter subscription
- Demo portal
  - GET /api/demo/summary
  - GET /api/demo/devices
  - GET /api/demo/series
  - GET /api/demo/alerts
  - POST /api/demo/alerts/:id/ack
- Admin (Bearer JWT required)
  - POST /api/admin/login    → { token }
  - GET /api/admin/me
  - GET /api/admin/messages
  - GET /api/admin/subscribers
  - PATCH /api/admin/messages/:id
  - DELETE /api/admin/messages/:id

Demo admin credentials (local/demo only)

```
email:    admin@silverbosnia.co.ke
password: SilverBosnia#2026
```

Change these before any public deployment.

Notes for developers
- To inspect the DB quickly: `sqlite3 server/data/silverbosnia.db` or use a GUI client
- The client is a Vite React app; build outputs to `client/dist` and are served by Express in production
- Server logs are printed to stdout; in production run under pm2/systemd and capture logs securely
- Tests: none bundled; consider adding integration tests for API endpoints and CI steps for builds

Contributing
- Open an issue or PR for feature requests or fixes. Provide a clear summary, steps to reproduce, and test instructions.

Contact
- +254 700 367 978 · info@silverandbosnia.co.ke

---
Technical README updated for developer-focused usage, deployment, and troubleshooting guidance.
