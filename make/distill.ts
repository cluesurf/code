/**
 * Does every home base actually earn its permanent address?
 *
 * The home tree was allocated in bulk. 9,563 concepts were handed one of
 * 65,536 addresses wholesale rather than one at a time, and the readme has
 * said so in its status block ever since. This is the check that turns that
 * admission into a number.
 *
 * The witness is Tune's distillation, which judges English words one at a
 * time, by hand, twenty at a sitting, into `base`, `compound` or `name`.
 * Every verdict it has reached is an answer to the question this file asks.
 *
 * ```text
 * seated in tune          it holds a root today. It earns the address
 * judged a base           judged base, waiting on a seat. It earns it
 * JUDGED A COMPOUND       Tune says it is its parts. It belongs in link.csv
 * JUDGED NOT A CONCEPT    a person, a place, a fragment. It belongs nowhere
 * in english.csv          Tune may spend a seat on it, and has not judged it
 * UNKNOWN TO TUNE         not in Tune's vocabulary at all. Unexamined
 * ```
 *
 * **Only the two shouting buckets are defects.** A base judged a compound
 * holds an address for something that IS its parts, which is the one thing
 * the readme says a compound must never do, because then the same concept
 * has two addresses. A base judged not a concept holds an address for
 * something that will never be a meaning: `benjamin`, `troy`, `sir`.
 *
 * **`UNKNOWN TO TUNE` is not a defect and must not be read as one.** It is
 * the measure of how much of the home tree has never been looked at, which
 * is a different and larger fact.
 *
 * Reports by default, and writes only with `--commit`, because a local
 * checkout points at the real data. What it writes is `base/home/distill`,
 * a row per home base with its verdict. It changes no existing file: a base
 * that loses its claim still holds its address until a person moves it, and
 * moving it is a decision about a permanent identity rather than a cleanup.
 *
 *   pnpm distill
 *   pnpm distill --commit
 *   pnpm distill --show JUDGED_A_COMPOUND
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeTable } from '#/code/table'
import { splitCsv } from '#/make/check'

const HERE = new URL('..', import.meta.url).pathname
const HOME = join(HERE, 'base/home')

/**
 * Where Tune's distillation lives.
 *
 * A sibling checkout rather than a dependency, so this reports that it
 * cannot see the witness instead of failing, and says how to get it. A
 * check that cannot evaluate a case must not answer clean.
 */
const TERM = join(HERE, '../tune/case/v24/base/term')

const COMMIT = process.argv.includes('--commit')
const SHOW = (() => {
  const at = process.argv.indexOf('--show')
  return at === -1 ? '' : (process.argv[at + 1] ?? '')
})()

/** Every verdict a home base can get, worst first. */
const VERDICT = [
  'JUDGED A COMPOUND',
  'JUDGED NOT A CONCEPT',
  'UNKNOWN TO TUNE',
  'in english.csv, unjudged',
  'judged a base, no seat yet',
  'seated in tune',
] as const

type Verdict = (typeof VERDICT)[number]

/** The two that mean an address is held by something that cannot keep it. */
const DEFECT: Array<Verdict> = ['JUDGED A COMPOUND', 'JUDGED NOT A CONCEPT']

function readColumn(path: string, at: number): Array<string> {
  const out: Array<string> = []
  for (const line of readFileSync(path, 'utf8').split('\n').slice(1)) {
    if (!line.trim()) continue
    const one = (splitCsv(line)[at] ?? '').trim().toLowerCase()
    if (one) out.push(one)
  }
  return out
}

if (!existsSync(join(TERM, 'form.csv'))) {
  process.stdout.write(
    `DISTILL\n\n` +
      `  Tune's distillation is the witness and it is not here:\n` +
      `    ${TERM}\n\n` +
      `  Nothing was checked. This is not a pass.\n`,
  )
  process.exit(1)
}

/** Every concept Tune has seated at a root today. */
const seated = new Set(readColumn(join(TERM, 'form.csv'), 0))

/** Every concept a Tune seat may ever be spent on. */
const english = new Set(readColumn(join(TERM, 'english.csv'), 0))

