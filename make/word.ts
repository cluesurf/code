/**
 * Allocate the 4,096.
 *
 *   pnpm word
 *   WORDNET=<english-wordnet-2024.xml.gz> pnpm word
 *
 * Writes `base/word/base.csv` and its aligned mirror, plus
 * `base/word/fold.csv`, which is the hand-review queue and is not applied.
 *
 * THE SHAPE OF THE SPACE. Block `m`, the first 256, is the structure:
 * the ontology, the sixteen categories, the sixteen digits and the 132
 * kinds. The other fifteen blocks are ordinary concepts, packed by domain
 * so related words sit adjacent for free.
 *
 * WHAT IS NOT DONE HERE. Nothing is folded, cut or merged. `fold.csv`
 * reports the words that LOOK derived from another word in the list, with
 * a blank verdict column, because that test is about 50% right and a wrong
 * base word is permanent. See `note/library/code/standard-form.md`, test 4.
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createReadStream } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { join } from 'node:path'
import sax from 'sax'
import { writeTable } from '#/code/table'
import {
  BLOCK_SIZE,
  STRUCTURE,
  STRUCTURE_BLOCK,
  WORD_SPACE,
  blockStart,
  makeWord,
  readWordBlock,
} from '#/code/word'
import { CODE } from '#/code/base'

const HERE = new URL('..', import.meta.url).pathname
const WORD = join(HERE, 'base/word')

export type Word = {
  code: string
  name: string
  /** vibe | category | digit | kind | concept */
  group: string
  /** The shelf its neighbours share: a kind group, or a WordNet domain. */
  domain: string
  role: string
  note: string
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

/** Enough CSV to read our own files, which quote only where they must. */
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

/**
 * The sixteen categories, named systematically from their own four bits.
 *
 * Four are settled in `note/category.md` and carry ordinary names. The
 * other twelve are named by what they ARE rather than given an invented
 * word, because an invented word is a decision and this file should not be
 * making it. Renaming one later costs nothing: they are reserved, not used.
 */
function everyCategory(): Array<{ name: string; note: string }> {
  const base = ['object', 'feature', 'action', 'manner']
  const out: Array<{ name: string; note: string }> = []
  for (let n = 0; n < 16; n++) {
    const isAction = (n & 8) !== 0
    const isDependent = (n & 4) !== 0
    const isParticular = (n & 2) !== 0
    const isCollection = (n & 1) !== 0
    const stem = base[(isAction ? 2 : 0) + (isDependent ? 1 : 0)]
    const tail = [isParticular ? 'particular' : '', isCollection ? 'collection' : '']
      .filter(Boolean)
      .join('_')
    out.push({
      name: tail ? `${stem}_${tail}` : stem,
      note: [
        isAction ? 'action' : 'object',
        isDependent ? 'dependent' : 'independent',
        isParticular ? 'particular' : 'universal',
        isCollection ? 'collection' : 'individual',
      ].join(' · '),
    })
  }
  return out
}

/**
 * The sixteen digits.
 *
 * Base sixteen, because the notation is base sixteen. These are ordinary
 * concepts and they are not reserved out of some other budget: `two` the
 * digit and `two` the word are one concept, so the English base list has
 * its copies removed rather than a second address minted.
 */
const DIGIT = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
]

/**
 * WordNet's lexfile names, tidied.
 *
 * Stripping the part of speech off `adj.all` leaves `all`, which names
 * nothing and was the largest domain in the first run. The three that need
 * a real name get one and the rest lose only their prefix.
 */
/**
 * Words the English base list lacks that the model needs, with the reason.
 *
 * Kept as a named list rather than edited into `english.csv`, because that
 * file is a snapshot of Tune's own decisions and an addition made here
 * should stay visibly ours until it is taken up there.
 *
 * ONE ENTRY, and finding it is what the affix table's gate is for. 34
 * operators were proposed for what English writes as prefixes and 32 turned
 * out to be a base word or one of the 132 kinds already. `meta` is the one
 * that is neither, and `make/derive.ts` refuses to build without it rather
 * than filing every `meta-` word as unclassified.
 */
