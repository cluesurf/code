/**
 * Write the first `base/base.csv`.
 *
 * Only block `m` is allocated, and only with vocabulary that is already
 * settled: the ontology the whole model rests on, and the 132 kinds a chain
 * can end with, both carried over from Tune. Everything else in the space is
 * deliberately left empty, because the base concepts are the part that needs
 * iterating and guessing at them now would only make them harder to change
 * later.
 *
 * The layout inside the block is one shelf per group. A shelf is two
 * letters, so it holds 256 bases, which is far more than any group needs
 * and leaves every group room to grow without moving anything.
 *
 * Run once. After this the CSV is edited by hand and checked by `check.ts`.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CODE, makeCode, readCode } from '#/code/base'

const HERE = new URL('..', import.meta.url).pathname

/**
 * The kind list, as a TSV with a `kind`, `group` and `gloss` column.
 *
 * Not shipped here, because it belongs to the Tune work rather than to Code.
 * Point `KIND` at a copy of it.
 *
 *   KIND=<path to kind.tsv> pnpm seed
 *
 * This runs once. After it, `base/base.csv` is the source of truth and is
 * edited by hand, so nobody else ever needs the file.
 */
const KIND = process.env.KIND ?? join(HERE, 'data/kind.tsv')

/**
 * The substance and its parts. Not kinds and not ordinary concepts: these
 * are what the rest is said in terms of.
 *
 * They take the LANDMARK codes rather than a counter, and the codes are
 * assigned by hand.
 *
 * A landmark is a base whose spelling you cannot forget: all four letters
 * the same, or a mirror that reads the same backwards. There are only 16
 * of the first kind and 240 of the second in the whole space, which makes
 * them the scarcest thing in it, and the ontology is what deserves them.
 *
 * Two rules decide which landmark goes where:
 *
 *   the letter's essence matches the concept, so `v` for vibe, `l` for
 *   link, `w` for weave, `c` for mind, `r` for tuning
 *
 *   a pair of opposites gets a pair of mirrors, so `mmff` fill against
 *   `ffmm` will, and `mnnm` oneness against `nmmn` balance
 *
 * `mmmm` is experience because it is zero, and experience is what
 * everything else is a pattern in.
 */
const ONTOLOGY: Array<[string, string, string]> = [
  ['mmmm', 'experience', 'the one substance, all else a pattern in it'],
  ['mnnm', 'oneness', 'the undivided whole, the source and the goal'],
  ['nmmn', 'balance', 'the coupling of the poles, the pull to centre'],
  ['vvvv', 'vibe', 'one quantum of experience, with a tone, at a moment'],
  ['mnmn', 'tone', 'the felt value: pleasure, pain, or peace'],
  ['llll', 'link', 'the connection between two experiences'],
  ['mmff', 'fill', 'the receptive pull of a link, gathering inward'],
  ['ffmm', 'will', 'the projective push of a link, pouring outward'],
  ['tttt', 'beat', 'one discrete step of time'],
  ['wwww', 'weave', 'the interwoven web of vibes, itself a higher vibe'],
  ['ssss', 'self', 'a coherent weave with a boundary'],
  ['nnnn', 'other', 'whatever lies beyond the boundary'],
  ['hhhh', 'aware', 'receiving other vibes, clearly or dimly'],
  ['cccc', 'mind', 'the aware self seated in the spectrum'],
  ['rrrr', 'tuning', 'the self moving back toward unity'],
]

/**
 * The five classes, which are what turn a vibe into a part of speech.
 *
 * A base is a vibe: a generalized experience, neither a verb nor a noun. To
 * say it as a verb you write the vibe and then the action class, which is
 * two codes and eight letters. Tune does the same job with a vowel, because
 * Tune has to be short enough to say. Code has no such constraint and pays
 * four letters for perfect uniformity.
 *
 *   mmmm            experience, the bare vibe
 *   mmmm mmzz       to experience
 *   mmmm mmss       an experience
 *
 * These five add no meaning of their own. That is what separates them from
 * the kinds, which all do.
 */
