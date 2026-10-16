# AGENTS.md — TeleBolt AI Handoff Protocol

**Read this whole file before doing anything in this repository.**

This is the master instruction file for two different audiences, and the two must never be mixed:

- **PART 1 — the Planner AI.** The chat models the maintainer consults on the web
  (ChatGPT, Claude, DeepSeek chat, Gemini…). They read the code dump, find bugs, and
  write prompts. They do **not** ship code.
- **PART 2 — the Executor AI.** The agent running inside OpenCode (DeepSeek V4.1 Flash,
  Nemotron 3 Ultra…). It receives a prompt and executes it literally. It does **not**
  make design decisions.

A planner never writes production code. An executor never redesigns. Keep the roles clean.

> **The code dump.** `telebolt-full.txt` in the repo root is a generated dump of the whole
> codebase (see §4). It exists **only** for the web models in PART 1 to read. The executor
> agent should **never** open it — it is large, and the executor always works from the
> prompt it was given, not from a dump.

---

## Repository facts

- Repo: `https://github.com/HarshCh0uhan/TeleBolt`
- Default branch: `main` — never commit or push to it directly.
- Frontend: `Frontend/` — React 19 + Vite + Tailwind v4, **2-space indent**.
- Backend: `Backend/` — Node + Express + Mongoose, **4-space indent**.
- Shell: Windows, default **Windows PowerShell 5.1** (see §5).
- Tests: Node's built-in `node:test`.
- Deploys: Frontend → Vercel, Backend → Render, DB → MongoDB Atlas.

---

## PART 1 — Rules for the Planner AI
### (ChatGPT, Claude, DeepSeek chat, Gemini — the web models)

Your job: understand the request, ask only the questions that matter, and write **one `.md`
prompt** that an executor agent can run without further thought. You do not write production
code directly — you write the prompt that produces the code.

### 1.1 Read the code dump first
The maintainer will paste or attach `telebolt-full.txt`. Read the real files before proposing
anything. Never guess at a file's contents. If something is not in the dump, ask for it or write
"verify this file exists; if it does not, STOP" into the prompt.

### 1.2 Ask only what changes the shape of the implementation
Ask about things that change the design (state shape, gate vs weight, mobile vs desktop,
URL vs component state). Do **not** ask questions you can answer from the dump. Do **not** ask
permission for obvious steps. The maintainer often replies with short voice-to-text notes —
translate them into a structured spec; do not demand structured input.

### 1.3 One deliverable, one file, one paste
- Every deliverable — prompt, spec, code, summary — is a **single `.md` file**.
- Wrap the whole thing in a code fence **one backtick longer than the deepest fence inside it**
  (normally a four-backtick fence), so nested blocks survive copy-paste intact.
- Never split a deliverable across several replies. Never leave the maintainer to reassemble
  inline code by hand.

### 1.4 Overwrite whole files — never find-and-replace
The executor runs on Windows with CRLF line endings and cannot be trusted to match substrings.
Always give the **entire new file content**, and tell the executor to select all → delete → paste.

### 1.5 Full code, not diffs
"Modify function X to do Y" produces broken code. Give complete files, including imports and
exports. Full-file replacement is the only reliable instruction.

### 1.6 List every file twice
Once at the top of the prompt ("Files you will touch") and once inline next to each phase.
Executors wander when the file list is not directly in front of them.

### 1.7 Every prompt ends with three things
1. **Verification commands** (`node --check`, `node --test`, `npm run lint`, `npm run build`,
   `Select-String`, `git status --short` — see §4 and §5).
2. **A report-back section** telling the executor exactly what to paste.
3. **The stop condition**, verbatim:
   *"If a file does not match what this prompt describes, STOP and report which file and what
   differs. Do not attempt a partial fix."*

### 1.8 Never touch tests to make them pass
`Backend/test/ranking.test.js` and `Backend/test/planSources.test.mjs` are contract tests. If they
fail after a change, the **source** is wrong. State this in every prompt.

### 1.9 Never fabricate — and verify the executor's report
Never invent test results, file existence, or command output. Check the executor's report against
the code dump; do not trust the summary. Cheap commands (`Select-String`, `git status`) catch
fabrication every time. This is not optional — it has already caught a claimed passing test that
did not exist.

### 1.10 Respect the protected pipeline
Never put the files in §6 into a prompt unless the task explicitly names them.

---

## PART 2 — Rules for the Executor AI
### (the agent running in OpenCode: DeepSeek V4.1 Flash, Nemotron 3 Ultra…)

You receive a prompt from the planner. Execute it **literally**. You do not redesign, refactor,
or decide what is best. You do not read `telebolt-full.txt`.

### 2.1 Read the whole prompt before writing any file
Then work phase by phase, top to bottom. Do not skip phases. Do not reorder them.

### 2.2 The stop condition is real
> If a file you are asked to overwrite does not match what the prompt describes, **STOP** and
> report which file and what differs. Do not attempt a partial fix.

Report the mismatch. Never ship a silently broken workaround.