const ADD: Array<{ name: string; role: string; domain: string; why: string }> = [
  {
    name: 'meta',
    role: 'adjective',
    domain: 'cognition',
    why: 'about a thing rather than of it. The only prefix English writes that no base word and no kind already carries',
  },
]

const DOMAIN_NAME: Record<string, string> = {
  'adj.all': 'quality',
  'adj.pert': 'relating',
  'adj.ppl': 'participle',
  'adv.all': 'manner',
  'noun.Tops': 'top',
}

/** WordNet's own 45-way hand classification, which is the domain system. */
async function readDomain(
  file: string,
): Promise<Map<string, { domain: string; role: string }>> {
  const out = new Map<string, { domain: string; role: string }>()
  const lexfile = new Map<string, string>()
  const pending: Array<{ word: string; synset: string; role: string; proper: boolean }> = []

  await new Promise<void>((done, fail) => {
    const parser = sax.createStream(true, { trim: true })
    let word = ''
    let role = ''
    let proper = false
    parser.on('opentag', node => {
      const at = node.attributes as Record<string, string>
      if (node.name === 'Lemma') {
        const written = at.writtenForm ?? ''
        word = written.toLowerCase()
        // A CAPITALISED LEMMA IS A PROPER NAME AND IT SORTS FIRST.
        // Entries are ordered by id, so `Tree` the surname arrives before
        // `tree` the plant, and reading the first sense filed `tree` under
        // the `person` domain. Capitalisation is the only signal in the
        // file that separates them, and it is a reliable one.
        proper = written.length > 0 && written[0] !== word[0]
        role = at.partOfSpeech ?? ''
      } else if (node.name === 'Sense' && word) {
        pending.push({ word, synset: at.synset ?? '', role, proper })
      } else if (node.name === 'Synset') {
        lexfile.set(at.id ?? '', at.lexfile ?? '')
      }
    })
    parser.on('error', fail)
    parser.on('end', () => done())
    createReadStream(file).pipe(createGunzip()).pipe(parser)
  })

  // Two passes, so a common-noun sense always beats a proper-name one and
  // a proper name is still better than nothing.
  for (const proper of [false, true]) {
    for (const one of pending) {
      if (one.proper !== proper || out.has(one.word)) continue
      const file = lexfile.get(one.synset)
      if (!file) continue
      const domain = DOMAIN_NAME[file] ?? file.replace(/^(noun|verb|adj|adv)\./, '')
      out.set(one.word, { domain, role: one.role })
    }
  }
  return out
}

