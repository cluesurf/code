/**
 * Allocate codes to the home tree and the language links.
 *
 * Everything here comes from work done elsewhere and already reviewed. This
 * script does one job: give each concept a permanent four-letter address,
 * and write the files that record it.
 *
 * What it writes:
 *
 *   base/home/base        every base with a code. The chosen stems first,
 *                         in domain order, then the rest. `block` says
 *                         whether other concepts are built out of it
 *   base/home/link        compounds, as a concept and the bases it is made
 *                         of. These get NO code of their own, which is the
 *                         whole point of composing
 *   base/link/chinese.base   every Mandarin character that means something,
 *                            each pointing at a code where it has one
 *   base/link/chinese.link   every two-character Mandarin word, as its parts
 *
 * Four files, two per layer, and nothing else. `base.base` used to be a
 * fifth and is now the `block` column of `base`.
 *
 * Blocks, so a code says which layer it belongs to before anything is
 * looked up:
 *
 *   m   structure: the ontology, the five classes, the 132 kinds
 *   n   home, foundational
 *   d b t   home, the rest
 *   k   anything a link needs that the home tree does not already carry
 *
 *   CONCEPT=<dir> pnpm fill
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { eachInBlock } from '#/code/base'
import { writeTable } from '#/code/table'
import { readBases, splitCsv } from '#/make/check'

const HERE = new URL('..', import.meta.url).pathname

/**
 * Where the reviewed concept lists live. They are the output of separate
 * work and are not shipped here.
 *
 *   base.csv            every base, with its role and frequency
 *   base.base.csv       the bases that appear inside other concepts
 *   base.compound.csv   words English spells as two bases
 *   base.split.csv      words English spells as one base and is not
 *   stem.candidate.csv  the ~4,096 chosen to be stems, and their domain
 *   china.base.csv      Mandarin morphemes
 *   china.compound.csv  Mandarin compounds
 */
const CONCEPT = process.env.CONCEPT ?? join(HERE, 'data/concept')

/** Which block each layer is allocated from. */
const BLOCK = {
  foundational: ['n'],
  general: ['d', 'b', 't'],
  spare: ['k'],
}

type Row = Record<string, string>

function readCsv(name: string, required = true): Array<Row> {
  const path = join(CONCEPT, name)
  if (!required && !existsSync(path)) {
    return []
  }
  const line = readFileSync(path, 'utf8').split('\n')
  const head = splitCsv(line[0])
  const out: Array<Row> = []
  for (let i = 1; i < line.length; i++) {
    if (!line[i].trim()) {
      continue
    }
    const field = splitCsv(line[i])
    const row: Row = {}
    head.forEach((column, n) => {
      row[column] = (field[n] ?? '').trim()
    })
    out.push(row)
  }
  return out
}

/**
 * Hands out codes from a list of blocks, skipping anything already taken.
 *
 * Allocation is permanent, so this only ever runs on a concept that has no
 * code yet. A base that moves after somebody has used it is a base with two
 * meanings.
 */
class Allocator {
  private pool: Array<string> = []
  private at = 0

  constructor(blocks: Array<string>, taken: Set<string>) {
    for (const block of blocks) {
      for (const code of eachInBlock(block)) {
        if (!taken.has(code)) {
          this.pool.push(code)
        }
      }
    }
  }

  next(): string {
    if (this.at >= this.pool.length) {
      throw new Error('out of codes in the allocated blocks')
    }
    return this.pool[this.at++]
  }

  /**
   * A code if one is left, and nothing if not.
   *
   * The Mandarin list is 22,592 characters against a block of 4,096, so
   * running out is the NORMAL case there rather than an error. Everything
   * else still uses `next` and still throws, because for the home tree
   * running out really is a bug.
   */
  take(): string | undefined {
    return this.at < this.pool.length ? this.pool[this.at++] : undefined
  }

  get left(): number {
    return this.pool.length - this.at
  }
}

