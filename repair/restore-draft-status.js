// Repair: Collection.addItems resets `draft` to false on every item it touches.
// A CMS write on 2026-10-09 passed only { id, fieldData }, which un-drafted
// 7 Projects and 4 News items. This restores them.
//
// The live slugs below come from the PUBLISHED build (/news and /projects-list),
// which is the authoritative record of what was live before the write.
//
// Run:  npx @framer/agent@latest exec -s <sessionId> -f repair/restore-draft-status.js

const LIVE = {
  Projects: ["belmont-park", "resorts-world", "the-leader"],
  News: [
    "how-aesop-has-reshaped-the-industry",
    "our-brand-for-mush-energy-has-just-won-2-silver-awards",
    "the-making-of-an-award-winning-website",
  ],
}

const cols = await framer.getCollections()
const log = []
for (const [name, liveSlugs] of Object.entries(LIVE)) {
  const c = cols.find(x => x.name === name)
  if (!c) { log.push(`${name}: ABORT - collection not found`); continue }
  const items = await c.getItems()
  const missing = liveSlugs.filter(s => !items.some(i => i.slug === s))
  if (missing.length) { log.push(`${name}: ABORT - live slug not found: ${missing.join(", ")}`); continue }
  const toDraft = items.filter(i => !liveSlugs.includes(i.slug))
  await c.addItems(toDraft.map(i => ({ id: i.id, draft: true })))
  log.push(`${name}: draft=true requested for ${toDraft.length} - ${toDraft.map(i => i.slug).join(", ")}`)
}
return log.join("\n")
