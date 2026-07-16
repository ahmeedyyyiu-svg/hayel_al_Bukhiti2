---
name: Capacitor offline app architecture
description: Why a web app must move its backend logic into the browser before packaging with Capacitor for an offline mobile app.
---

When a project needs to become an offline-capable Capacitor Android/iOS app,
any Node/Express (or other server) backend must be treated as dev-preview-only.
Capacitor bundles a `webDir` of static assets into the app's webview; it does
not run a Node server on the device. If contacts/data/CRUD logic lives behind
server API routes with server-side file/DB storage, the packaged app will not
work offline (or at all, since there's no server to call).

**Why:** discovered while converting a Replit-hosted Express + JSON-file-store
app to Capacitor — the fetch-based frontend and server API had to be replaced
with `localStorage`-backed client-side logic so the identical `public/`
folder works both in the Replit preview (server just serves static files) and
inside the packaged native app (no server at all).

**How to apply:** before proposing Capacitor packaging, check whether app
state/logic is server-side. If so, move it client-side (localStorage/IndexedDB,
client-side parsing, etc.) first, and keep any existing server only as a static
file server for local/preview testing. Native device capabilities (e.g. SMS
sending) require an actual Capacitor plugin — these cannot be built or tested
inside Replit (no Android SDK/emulator/SIM); document the external
Android Studio steps separately.
