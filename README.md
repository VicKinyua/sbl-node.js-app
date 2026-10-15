# Silver & Bosnia Ltd — Fullstack Website

This repository contains a production-oriented full-stack web application for Silver & Bosnia Limited, based in Nairobi, Kenya. It combines a public marketing website with a demo client portal that simulates IoT telemetry and limited operational workflows for enquiry and newsletter management.

The project is designed to run as a single Node.js application with an Express API backend and a Vite-based React frontend. It is intended for deployment to Node-supported hosts such as cPanel, VPS, or containerized environments.

## Stack

- Runtime: Node.js 18+
- Web server: Express
- Frontend: React + Vite
- Data store: SQLite via better-sqlite3
- Mail: SMTP (nodemailer-compatible transport)
- Auth: JWT-based admin authentication
- State: in-memory simulated telemetry for demo portal flows

## Repository layout

```text
.
├── README.md
├── HOW-TO-DEPLOY.txt
├── app.js                  # cPanel startup shim
├── .htaccess               # web-root hardening rules
├── package.json
├── docs/                   # PDFs, assets, vendor analysis docs
├── server/
│   ├── index.js            # Express server + API + static hosting
│   ├── content.js          # public content data model
│   ├── db.js               # SQLite connection + WAL config
│   ├── mailer.js           # SMTP and delivery pipeline
│   ├── telemetry.js        # demo telemetry simulation
│   ├── env.js              # environment loader and validation
│   ├── .env.example
│   └── data/
│       └── silverbosnia.db
├── client/
│   ├── public/
│   ├── src/
│   └── dist/
└── package-lock.json
```

## Requirements

- Node.js 18 or newer
- npm 9+
- SQLite runtime support for better-sqlite3
- Optional: cPanel Node.js app support, pm2, systemd, or similar process supervisor
- Optional: SMTP-capable mail server for production notification delivery

## Local development

Install dependencies:

```bash
npm install
cd client && npm install && cd ..
```

Build the frontend bundle:

```bash
npm run build
```

Run the production-style app:

```bash
npm start
```

This serves the built frontend from `client/dist` and hosts the Express API on the same process.

Hot-reload development workflow:

```bash
npm run dev:server
npm run dev:client
```

The Vite dev client proxies API requests to the backend, which is useful for frontend iteration without rebuilding the production bundle on every change.

## Environment configuration

Copy the server environment template before running the app in a non-default environment:

```bash
cp server/.env.example server/.env
```

Minimum runtime configuration:

```ini
PORT=3000
JWT_SECRET=replace-with-a-secure-secret
SMTP_HOST=mail.example.com
SMTP_PORT=465
SMTP_USER=info@example.com
SMTP_PASS=yourpassword
MAIL_TO=info@example.com
```

Environment variables consumed by the server:

- `PORT`: Express listen port
- `JWT_SECRET`: signing secret for admin bearer tokens
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: mail transport configuration
- `MAIL_TO`: recipient address used for administrative notification delivery

If SMTP is not configured, the app continues to operate but marks mail delivery as skipped and records submission records in SQLite.

## Database

The application uses SQLite with `better-sqlite3`.

Primary database file:

```text
server/data/silverbosnia.db
```

Database behavior:

- Auto-created on first startup if missing
- WAL mode enabled via `server/db.js`
- Intended for lightweight operational usage and prototyping
- Best suited for demo or low-traffic internal deployments

Operational notes:

- Use SQLite CLI or GUI tooling for direct inspection and debugging
- For backups, copy the database file or snapshot the containing directory
- For production workloads that require concurrency or multi-node scaling, migrate to PostgreSQL or MySQL

## Authentication and admin access

The admin API is protected with JWT bearer tokens. Demo admin credentials are included for local and demonstration environments only:

```text
email:    admin@silverbosnia.co.ke
password: SilverBosnia#2026
```

These credentials must be changed before exposing the app beyond local or staging usage.

