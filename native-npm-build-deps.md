---
name: native-npm-build-deps
description: npm packages requiring native compilation (node-gyp/Python) fail to install in this environment
---

Packages like `better-sqlite3` that need `node-gyp rebuild` fail during
`npm install` here because there's no Python/C++ build toolchain wired up for
node-gyp by default.

**Why:** `npm install better-sqlite3` fails with `gyp ERR! find Python
Could not find any Python installation to use`.

**How to apply:** When a project needs local persistence and reaches for a
native module, prefer a pure-JS storage approach instead (flat JSON file,
`sql.js` WASM build, or Replit's built-in Postgres via the database skill)
rather than trying to fix the native toolchain. Only chase installing a C++/
Python toolchain if the user specifically needs that exact native package.