### 2.3 Overwrite whole files
Select all → delete → paste. Never find-and-replace, never substring-edit. Windows CRLF and
whitespace mismatches break partial edits.

### 2.4 Stay inside the file list
Touch only the files the prompt names. Do not tidy up a neighbouring file. Do not reformat a file
you are overwriting — keep the indentation the prompt gives you.

### 2.5 Do not touch the protected pipeline (§6)
Unless the prompt explicitly names one of those files, do not edit, rename, or delete anything in
the plan-sync pipeline. If a change there seems necessary, **stop and report** — do not proceed.

### 2.6 Do not modify tests to make them pass
If the contract tests fail after your change, the change is wrong. Fix the source.

### 2.7 No new `console.log` calls
Use the existing error/response paths.

### 2.8 Run every verification command — and paste raw output
Paste the raw output, not a summary and not the word "passed". If a command fails, paste the
failure. A hidden failure is worse than a visible one.

### 2.9 Never fabricate
Never claim a file exists if you did not see it. Never invent test or command output. Never claim a
step passed if you skipped it. An honest "this step failed" beats a wrong claim.

### 2.10 Report format
- One line per file: `<path> — overwritten as a whole file`.
- Raw output of every verification command.
- The `git status --short` output, so the maintainer sees every file you actually touched.

---

## PART 3 — The copy-paste prompt template

The planner fills this in and hands it to the executor. The sections in `<angle brackets>` change
per task. Everything else stays.

````markdown
# TeleBolt — <one-line task title>

You are the executor agent. Execute this prompt literally. Do not redesign. Overwrite whole
files (select all → delete → paste); never find-and-replace. Do not read `telebolt-full.txt`.

## Context you must not break

Do not touch, rename, or delete any file in the plan-sync pipeline —
`scheduler.service.js`, `email.service.js`, `planSync.service.js`, `planSources/**`,
`planSyncRun.js`, `detectedChange.js`, `planSubmission.js`, or any route handler matching
`*plan-sync*` / `*detected*` / `*submissions*` — unless this prompt explicitly names it.
If a change there seems necessary, STOP and report. Do not proceed.

## Files you will touch

1. `<path>` — overwrite / create
2. `<path>` — overwrite / create
3. `<path>` — overwrite / create

Do not touch any other file. If a file you are asked to overwrite does not match what this
prompt describes, STOP and report which file and what differs. Do not attempt a partial fix.

## Rules

- Overwrite whole files. Select all, delete, paste. Never find-and-replace.
- Do not modify `Backend/test/ranking.test.js` or `Backend/test/planSources.test.mjs` to make
  them pass. If they fail, the fix belongs in the source.
- Do not add `console.log` calls.
- Do not touch any file not listed above.
- Do not fabricate test results, file existence, or command output.

---

## Phase 1 — <what this phase does>

### File: `<path>` (overwrite)

```<lang>
<full new file content>
```

---

## Phase 2 — <what this phase does>

### File: `<path>` (overwrite)

```<lang>
<full new file content>
```

---

## Verification

Run all of these and paste the raw output. Do not summarise.

```powershell
# Backend syntax check (run from Backend/)
node --check src/<file-you-touched>.js

# Backend tests — run each file explicitly (never `npm test`)
node --test test/ranking.test.js
node test/planSources.test.mjs

# Frontend (run from Frontend/)
npm run lint
npm run build

# Spot-confirm the change — use Select-String, NOT grep
Select-String -Path Frontend\src\<file> -Pattern "<pattern>"

# What did you actually change?
git status --short
```

## Report back

Reply with exactly this:

1. `git status --short` output.
2. The full raw output of every verification command above.
3. Any lint warning or error, pasted verbatim.
4. Any file that did not match what this prompt described — name it and stop.
5. One line per file confirming `<path> — overwritten as a whole file`.

**Do not fabricate.** If a command fails, paste the failure. If a file does not exist where
this prompt says it should, say so. A wrong claim is worse than an honest "this step failed".
````

---

## PART 4 — Git workflow (the maintainer's workflow — followed every time)

Every change goes through the same loop. **Never commit or push directly to `main`.**

```
main (up to date)
  └─► <type>/<short-description>       branch
        └─► edits + verification
              └─► commit (Conventional Commits)
                    └─► push -u origin <branch>
                          └─► gh pr create --base main
                                └─► gh pr merge <n> --merge --delete-branch
                                      └─► git checkout main & git pull --ff-only
                                            └─► npx repomix … (refresh the code dump)
```

### Exact commands

```powershell
# 0. Start from an up-to-date main
git checkout main
git pull --ff-only origin main

# 1. Branch off main
git checkout -b feat/short-description

# 2. Make the change, then run the checks in §5.

# 3. Stage and commit
git add <only-the-files-the-task-listed>
git commit -m "feat: short imperative summary"

# 4. Push the branch
git push -u origin feat/short-description

# 5. Open the pull request
gh pr create --base main --head feat/short-description --title "feat: short imperative summary" --body "What changed and why. Verification output pasted below."

# 6. Merge with a merge commit and delete the branch
gh pr merge <number> --merge --delete-branch

# 7. Sync local main
git checkout main
git pull --ff-only origin main

# 8. Refresh the code dump for the web models (see below)
```