async function main() {
  mkdirSync(WORD, { recursive: true })

  // ---- the structure block ------------------------------------------
  const kinds = readCsv(join(WORD, 'kind.csv'))
  const vibes = readCsv(join(HERE, 'base/base.csv')).filter(r => r.layer === 'vibe')
  const categories = everyCategory()

  const held = new Map<string, Word>()
  const claimed = new Map<string, Word>()
  const share: Array<string> = []
  const twice: Array<string> = []
  let trouble = 0

  /**
   * Seat a word, and say whether a seat was spent.
   *
   * A NAME THAT IS ALREADY SEATED SHARES THE CODE rather than getting a
   * second one. `manner` is a category and one of the 132 kinds and it is
   * ONE concept, so two addresses for it would mean every consumer had to
   * know both. This is the same exception the four-letter files already
   * make for `experience`, `tone` and `link`.
   */
  function place(at: number, word: Omit<Word, 'code'>): boolean {
    const code = makeWord(at)
    if (held.has(code)) {
      console.log(`  CLASH ${code} ${held.get(code)!.name} / ${word.name}`)
      trouble++
      return false
    }
    const already = claimed.get(word.name)
    if (already) {
      const line = `${word.name} (${word.group}) shares ${already.code} with the ${already.group}`
      if (already.group === word.group) twice.push(`${word.name} in ${word.group}`)
      else share.push(line)
      return false
    }
    const seated = { code, ...word }
    held.set(code, seated)
    claimed.set(word.name, seated)
    return true
  }

  const room = new Map(STRUCTURE.map(one => [one.group, one]))
  function shelfStart(group: string): number {
    const one = room.get(group)
    if (!one) throw new Error(`no shelf for ${group}`)
    const [block, shelf] = one.shelf
    return CODE.indexOf(block) * BLOCK_SIZE + CODE.indexOf(shelf) * 16
  }

  vibes.forEach((row, n) => {
    place(shelfStart('vibe') + n, {
      name: row.name,
      group: 'vibe',
      domain: 'ontology',
      role: '',
      note: row.note,
    })
  })

  categories.forEach((one, n) => {
    place(shelfStart('category') + n, {
      name: one.name,
      group: 'category',
      domain: 'category',
      role: '',
      note: one.note,
    })
  })

  DIGIT.forEach((name, n) => {
    place(shelfStart('digit') + n, {
      name,
      group: 'digit',
      domain: 'number',
      role: 'value',
      note: `the digit ${n}`,
    })
  })

  // Kinds are packed in `kind.csv` order, which is grouped already, so a
  // group's members land adjacent without anything sorting them.
  const kindAt = shelfStart('kind')
  kinds.forEach((row, n) => {
    place(kindAt + n, {
      name: row.kind,
      group: 'kind',
      domain: row.group,
      role: '',
      note: `${row.gloss}. makes a ${row.makes} out of ${row.applies === 'thing action' ? 'a thing or an action' : 'a ' + row.applies}`,
    })
  })

  // ---- the concepts -------------------------------------------------
  const structureNames = new Set(claimed.keys())
  const english = readCsv(join(WORD, 'english.csv'))
  const home = readCsv(join(HERE, 'base/home/base.csv'))
  const homeDomain = new Map<string, string>()
  for (const row of home) if (!homeDomain.has(row.name)) homeDomain.set(row.name, row.domain)

  const wordnet = process.env.WORDNET ?? join(HERE, 'data/english-wordnet.xml.gz')
  const netDomain = existsSync(wordnet) ? await readDomain(wordnet) : new Map()
  if (!netDomain.size) {
    console.log(`no WordNet at ${wordnet}, falling back to the home domains`)
  }

  type Seat = { name: string; role: string; domain: string; uses: number; head: number }
  const seats: Array<Seat> = []
  let already = 0
  for (const row of english) {
    if (structureNames.has(row.english)) {
      already++
      continue
    }
    const domain =
      netDomain.get(row.english)?.domain ?? homeDomain.get(row.english) ?? 'other'
    seats.push({
      name: row.english,
      role: row.role,
      domain,
      uses: Number(row.uses) || 0,
      head: Number(row.head) || 0,
    })
  }

  for (const one of ADD) {
    if (structureNames.has(one.name) || seats.some(s => s.name === one.name)) continue
    seats.push({ name: one.name, role: one.role, domain: one.domain, uses: 0, head: 0 })
    console.log(`added ${one.name}: ${one.why}`)
  }

  // Domains in descending size, and inside a domain the commonest first,
  // so the low codes in a block are the words said most.
  const bySize = new Map<string, number>()
  for (const seat of seats) bySize.set(seat.domain, (bySize.get(seat.domain) ?? 0) + 1)
  seats.sort((a, b) => {
    const size = (bySize.get(b.domain) ?? 0) - (bySize.get(a.domain) ?? 0)
    if (size) return size
    if (a.domain !== b.domain) return a.domain < b.domain ? -1 : 1
    return b.head - a.head || (a.name < b.name ? -1 : 1)
  })

  const start = blockStart(CODE[CODE.indexOf(STRUCTURE_BLOCK) + 1])
  let at = start
  for (const seat of seats) {
    if (at >= WORD_SPACE) {
      console.log(`  OVERFLOW at ${seat.name}, the space is full`)
      trouble++
      break
    }
    const spent = place(at, {
      name: seat.name,
      group: 'concept',
      domain: seat.domain,
      role: seat.role,
      note: '',
    })
    if (spent) at++
  }

  // ---- the fold queue, reported and never applied -------------------
  const fold = readFold(new Set(english.map(r => r.english)))

  // ---- write --------------------------------------------------------
  const rows = [...held.values()].sort((a, b) => (a.code < b.code ? -1 : 1))
  writeTable(
    WORD,
    'base',
    ['code', 'name', 'group', 'domain', 'role', 'note'],
    rows.map(r => [r.code, r.name, r.group, r.domain, r.role, r.note]),
  )
  writeTable(
    WORD,
    'fold',
    ['name', 'from', 'affix', 'verdict', 'why'],
    fold.map(f => [f.name, f.from, f.affix, '', '']),
  )

  // ---- the budget, which is the thing to read -----------------------
  console.log(`\nallocated   ${rows.length} of ${WORD_SPACE}`)
  console.log(`free        ${WORD_SPACE - rows.length}`)
  console.log(`\nby group`)
  const byGroup = new Map<string, number>()
  for (const row of rows) byGroup.set(row.group, (byGroup.get(row.group) ?? 0) + 1)
  for (const [group, n] of [...byGroup.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${group.padEnd(10)} ${String(n).padStart(5)}`)
  }
  console.log(`\nby domain, the twelve largest`)
  const byDomain = new Map<string, number>()
  for (const row of rows) {
    if (row.group !== 'concept') continue
    byDomain.set(row.domain, (byDomain.get(row.domain) ?? 0) + 1)
  }
  console.log(`  ${byDomain.size} domains`)
  for (const [name, n] of [...byDomain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`  ${name.padEnd(14)} ${String(n).padStart(4)}`)
  }
  console.log(`\nby block`)
  const byBlock = new Map<string, number>()
  for (const row of rows) {
    const block = readWordBlock(row.code)
    byBlock.set(block, (byBlock.get(block) ?? 0) + 1)
  }
  for (const letter of CODE) {
    const n = byBlock.get(letter) ?? 0
    console.log(`  ${letter}   ${String(n).padStart(3)} of ${BLOCK_SIZE}`)
  }
  console.log(
    `\n${already} english.csv words are already a vibe, category, digit or kind`,
  )
  if (share.length) {
    console.log(`\n${share.length} names seated once and read two ways`)
    for (const line of share) console.log(`  ${line}`)
  }
  if (twice.length) {
    console.log(`\n${twice.length} names listed twice INSIDE one group, which is a defect`)
    for (const line of twice) console.log(`  ${line}`)
  }
  console.log(`\n${fold.length} words LOOK derived from another. fold.csv, verdicts blank`)
  if (trouble) console.log(`\n${trouble} problems. Nothing here is safe to use yet.`)
  else console.log('\nno code is used twice')
}

/**
 * Words in the list that some affix rule relates to another word in the
 * list. Reported, never applied: measured against the current list this
 * test is right about half the time, and `stop <- top s-`, `king <- kin
 * -ing` and `not <- no -t` are all in it.
 */
function readFold(
  names: Set<string>,
): Array<{ name: string; from: string; affix: string }> {
  const file = process.env.MORPHY ?? join(HERE, 'data/eng.derivational.tsv')
  if (!existsSync(file)) {
    console.log(`no derivation table at ${file}, fold.csv will be empty`)
    return []
  }
  const seen = new Set<string>()
  const out: Array<{ name: string; from: string; affix: string }> = []
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue
    const [from, to, , , affix, side] = line.split('\t')
    if (!to || from === to) continue
    if (!names.has(to) || !names.has(from)) continue
    if (seen.has(to)) continue
    seen.add(to)
    out.push({ name: to, from, affix: side === 'prefix' ? `${affix}-` : `-${affix}` })
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : 1))
}

await main()
