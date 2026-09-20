/**
 * Every derived concept, from every base.
 *
 *   MORPHY=<eng.derivational.v1.tsv> WORDNET=<english-wordnet.xml.gz> pnpm derive
 *
 * Writes `base/word/derive.csv` and its mirror, `base/word/derive.json`
 * grouped by base, and `base/word/affix.csv`, which is the operator table
 * from `code/affix.ts` rendered so it can be read without TypeScript.
 *
 * WHAT A ROW IS. One English word, the base it is built from, and the ONE
 * step that built it from the word before it.
 *
 *   creationism   from creation   head school   kind   depth 2   tier 3
 *   creation      from create     head result   kind   depth 1   tier 3
 *
 * So the tree is in the `from` column and the file is flat. A chain of
 * four is four rows, each naming its own parent, which is the same shape
 * `concept_join` holds in the database.
 *
 * WHAT IT DOES NOT DO.
 *
 * It never mints a form. Every row is a word somebody writes: tier 3 is in
 * a curated English lexicon, tier 2 is attested in a large dictionary and
 * nothing below that is emitted at all. Productivity is not evidence.
 *
 * It never settles an ambiguous kind. `-ion` is six kinds and the word
 * does not say which, so `head` carries the candidates and `settled` is
 * blank until a person fills it in.
 *
 * It never edits the base list. A derived form that is ALSO a base is
 * reported to `fold.csv` by `make/word.ts` and left alone, because that
 * test is about half right and a wrong base word is permanent.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createReadStream } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { join } from 'node:path'
import sax from 'sax'
import { writeTable } from '#/code/table'
import { AFFIX, readAffix } from '#/code/affix'

const HERE = new URL('..', import.meta.url).pathname
const WORD = join(HERE, 'base/word')

/** How many steps from a base a form may be and still be recorded. */
const DEPTH = Number(process.env.DEPTH ?? 4)

/**
 * The four categories a chain can be in, which is all the signature test
 * needs. MorphyNet writes the part of speech as one letter.
 */
const CATEGORY: Record<string, string> = {
  N: 'thing',
  V: 'action',
  J: 'feature',
  R: 'manner',
}

const ROLE_CATEGORY: Record<string, string> = {
  noun: 'thing',
  verb: 'action',
  adjective: 'feature',
  adverb: 'manner',
}

type Step = {
  from: string
  to: string
  fromRole: string
  toRole: string
  affix: string
  side: string
}

/**
 * One row is one JOIN, written head final, which is the same shape
 * `concept_join` holds.
 *
 *   creation     mark create   head result    a suffix, so the operator heads
 *   nontree      mark not      head tree      a prefix, so the operator marks
 *
 * A SUFFIX PUTS THE OPERATOR ON THE RIGHT and a prefix puts it on the
 * left. Getting that backwards makes `nontree` a kind of `not`, which is
 * not a thing, and it is the sort of error that reads fine in a table and
 * is wrong in every query afterwards.
 */
type Row = {
  base: string
  code: string
  english: string
  from: string
  affix: string
  join: string
  mark: string
  head: string
  settled: string
  depth: number
  tier: number
  type: string
  variant: string
}

function readCsv(path: string): Array<Record<string, string>> {
  const lines = readFileSync(path, 'utf8').split('\n').filter(line => line.length)
  const head = splitCsv(lines[0])
  return lines.slice(1).map(line => {
    const bit = splitCsv(line)
    const row: Record<string, string> = {}
    head.forEach((name, n) => (row[name] = bit[n] ?? ''))
    return row
  })
}

function splitCsv(line: string): Array<string> {
  const out: Array<string> = []
  let at = ''
  let inside = false
  for (let n = 0; n < line.length; n++) {
    const letter = line[n]
    if (letter === '"') {
      if (inside && line[n + 1] === '"') {
        at += '"'
        n++
      } else inside = !inside
    } else if (letter === ',' && !inside) {
      out.push(at)
      at = ''
    } else at += letter
  }
  out.push(at)
  return out
}