/** What the hand distillation decided, per word. */
const judged = new Map<string, { verdict: string; parts: string }>()
for (const line of readFileSync(
  join(TERM, 'exploration/ask-split.csv'),
  'utf8',
)
  .split('\n')
  .slice(1)) {
  if (!line.trim()) continue
  const [leaf, verdict, parts] = splitCsv(line)
  const one = (leaf ?? '').trim().toLowerCase()
  if (one) {
    judged.set(one, {
      verdict: (verdict ?? '').trim().toLowerCase(),
      parts: (parts ?? '').trim(),
    })
  }
}

function verdictOf(name: string): Verdict {
  if (seated.has(name)) return 'seated in tune'

  const said = judged.get(name)
  if (said?.verdict === 'compound') return 'JUDGED A COMPOUND'
  if (said?.verdict === 'name') return 'JUDGED NOT A CONCEPT'
  if (said?.verdict === 'base') return 'judged a base, no seat yet'

  return english.has(name) ? 'in english.csv, unjudged' : 'UNKNOWN TO TUNE'
}

type Row = {
  code: string
  name: string
  domain: string
  frequency: string
  verdict: Verdict
  parts: string
}

const rows: Array<Row> = []
for (const line of readFileSync(join(HOME, 'base.csv'), 'utf8')
  .split('\n')
  .slice(1)) {
  if (!line.trim()) continue
  const [code, name, , , domain, frequency] = splitCsv(line)
  const one = (name ?? '').trim().toLowerCase()
  if (!one) continue

  rows.push({
    code: (code ?? '').trim(),
    name: one,
    domain: (domain ?? '').trim(),
    frequency: (frequency ?? '').trim(),
    verdict: verdictOf(one),
    parts: judged.get(one)?.parts ?? '',
  })
}

const tally = new Map<Verdict, Array<Row>>()
for (const one of rows) {
  const list = tally.get(one.verdict) ?? []
  list.push(one)
  tally.set(one.verdict, list)
}

/**
 * The worst first, and within a verdict the most frequent first.
 *
 * Frequency is the cost: a wrong address on a common word is read far
 * more often than a wrong address on a rare one.
 */
const byLoad = (a: Row, b: Row) =>
  Number(b.frequency || 0) - Number(a.frequency || 0)

const out: Array<string> = [`DISTILL: does every home base earn its address\n\n`]
out.push(`  home bases              ${rows.length}\n`)

const defects = DEFECT.reduce(
  (count, one) => count + (tally.get(one)?.length ?? 0),
  0,
)

out.push(`  addresses to reclaim    ${defects}\n\n`)

for (const verdict of VERDICT) {
  const list = (tally.get(verdict) ?? []).sort(byLoad)
  if (!list.length) continue

  out.push(`${String(list.length).padStart(6)}  ${verdict}\n`)

  const cap = DEFECT.includes(verdict) ? 20 : 8
  for (const one of list.slice(0, cap)) {
    out.push(
      `          ${one.code.padEnd(6)}${one.name.padEnd(18)}` +
        `${(one.parts || one.domain).padEnd(24)}${one.frequency}\n`,
    )
  }
  if (list.length > cap) {
    out.push(`          and ${list.length - cap} more\n`)
  }
  out.push('\n')
}

if (SHOW) {
  const want = SHOW.replace(/_/gu, ' ').toUpperCase()
  const list = rows
    .filter(one => one.verdict.toUpperCase() === want)
    .sort(byLoad)

  out.push(`EVERY ${want}, ${list.length} of them\n`)
  for (const one of list) {
    out.push(
      `  ${one.code.padEnd(6)}${one.name.padEnd(20)}` +
        `${(one.parts || one.domain).padEnd(26)}${one.frequency}\n`,
    )
  }
  out.push('\n')
}

if (COMMIT) {
  writeTable(
    HOME,
    'distill',
    ['code', 'name', 'verdict', 'parts', 'domain', 'frequency'],
    rows
      .sort(
        (a, b) =>
          VERDICT.indexOf(a.verdict) - VERDICT.indexOf(b.verdict) ||
          byLoad(a, b),
      )
      .map(one => [
        one.code,
        one.name,
        one.verdict,
        one.parts,
        one.domain,
        one.frequency,
      ]),
  )
  out.push(`  wrote base/home/distill.csv and .txt\n`)
} else {
  out.push(`  nothing written. Run again with --commit\n`)
}

process.stdout.write(out.join(''))
