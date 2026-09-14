/**
 * Write the first `base/base.csv`.
 *
 * Only block `m` is allocated, and only with vocabulary that is already
 * settled: the ontology the whole model rests on, and the 132 kinds a chain
 * can end with, both carried over from the Tune work in
 * `note/library/tune/`. Everything else in the space is deliberately left
 * empty, because the base concepts are the part that needs iterating and
 * guessing at them now would only make them harder to change later.
 *
 * The layout inside the block is one shelf per group. A shelf is two
 * letters, so it holds 256 bases, which is far more than any group needs
 * and leaves every group room to grow without moving anything.
 *
 * Run once. After this the CSV is edited by hand and checked by `check.ts`.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CODE, makeCode, readCode } from '#/code/base'

const HERE = new URL('..', import.meta.url).pathname
const KIND =
  '/Users/lancepollard/base/crew/cluesurf/task/tune/data/kind.tsv'

/**
 * The substance and its parts, from `note/library/tune/the-model.md`. These
 * are not kinds and not ordinary concepts. They are what the rest is said
 * in terms of, so they take the first shelf.
 */
/**
 * These take the LANDMARK codes rather than a counter, and the codes are
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
const ONTOLOGY: Array<[string, string, string, string]> = [
  ['mmmm', 'experience', 'thing', 'the one substance, all else a pattern in it'],
  ['mnnm', 'oneness', 'thing', 'the undivided whole, the source and the goal'],
  ['nmmn', 'balance', 'thing', 'the coupling of the poles, the pull to centre'],
  ['vvvv', 'vibe', 'thing', 'one quantum of experience, with a tone, at a moment'],
  ['mnmn', 'tone', 'thing', 'the felt value: pleasure, pain, or peace'],
  ['llll', 'link', 'thing', 'the connection between two experiences'],
  ['mmff', 'fill', 'action', 'the receptive pull of a link, gathering inward'],
  ['ffmm', 'will', 'action', 'the projective push of a link, pouring outward'],
  ['tttt', 'beat', 'thing', 'one discrete step of time'],
  ['wwww', 'weave', 'thing', 'the interwoven web of vibes, itself a higher vibe'],
  ['ssss', 'self', 'thing', 'a coherent weave with a boundary'],
  ['nnnn', 'other', 'thing', 'whatever lies beyond the boundary'],
  ['hhhh', 'aware', 'feature', 'receiving other vibes, clearly or dimly'],
  ['cccc', 'mind', 'thing', 'the aware self seated in the spectrum'],
  ['rrrr', 'tuning', 'action', 'the self moving back toward unity'],
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
  role: string
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

  for (const [code, name, role, note] of ONTOLOGY) {
    rows.push({ code, name, role, group: 'ontology', note })
  }

  for (let shelf = 1; shelf < SHELF.length; shelf++) {
    const group = SHELF[shelf]
    const inGroup = kinds.filter(kind => kind.group === group)
    inGroup.forEach((kind, at) => {
      rows.push({
        code: shelfCode(shelf, at),
        name: kind.kind,
        role: 'kind',
        group,
        note: kind.gloss,
      })
    })
  }

  rows.sort((a, b) => readCode(a.code) - readCode(b.code))

  const csv = ['code,name,role,group,note']
  for (const row of rows) {
    csv.push(
      [row.code, row.name, row.role, row.group, row.note]
        .map(value => (/[",]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value))
        .join(','),
    )
  }
  writeFileSync(join(HERE, 'base/base.csv'), csv.join('\n') + '\n', 'utf8')

  console.log(`wrote ${rows.length} bases`)
  console.log(`block ${CODE[0]} shelves: ${SHELF.join(', ')}`)
}

main()