function main(): void {
  if (!existsSync(CONCEPT)) {
    console.error(`no concept lists at ${CONCEPT}`)
    console.error('')
    console.error('Run it with CONCEPT=<dir holding base.csv and the rest>')
    console.error('')
    console.error('You almost certainly do not need to. The files under')
    console.error('base/ are already written and are the source of truth.')
    process.exit(1)
  }

  // every code the structure file already uses
  const taken = new Set(readBases().map(base => base.code))

  const bases = readCsv('base.csv')
  const foundational = new Set(readCsv('base.base.csv').map(r => r.base))
  const compounds = readCsv('base.compound.csv')
  const splits = readCsv('base.split.csv')

  // the ~4,096 chosen to be stems, and which domain each landed in. Missing
  // is not an error: without it every base is simply unmarked
  const domainOf = new Map<string, string>()
  for (const one of readCsv('stem.candidate.csv', false)) {
    if (one.base) {
      domainOf.set(one.base, one.domain ?? '')
    }
  }
  const chineseBases = readCsv('china.base.csv')
  const chineseLinks = readCsv('china.compound.csv')

  // The code each English name ends up with, which everything else joins on.
  //
  // ONLY the ontology is shared. A kind and a home base can carry the same
  // English word and mean different things, and merging them on the spelling
  // is how a homograph becomes a wrong claim:
  //
  //   heart   the kind      its centre
  //   heart   the home base the organ
  //   state   the kind      the condition of being in or after it
  //   state   the home base a country
  //
  // The ontology is different. `experience`, `vibe`, `tone`, `link`, `beat`
  // and the rest really are the same concept in both places, so they share
  // one code and appear once.
  const codeOf = new Map<string, string>()
  const structure = readBases()
  for (const base of structure) {
    if (base.layer === 'vibe') {
      codeOf.set(base.name, base.code)
    }
  }

  /** Kind and class names, which a home base may reuse with its own code. */
  const shadowed = new Set(
    structure.filter(base => base.layer !== 'vibe').map(base => base.name),
  )

  // the foundational bases first, so they land in one legible block and the
  // commonest concepts get the lowest numbers
  const inner = new Allocator(BLOCK.foundational, taken)
  const outer = new Allocator(BLOCK.general, taken)

  const foundationalRows: Array<Array<string>> = []
  const generalRows: Array<Array<string>> = []

  const ranked = [...bases].sort(
    (a, b) => Number(b.frequency) - Number(a.frequency),
  )

  let shared = 0
  let shadow = 0

  for (const base of ranked) {
    // an ontology concept keeps the code the structure file gave it
    if (codeOf.has(base.base)) {
      shared++
      continue
    }
    if (shadowed.has(base.base)) {
      shadow++
    }
    const isInner = foundational.has(base.base)
    const code = isInner ? inner.next() : outer.next()
    codeOf.set(base.base, code)
    taken.add(code)
    const row = [
      code,
      base.base,
      base.role,
      isInner ? 'foundational' : 'general',
      domainOf.get(base.base) ?? '',
      base.frequency,
    ]
    if (isInner) {
      foundationalRows.push(row)
    } else {
      generalRows.push(row)
    }
  }

  // ONE home table, not two.
  //
  // The foundational bases used to be a second file, which made two places
  // to look for one question and a join to answer it. They are the bases
  // that appear INSIDE other concepts, which is a property of a base rather
  // than a different kind of thing, so it is a column. The code says the
  // same thing on its own: block `n` is foundational, `d b t` is the rest.
  //
  // The chosen stems come FIRST, in domain order, because that is the list
  // anybody actually reads. Everything else keeps its code and sits below,
  // since a code once handed out is permanent and a concept that did not
  // make the 4,096 is still a concept with an address.
  const homeRows = [...foundationalRows, ...generalRows]
  const DOMAIN_AT = 4
  homeRows.sort((a, b) => {
    const one = a[DOMAIN_AT]
    const two = b[DOMAIN_AT]
    if (!one !== !two) {
      return one ? -1 : 1
    }
    return (
      one.localeCompare(two) || Number(b[5]) - Number(a[5]) || a[1].localeCompare(b[1])
    )
  })

  writeTable(
    join(HERE, 'base/home'),
    'base',
    ['code', 'name', 'role', 'block', 'domain', 'frequency'],
    homeRows,
  )

  // links. A compound gets no code: it IS its parts, and giving it one
  // would mean the same concept had two addresses
  const linkRows: Array<Array<string>> = []
  let unlinked = 0

  for (const one of compounds) {
    const left = codeOf.get(one.left)
    const right = codeOf.get(one.right)
    if (!left || !right) {
      unlinked++
      continue
    }
    linkRows.push([
      one.compound,
      `${left} ${right}`,
      `${one.left} + ${one.right}`,
      one.why,
      one.frequency,
    ])
  }

  for (const one of splits) {
    const kind = codeOf.get(one.kind)
    const on = codeOf.get(one.on)
    if (!kind || !on) {
      unlinked++
      continue
    }
    linkRows.push([
      one.base,
      `${kind} ${on}`,
      `${one.kind} + ${one.on}`,
      'split',
      one.frequency,
    ])
  }

  linkRows.sort((a, b) => Number(b[4]) - Number(a[4]) || a[0].localeCompare(b[0]))

  writeTable(
    join(HERE, 'base/home'),
    'link',
    ['name', 'code', 'parts', 'why', 'frequency'],
    linkRows,
  )

  // Mandarin. A morpheme points at whatever code its English gloss already
  // has. Where the gloss names nothing in the home tree, it takes a spare
  // code, because a morpheme Mandarin composes with is a concept worth
  // having whether or not English kept a word for it
  const spare = new Allocator(BLOCK.spare, taken)
  const chineseRows: Array<Array<string>> = []
  const codeOfChinese = new Map<string, string>()
  let matched = 0
  let minted = 0
  let uncoded = 0

  // EVERY character goes in the file. Not every one can have a code.
  //
  // The list is 22,592 characters and block `k` holds 4,096, so the order
  // decides which get one and the order has to be the useful one: how many
  // compounds are built on the character, then how early it is taught. A
  // character nothing composes with and nobody is taught is in the file as
  // a record and takes no address.
  //
  // A character whose gloss already names a home concept costs nothing
  // either way, because it shares that code rather than taking a new one.
  const ordered = [...chineseBases].sort(
    (a, b) =>
      Number(b.uses ?? 0) - Number(a.uses ?? 0) ||
      (Number(a.hsk) || 99) - (Number(b.hsk) || 99) ||
      a.chinese.localeCompare(b.chinese),
  )

  for (const one of ordered) {
    const gloss = one.english.toLowerCase()
    let code = codeOf.get(gloss)
    let how = 'shared'
    if (code) {
      matched++
    } else {
      code = spare.take()
      if (code) {
        taken.add(code)
        how = 'new'
        minted++
      } else {
        how = 'none'
        uncoded++
      }
    }
    if (code) {
      codeOfChinese.set(one.chinese, code)
    }
    chineseRows.push([
      code ?? '',
      one.chinese,
      one.pinyin,
      one.english,
      how,
      one.hsk ?? '',
      one.uses ?? '',
    ])
  }

  writeTable(
    join(HERE, 'base/link'),
    'chinese.base',
    ['code', 'chinese', 'pinyin', 'english', 'how', 'hsk', 'uses'],
    chineseRows,
  )

  // every compound too, coded where both its parts have a code. A compound
  // never takes a code of its own: it IS its parts, which is the point of
  // composing
  const chineseLinkRows: Array<Array<string>> = []
  let halfCoded = 0
  for (const one of chineseLinks) {
    const parts = one.parts.split(' + ')
    const codes = parts.map(part => codeOfChinese.get(part))
    const whole = codes.every(Boolean)
    if (!whole) {
      halfCoded++
    }
    chineseLinkRows.push([
      one.chinese,
      whole ? codes.join(' ') : '',
      one.english,
      one.parts,
      one.literal,
      one.hsk ?? '',
    ])
  }

  writeTable(
    join(HERE, 'base/link'),
    'chinese.link',
    ['chinese', 'code', 'english', 'parts', 'literal', 'hsk'],
    chineseLinkRows,
  )

  // Every character the compounds are BUILT OUT OF, as one set.
  //
  // `chinese.base` is every character that means anything, 22,592 of them.
  // This is the much smaller set that Mandarin actually composes with, which
  // is the interesting one: a character used in a thousand compounds is a
  // morpheme the language leans on, and one used in none is a character that
  // happens to exist.
  //
  // First and second position are counted apart because the SECOND is the
  // head. 蜂 heads both 蜜蜂 and 黄蜂, and that is what makes it the base
  // rather than either of them.
  // INDIVIDUAL words, so split on whitespace and not only on the ` + `.
  //
  // A character's gloss is often a phrase rather than one word: 蓑 is
  // `sickle for cutting grass or hay`, 篮 is `small bamboo basket`. Splitting
  // only on the join leaves those whole and the file is a list of glosses
  // rather than a list of words.
  const partUse = new Map<string, number>()
  for (const one of chineseLinks) {
    for (const word of one.literal.toLowerCase().split(/[^a-z]+/)) {
      if (word) {
        partUse.set(word, (partUse.get(word) ?? 0) + 1)
      }
    }
  }

  // just the words, one per line, commonest first. Nothing else: every other
  // fact about them is a lookup away in `chinese.base`
  const partRows = [...partUse.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )
  writeFileSync(
    join(HERE, 'base/link/chinese.link.base.txt'),
    partRows.map(([word]) => word).join('\n') + '\n',
    'utf8',
  )

  console.log(`home foundational:  ${foundationalRows.length}  block ${BLOCK.foundational.join(' ')}`)
  console.log(`home general:       ${generalRows.length}  blocks ${BLOCK.general.join(' ')}`)
  console.log(`  sharing ontology: ${shared} kept the structure code`)
  console.log(`  shadowing a kind: ${shadow} reuse a kind's name, own code`)
  console.log(
    `  chosen as a stem: ${homeRows.filter(row => row[DOMAIN_AT]).length} of ${homeRows.length}, listed first`,
  )
  console.log(`home links:         ${linkRows.length}  no codes of their own`)
  if (unlinked) {
    console.log(`  dropped:          ${unlinked} whose parts are not bases`)
  }
  console.log(`chinese bases:      ${chineseRows.length}`)
  console.log(`  sharing a code:   ${matched}  the gloss names a home concept`)
  console.log(`  minted a code:    ${minted}  block ${BLOCK.spare.join(' ')}`)
  console.log(`  no code:          ${uncoded}  in the file, no address`)
  console.log(`chinese links:      ${chineseLinkRows.length}`)
  console.log(`  fully coded:      ${chineseLinkRows.length - halfCoded}`)
  console.log(`  a part uncoded:   ${halfCoded}`)
  console.log(`chinese link bases: ${partRows.length}  the english words compounds are built from`)
  console.log('')
  console.log(`free in ${BLOCK.foundational.join(' ')}: ${inner.left}`)
  console.log(`free in ${BLOCK.general.join(' ')}: ${outer.left}`)
  console.log(`free in ${BLOCK.spare.join(' ')}: ${spare.left}`)
}

main()