## API surface

The API is exposed under `/api` and supports public content endpoints, submission endpoints, a demo telemetry portal, and protected admin routes.

### Public content

- `GET /api/health`
- `GET /api/company`
- `GET /api/solutions`
- `GET /api/solutions/:slug`
- `GET /api/clusters`
- `GET /api/industries`
- `GET /api/services`
- `GET /api/process`
- `GET /api/faqs`
- `GET /api/technology`

### Forms and submissions

- `POST /api/contact`
- `POST /api/subscribe`

These endpoints validate request payloads, persist records, and optionally dispatch email notifications if SMTP is configured.

### Demo portal

- `GET /api/demo/summary`
- `GET /api/demo/devices`
- `GET /api/demo/series`
- `GET /api/demo/alerts`
- `POST /api/demo/alerts/:id/ack`

These endpoints simulate operational telemetry and device status views for the demo client portal.

### Admin (JWT required)

- `POST /api/admin/login` → returns `{ token }`
- `GET /api/admin/me`
- `GET /api/admin/messages`
- `GET /api/admin/subscribers`
- `PATCH /api/admin/messages/:id`
- `DELETE /api/admin/messages/:id`

All protected admin routes require a bearer token in the `Authorization` header.

## Mail delivery behavior

The server integrates with SMTP through `server/mailer.js`.

Behavior:

- If SMTP configuration is valid, enquiry and contact submissions can trigger email delivery.
- If SMTP is missing or misconfigured, the app still stores records and marks delivery as skipped.
- Administrative recipients are controlled by `MAIL_TO`.

This is useful for local development and low-ops deployments where mail delivery is optional or deferred.

## Production considerations

### Security

- Rotate `JWT_SECRET` before deployment
- Never commit `.env` files to source control
- Restrict admin routes to trusted networks or TLS-terminated ingress
- Serve the application behind HTTPS
- Rotate demo credentials before any public-facing deployment
- Use a process manager such as pm2 or systemd in production

### Host deployment

The repository includes deployment archives intended for Node-enabled cPanel environments.

#### Option A: public_html deployment

- Upload `silver-and-bosnia-public_html.zip` to cPanel
- Extract it into `public_html`
- Configure Node.js app with:
  - Application Root: `/home/<cpanel-user>/public_html`
  - Startup file: `app.js`
  - Node version: 18+
- Create mailbox settings and populate `server/.env` using `.env.example`
- Restart the Node app and verify `/admin`

#### Option B: code outside web root (recommended)

- Upload `silver-and-bosnia-website.zip`
- Extract it outside the public web root
- Configure the Node app using the extracted project directory and startup file `server/index.js`

If cPanel's auto app setup is unavailable, use:

```bash
npm install
npm run build
npm start
```

or with a process manager:

```bash
pm2 start server/index.js --name silverbosnia
```

## Native module note

`better-sqlite3` is a native Node module. On some shared hosting providers, native compilation may fail unless the build toolchain is installed. If deployment to cPanel fails during `npm install`, ensure the host provides the required compiler toolchain or compile the dependency in a compatible environment.

## Developer notes

- To inspect the SQLite database directly:

```bash
sqlite3 server/data/silverbosnia.db
```

- Vite writes the frontend to `client/dist`
- Express serves `client/dist` in production mode
- Runtime logs print to stdout; capture them through pm2/systemd or the host platform logging stack
- No formal automated test suite is bundled; consider adding integration tests for API validation, auth flows, and mail logic

## Contributing

Open an issue or pull request for new features, fixes, or operational issues. Include:

- concise summary of the problem or enhancement
- reproduction steps or deployment context
- expected behavior
- actual behavior
- validation or test steps

## Contact

- Phone: +254 700 367 978
- Email: info@silverandbosnia.co.ke

---

This README intentionally focuses on implementation details, deployment constraints, runtime configuration, and developer operations rather than marketing or product copy.
