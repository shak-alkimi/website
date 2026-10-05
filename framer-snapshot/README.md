# Framer code-file snapshot

Verbatim copy of **every** code file in the Framer project **"Alkimi (Shak)"**
(`Cf6zWteoRnYaaVh8Afqa`), exactly as Framer held it at the time below. Pulled via
the Framer Agent CLI (`framer.getCodeFiles()`), not by hand.

- **Captured:** 2026-10-05
- **Files:** 14
- **Purpose:** (1) a rollback point before reconciling the repo against Framer,
  (2) portability insurance — this is the only part of a Framer project that
  exports as real source.

**Do not edit anything in this directory.** It is a point-in-time record, not
working code. The maintained copies live at the repo root.

## Why this exists

On 2026-10-05 the mirror was found broken in both directions: 7 files existed
only in Framer, 2 only in the repo, and all 5 files present on both sides had
drifted. The drift traces to commit `7c4e05d` ("Fix audit findings F2-F20 across
all code components", 2026-06-12), which was made in the repo and never ported
into Framer — so the live site has been running the pre-audit code since.

## Refreshing it

```bash
npx @framer/agent@latest session new "Cf6zWteoRnYaaVh8Afqa"   # prints a session id
npx @framer/agent@latest exec -s <id> -e 'const f = await framer.getCodeFiles(); return f.map(x => ({ path: x.path, content: x.content ?? "" }))'
```

Diff the result against the repo root to detect drift. Framer serves `\n` line
endings; the repo is `\r\n`, so normalise before comparing or every file reads
as changed.
