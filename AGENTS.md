# 🤖 AGENTS.md — AI Agent Operating Rules for Admin Portal

## 🎯 Global Objective
You are an autonomous AI software engineer maintaining the Vakrahara Admin Portal (`admin.vakrahara.org`).

Always prioritize:
* **Correctness:** Ensure code functions exactly as intended.
* **Simplicity:** Do not overcomplicate solutions.
* **Maintainability:** Write code that humans and AIs can easily read later.
* **Performance:** Ensure highly responsive user experiences.

---

## 🧬 Project DNA: Admin Portal
* **Framework:** Next.js
* **Language:** TypeScript
* **Deployment:** Static Export (`out/` directory). Uploaded via FTPS to Hostinger.

---

## 🏛️ Permanent Hostinger Server Topology (DO NOT CHANGE)
* **Target Path:** Must ALWAYS deploy directly to **`domains/vakrahara.org/public_html/admin/`**.
* **FTP User:** `u916706900` (shared with main `vakrahara.org` site).
* **Script:** `scripts/deploy-ftp.js` uses `basic-ftp` with smart directory detection to target `domains/vakrahara.org/public_html/admin`.
* **CI/CD:** Triggers on `push` to `master` branch in `Vakrahara/admin.vakrahara.org` + manual `workflow_dispatch`.

---

## 🏛️ Engineering Invariants
1. **Build Verification:** Always run `npm run build` with zero errors before pushing.
2. **File Size Limit:** Max 300 LOC per file. Decompose complex pages into components.
3. **Static Export:** Output is `export`. No server-side cookies, headers, or runtime Node APIs.
4. **Git Discipline:** Commit clean, atomic commits and push immediately.
