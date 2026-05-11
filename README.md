# Persent

> Bulk personalized email outreach, built into your browser.

Persent is a Chrome extension that lets you run cold email campaigns at scale without leaving your browser. Connect your email account, build your contact list, and send personalized campaigns — all from the extension popup.

---

## Features

- **Account connection** — Link your email account and manage it directly from the extension
- **Campaign management** — Create, organize, and track outreach campaigns
- **Bulk personalized sending** — Send tailored emails to your contact list at scale
- **Async email dispatch** — Sending is handled via job queues so the UI never blocks
- **Auth that persists** — Refresh token rotation keeps sessions alive across browser restarts
- **Fast list navigation** — Cursor-based pagination across all list views for consistent performance

---

## Tech Stack

| Layer | Tech |
|---|---|
| Extension UI | React + TypeScript |
| Build tool | Vite |
| Auth | JWT with refresh token rotation |
| Background jobs | Bull / job queue |
| API | Node.js / Express (separate repo) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser

### Installation

```bash
git clone https://github.com/OgheneDev/persent-extension.git
cd persent
npm install
```

### Development

```bash
npm run dev
```

Vite will build the extension into a `dist/` folder and watch for changes.

### Loading in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### Production Build

```bash
npm run build
```

---

## Backend

The API and job queue logic live in a separate repository: [persent-api](https://github.com/OgheneDev/persent-backend)

---

## Status

Currently in development. Chrome Web Store listing coming soon.

---

## Author

**Emmanuel Oghene** — [Portfolio](https://emmanuel-oghene.vercel.app) · [LinkedIn](https://linkedin.com/in/emmanuel-oghene-0242182ab)