async function readLemma(file: string): Promise<Set<string>> {
  const out = new Set<string>()
  await new Promise<void>((done, fail) => {
    const parser = sax.createStream(true, { trim: true })
    parser.on('opentag', node => {
      if (node.name !== 'Lemma') return
      const at = node.attributes as Record<string, string>
      if (at.writtenForm) out.add(at.writtenForm.toLowerCase())
    })
    parser.on('error', fail)
    parser.on('end', () => done())
    createReadStream(file).pipe(createGunzip()).pipe(parser)
  })
  return out
}

/**
 * The British spelling of a word that also exists in American, and the
 * other way round. One concept, two spellings, so the second is marked a
 * variant of the first rather than counted as a second derivation.
 */
function otherSpelling(word: string): string | undefined {
  if (word.endsWith('ise')) return word.slice(0, -3) + 'ize'
  if (word.endsWith('ised')) return word.slice(0, -4) + 'ized'
  if (word.endsWith('ising')) return word.slice(0, -5) + 'izing'
  if (word.endsWith('isation')) return word.slice(0, -7) + 'ization'
  if (word.includes('our')) return word.replace('our', 'or')
  if (word.endsWith('ae')) return word.slice(0, -2) + 'a'
  return undefined
}

async function main() {
  const base = readCsv(join(WORD, 'base.csv'))
  const kinds = readCsv(join(WORD, 'kind.csv'))

  const codeOf = new Map<string, string>()
  const groupOf = new Map<string, string>()
  const roleOf = new Map<string, string>()
  for (const row of base) {
    codeOf.set(row.name, row.code)
    groupOf.set(row.name, row.group)
    roleOf.set(row.name, row.role)
  }

  const kindMakes = new Map<string, string>()
  const kindApplies = new Map<string, Array<string>>()
  for (const row of kinds) {
    kindMakes.set(row.kind, row.makes)
    kindApplies.set(row.kind, row.applies.split(' ').filter(Boolean))
  }

  // Every operator named in the affix table must exist, or a typo becomes
  // a silent unclassified pile rather than a build failure.
  const missing = new Set<string>()
  for (const one of AFFIX) {
    for (const take of one.take) {
      if (one.join === 'kind' && !kindMakes.has(take)) missing.add(`kind ${take}`)
      if (one.join === 'compound' && !codeOf.has(take)) missing.add(`base ${take}`)
    }
  }
  if (missing.size) {
    console.log('the affix table names operators that do not exist:')
    for (const one of [...missing].sort()) console.log(`  ${one}`)
    throw new Error(`${missing.size} unknown operators in code/affix.ts`)
  }

  const morphy = process.env.MORPHY ?? join(HERE, 'data/eng.derivational.tsv')
  if (!existsSync(morphy)) {
    throw new Error(`no derivation table at ${morphy}. Set MORPHY.`)
  }
  const steps: Array<Step> = []
  for (const line of readFileSync(morphy, 'utf8').split('\n')) {
    if (!line) continue
    const [from, to, fromRole, toRole, affix, side] = line.split('\t')
    if (!to || !side || from === to) continue
    steps.push({ from, to, fromRole, toRole, affix, side })
  }
  const out = new Map<string, Array<Step>>()
  for (const step of steps) {
    const at = out.get(step.from)
    if (at) at.push(step)
    else out.set(step.from, [step])
  }

  const wordnet = process.env.WORDNET ?? join(HERE, 'data/english-wordnet.xml.gz')
  if (!existsSync(wordnet)) {
    throw new Error(`no WordNet at ${wordnet}. Set WORDNET.`)
  }
  const lemma = await readLemma(wordnet)

  const attested = new Set<string>()
  for (const step of steps) attested.add(step.to)

  const rows: Array<Row> = []
  const tally = {
    unknownAffix: new Map<string, number>(),
    illBy: new Map<string, number>(),
    multiword: 0,
    isBase: 0,
    ill: 0,
    ok: 0,
    untyped: 0,
    variant: 0,
  }

  for (const row of base) {
    if (row.group !== 'concept' && row.group !== 'kind') continue
    const root = row.name
    if (!out.has(root)) continue

    const seen = new Map<string, { depth: number; category: string }>()
    const startCategory = ROLE_CATEGORY[row.role] ?? ''
    let edge = [{ word: root, depth: 0, category: startCategory }]

    while (edge.length) {
      const next: typeof edge = []
      for (const at of edge) {
        for (const step of out.get(at.word) ?? []) {
          const word = step.to
          if (word === root || seen.has(word)) continue

          // Attestation. Nothing below tier 2 is emitted at all.
          const tier = lemma.has(word) ? 3 : attested.has(word) ? 2 : 0
          if (!tier) continue

          if (/[^a-z-]/.test(word)) {
            tally.multiword++
            continue
          }

          const form = step.side === 'prefix' ? `${step.affix}-` : `-${step.affix}`
          const hit = readAffix(form, step.fromRole, step.toRole)
          if (!hit) {
            // An affix the table does not hold. If the bare string is a
            // base word it is a compound and the base list already
            // decides that, so it is not a gap. Otherwise it is one.
            const bare = form.replace(/-/g, '')
            if (codeOf.has(bare)) {
              const front = step.side === 'prefix'
              seen.set(word, { depth: at.depth + 1, category: CATEGORY[step.toRole] ?? '' })
              rows.push({
                base: root,
                code: row.code,
                english: word,
                from: at.word,
                affix: form,
                join: 'compound',
                mark: front ? bare : at.word,
                head: front ? at.word : bare,
                settled: bare,
                depth: at.depth + 1,
                tier,
                type: 'ok',
                variant: '',
              })
              if (at.depth + 1 < DEPTH) {
                next.push({ word, depth: at.depth + 1, category: CATEGORY[step.toRole] ?? '' })
              }
            } else {
              tally.unknownAffix.set(form, (tally.unknownAffix.get(form) ?? 0) + 1)
            }
            continue
          }

          // The signature test. A kind states what it applies to, and a
          // form that is attested and ill typed is evidence about the
          // `applies` column rather than about the word.
          let type = 'untyped'
          if (hit.join === 'kind' && at.category) {
            const fits = hit.take.some(take =>
              (kindApplies.get(take) ?? []).includes(at.category),
            )
            type = fits ? 'ok' : 'ill'
          } else if (hit.join === 'compound') {
            type = 'ok'
          }
          if (type === 'ok') tally.ok++
          else if (type === 'ill') {
            tally.ill++
            // WHICH KIND, AND FROM WHAT. An attested form that is ill
            // typed is evidence about the kind's `applies` column, so the
            // count is grouped by kind and by what it was applied to.
            const key = `${hit.take.join('|')} <- ${at.category}`
            tally.illBy.set(key, (tally.illBy.get(key) ?? 0) + 1)
          } else tally.untyped++

          const after =
            hit.join === 'kind' && hit.take.length === 1
              ? (kindMakes.get(hit.take[0]) ?? CATEGORY[step.toRole] ?? '')
              : (CATEGORY[step.toRole] ?? '')

          const other = otherSpelling(word)
          const variant = other && other !== word && attested.has(other) ? other : ''
          if (variant) tally.variant++

          if (codeOf.has(word)) tally.isBase++

          const front = step.side === 'prefix'
          const operator = hit.take.join(' ')
          rows.push({
            base: root,
            code: row.code,
            english: word,
            from: at.word,
            affix: form,
            join: hit.join,
            mark: front ? operator : at.word,
            head: front ? at.word : operator,
            settled: hit.take.length === 1 ? hit.take[0] : '',
            depth: at.depth + 1,
            tier,
            type,
            variant,
          })
          seen.set(word, { depth: at.depth + 1, category: after })
          if (at.depth + 1 < DEPTH) {
            next.push({ word, depth: at.depth + 1, category: after })
          }
        }
      }
      edge = next
    }
  }

  rows.sort((a, b) =>
    a.base !== b.base
      ? a.base < b.base
        ? -1
        : 1
      : a.depth - b.depth || (a.english < b.english ? -1 : 1),
  )

  writeTable(
    WORD,
    'derive',
    ['base', 'code', 'english', 'from', 'affix', 'join', 'mark', 'head', 'settled', 'depth', 'tier', 'type', 'variant'],
    rows.map(r => [
      r.base, r.code, r.english, r.from, r.affix, r.join, r.mark, r.head, r.settled,
      String(r.depth), String(r.tier), r.type, r.variant,
    ]),
  )

  const tree = new Map<string, Array<Row>>()
  for (const row of rows) {
    const at = tree.get(row.base)
    if (at) at.push(row)
    else tree.set(row.base, [row])
  }
  /**
   * The same rows, grouped by base, which is the shape a consumer wants
   * and the CSV cannot hold.
   *
   * ONE BASE PER LINE, and no indentation. Pretty-printing this file cost
   * 24MB against 7MB, for a file nobody reads by eye, and a line per base
   * still diffs cleanly when one base changes.
   */
  const lines = [...tree.entries()].map(([name, every]) =>
    JSON.stringify({
      base: name,
      code: codeOf.get(name) ?? '',
      derive: every.map(r => ({
        english: r.english,
        from: r.from,
        affix: r.affix,
        join: r.join,
        mark: r.mark.split(' '),
        head: r.head.split(' '),
        settled: r.settled || null,
        depth: r.depth,
        tier: r.tier,
        type: r.type,
        variant: r.variant || null,
      })),
    }),
  )
  writeFileSync(join(WORD, 'derive.json'), `[\n${lines.join(',\n')}\n]\n`, 'utf8')

  writeTable(
    WORD,
    'affix',
    ['form', 'join', 'head', 'role', 'show'],
    AFFIX.map(one => [
      one.form,
      one.join,
      one.take.join(' '),
      one.role?.join(' ') ?? '',
      one.show,
    ]),
  )

  // ---- the report ----------------------------------------------------
  const bases = tree.size
  console.log(`\nderived     ${rows.length} concepts from ${bases} bases`)
  console.log(`mean        ${(rows.length / bases).toFixed(2)} per base that has any`)
  const byTier = new Map<number, number>()
  for (const row of rows) byTier.set(row.tier, (byTier.get(row.tier) ?? 0) + 1)
  console.log(`\nby witness`)
  console.log(`  tier 3  in a curated lexicon      ${byTier.get(3) ?? 0}`)
  console.log(`  tier 2  attested, rare or formal  ${byTier.get(2) ?? 0}`)
  const byJoin = new Map<string, number>()
  for (const row of rows) byJoin.set(row.join, (byJoin.get(row.join) ?? 0) + 1)
  console.log(`\nby join`)
  for (const [name, n] of [...byJoin.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name.padEnd(10)} ${n}`)
  }
  console.log(`\nby depth`)
  const byDepth = new Map<number, number>()
  for (const row of rows) byDepth.set(row.depth, (byDepth.get(row.depth) ?? 0) + 1)
  for (const [n, count] of [...byDepth.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${n}  ${count}`)
  }
  console.log(`\nsettled     ${rows.filter(r => r.settled).length}`)
  console.log(`unsettled   ${rows.filter(r => !r.settled).length}, where English names a set and not a value`)
  console.log(`\nsignature`)
  console.log(`  ok        ${tally.ok}`)
  console.log(`  ill typed ${tally.ill}, which is ${((tally.ill / (tally.ill + tally.ok)) * 100).toFixed(1)}% and is evidence about the kind, not the word`)
  console.log(`  untyped   ${tally.untyped}, where the base has no role to start from`)
  console.log(`\nthe twelve commonest ill-typed pairs. EACH IS A QUESTION ABOUT THE KIND:`)
  for (const [key, n] of [...tally.illBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`  ${String(n).padStart(5)}  ${key}`)
  }
  console.log(`\nspelling variants  ${tally.variant}`)
  console.log(`already a base     ${tally.isBase}, reported to fold.csv and left alone`)
  console.log(`multiword skipped  ${tally.multiword}`)
  const unknown = [...tally.unknownAffix.entries()].sort((a, b) => b[1] - a[1])
  const total = unknown.reduce((a, b) => a + b[1], 0)
  console.log(`\naffixes the table does not hold  ${unknown.length}, covering ${total} edges`)
  console.log(`  ${unknown.slice(0, 30).map(([k, v]) => `${k} ${v}`).join('  ')}`)
}

await main()