### Step 8 — refresh `telebolt-full.txt` after every merge

`telebolt-full.txt` is a generated dump of the codebase that the web models read. It is
**gitignored** (see `.gitignore`), so it is never committed — but it must be regenerated after
every merge to `main` so the web models always see the current code. `repomix` overwrites the old
file in place, so the old dump is replaced by the new one every run.

Run this from the repo root after merging (works in Git Bash; in PowerShell the quotes keep the
patterns literal, which is what repomix wants):

```bash
npx repomix --include "**/*.{js,jsx,ts,tsx,css,html,json}" --ignore "**/node_modules/**,**/dist/**,**/build/**,**/.git/**" --output telebolt-full.txt
```

### Branch naming

`<type>/<short-description>` — lowercase words joined by hyphens.

| Prefix | Use for |
|---|---|
| `feat/` | a new user-facing feature or capability |
| `fix/` | a bug fix |
| `chore/` | refactor, cleanup, tooling, docs, dependency bumps |

Real examples from this repo: `feat/public-search-reviews-podium-share`,
`chore/cleanup-mobile-podium`, `fix/remove-401-redirect`.

### Commit messages (Conventional Commits)

```
<type>: <short imperative summary>
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`. Lowercase after the colon, no
trailing period, subject ≤ ~72 characters. Put the "why" in the body when it is not obvious.

### Merge rules

- **Always a merge commit** (`gh pr merge --merge`). Never `--squash`, never `--rebase`. `git log`
  on `main` must show `Merge pull request #N from …`.
- **Always delete the branch** after merge (`--delete-branch`).
- **Always fast-forward local `main`** before starting the next task.
- **One batched task per branch.** The maintainer often sends one large prompt covering several
  related changes — that belongs in a single PR. Unrelated work does not.

---

## PART 5 — Verification (run before every commit)

Frontend (from `Frontend/`):

```
npm run lint
npm run build
```

Backend (from `Backend/`):

```
node --check src/<file-you-touched>.js
node --test test/ranking.test.js
node test/planSources.test.mjs
```

> **Do not run `npm test` or `node --test test/`.** On Node v24 for Windows, resolving the `test/`
> directory throws `Error: Cannot find module '...\Backend\test'`. Run each test file by name.

Pre-existing lint warnings that are **not yours to fix** — do not "clean them up" mid-task:

- `Frontend/src/components/ErrorBoundary.jsx` — unused `useState` / `useEffect`.
- `Frontend/src/components/PlanDetails.jsx` — one `react-hooks` warning about a missing dependency.

Keep `README.md` in sync as part of every merge that changes features, endpoints, environment
variables, or commands.

---

## PART 6 — Protected pipeline (do not touch unless a task names it)

- `Backend/src/services/scheduler.service.js`
- `Backend/src/services/email.service.js`
- `Backend/src/services/planSync.service.js`
- `Backend/src/services/planSources/**`
- `Backend/src/models/planSyncRun.js`
- `Backend/src/models/detectedChange.js`
- `Backend/src/models/planSubmission.js`
- Any route or handler matching `*plan-sync*`, `*detected*`, `*submissions*`

The alert / notification / cron / email work is deliberately parked for a later task. If a change
here seems necessary, **stop and ask** — never remove or edit it by accident.

---

## PART 7 — Shell notes (Windows / PowerShell)

- `grep` and `sed` are **not available**.
  - Search a file: `Select-String -Path <file> -Pattern <regex>`
  - Recurse: `Get-ChildItem -Recurse -File | Select-String -Pattern <regex>`
- `&&` works on PowerShell 7+, but **fails on PowerShell 5.1** (the Windows default). Put commands
  on separate lines, or join them with `;`.
- Prefer a file read/write tool over shell redirection when editing files.

---

## PART 8 — Pre-flight checklist (every task)

- [ ] `git checkout main` then `git pull --ff-only origin main`
- [ ] Working tree clean (`git status --short` prints nothing)
- [ ] Branch named `<type>/<short-description>`
- [ ] Only the files the task listed were touched
- [ ] No new `console.log`
- [ ] No test files edited to force a pass
- [ ] Protected pipeline (§6) untouched
- [ ] Frontend: `npm run lint` + `npm run build` pass
- [ ] Backend: `node --check` on every touched file + both test files pass
- [ ] `README.md` updated if features / endpoints / env vars / commands changed
- [ ] Commit uses Conventional Commits
- [ ] `gh pr create --base main`
- [ ] `gh pr merge <n> --merge --delete-branch`
- [ ] `git checkout main` + `git pull --ff-only origin main`; branch gone; tree clean
- [ ] `npx repomix …` re-run so `telebolt-full.txt` matches the new `main`
