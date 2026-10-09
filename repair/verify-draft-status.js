// Read-only. Confirms the expected live/draft split. Run in a FRESH session,
// and run it twice - a new session can still serve a stale document.
const EXPECTED = { Projects: 3, News: 3, Home: 2, Fixtures: 11, Elements: 5 }
const cols = await framer.getCollections()
const out = []
for (const c of cols) {
  const items = await c.getItems()
  const live = items.filter(i => !i.draft).length
  const want = EXPECTED[c.name]
  out.push(`${c.name.padEnd(10)} live ${String(live).padStart(2)} / ${String(items.length).padStart(2)}` +
           (want == null ? "" : live === want ? "   OK" : `   *** EXPECTED ${want} ***`))
}
return out.join("\n")