const CLASS: Array<[string, string, string]> = [
  ['mmzz', 'action', 'says the vibe as a doing, what Tune marks with -i'],
  ['mmss', 'object', 'says the vibe as a thing, what Tune marks with -a'],
  ['mmww', 'manner', 'says the vibe as a way of doing, Tune -e'],
  ['mmdd', 'design', 'says the vibe as a feature of a thing, Tune -o'],
  ['mmkk', 'cradle', 'says the vibe as an orientation in the flow, Tune -u'],
]

/** One shelf per group, in the alphabet's own order. */
const SHELF: Array<string> = [
  'ontology',
  'phase',
  'role',
  'part',
  'quality',
  'life',
  'body',
  'standing',
  'frame',
  'shape',
  'tie',
  'amount',
  'mode',
  'aspect',
  'do',
  'way',
]

type Row = {
  code: string
  name: string
  layer: string
  group: string
  note: string
}

/**
 * The first 32 slots of every shelf are left free for codes assigned by
 * hand. Counters start after them.
 *
 * Without this the counter walks straight over the landmarks: `tone` wants
 * `mnmn`, which is the second slot of the phase shelf, and a counter starting
 * at zero takes it. Reserving the low end costs 32 of 256 on each shelf and
 * keeps the memorable codes available for the concepts that deserve them.
 */
const RESERVED = 32

function shelfCode(shelf: number, at: number): string {
  // block m is 0, so the value is shelf * 256 plus the position in it
  return makeCode(shelf * 256 + RESERVED + at)
}

function main(): void {
  if (!existsSync(KIND)) {
    console.error(`no kind list at ${KIND}`)
    console.error('')
    console.error('Run it with KIND=<path to kind.tsv> pnpm seed')
    console.error('')
    console.error('You almost certainly do not need to. base/base.csv is')
    console.error('already written and is the source of truth from here on.')
    process.exit(1)
  }

  const kindLine = readFileSync(KIND, 'utf8').split('\n')
  const head = kindLine[0].split('\t')
  const kinds: Array<Record<string, string>> = []
  for (let i = 1; i < kindLine.length; i++) {
    if (!kindLine[i].trim()) {
      continue
    }
    const field = kindLine[i].split('\t')
    const row: Record<string, string> = {}
    head.forEach((name, n) => {
      row[name] = (field[n] ?? '').trim()
    })
    kinds.push(row)
  }

  const rows: Array<Row> = []

  for (const [code, name, note] of ONTOLOGY) {
    rows.push({ code, name, layer: 'vibe', group: 'ontology', note })
  }

  for (const [code, name, note] of CLASS) {
    rows.push({ code, name, layer: 'class', group: 'class', note })
  }

  for (let shelf = 1; shelf < SHELF.length; shelf++) {
    const group = SHELF[shelf]
    const inGroup = kinds.filter(kind => kind.group === group)
    inGroup.forEach((kind, at) => {
      // `manner` is the name of a class, so the contentful kind that used to
      // carry it becomes `wise`, as in likewise and lengthwise
      const name = kind.kind === 'manner' ? 'wise' : kind.kind
      rows.push({
        code: shelfCode(shelf, at),
        name,
        layer: 'kind',
        group,
        note: kind.gloss,
      })
    })
  }

  rows.sort((a, b) => readCode(a.code) - readCode(b.code))

  const csv = ['code,name,layer,group,note']
  for (const row of rows) {
    csv.push(
      [row.code, row.name, row.layer, row.group, row.note]
        .map(value => (/[",]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value))
        .join(','),
    )
  }
  writeFileSync(join(HERE, 'base/base.csv'), csv.join('\n') + '\n', 'utf8')

  console.log(`wrote ${rows.length} bases`)
  console.log(`block ${CODE[0]} shelves: ${SHELF.join(', ')}`)
}

main()
