/**
 * HACK. Can each of the sixteen letters carry meaning, so that a four-letter
 * base READS as a four-concept expression?
 *
 * The idea: a base is not an arbitrary number that happens to be spelled in
 * consonants. Each position asks a different question, each letter answers
 * it, and `bktr` means something you could work out without a lookup table.
 *
 *   position 1   which realm            16 answers
 *   position 2   which force in it      16 answers
 *   position 3   which manner           16 answers
 *   position 4   which standing         16 answers
 *
 * That is 64 meanings for 16 letters, four each, and 65,536 readings, which
 * is exactly the size of the space. Nothing is wasted and nothing overflows.
 *
 * The per-letter senses below are taken from the user's own sound-meaning
 * work, `note/library/tune/sound-meanings.md` and the Tune essay at
 * https://cluesurf.substack.com/p/tune, and then specialised per position.
 * They are a PROPOSAL. See `hack/readme.md` for what testing them showed.
 *
 *   pnpm hack                read the allocated bases through the table
 *   pnpm hack bktr wsmn      read any base
 */

import { CODE, WIDTH, isCode } from '#/code/base'
import { readBases } from '#/make/check'

/** The essence each letter carries, before any position specialises it. */
export const ESSENCE: Record<string, string> = {
  m: 'good, the positive pole, hold and gather, the hum',
  n: 'bad, the negative pole, the line, the limit and the thread',
  d: 'form, define, structure, the shaped and decided',
  b: 'being, manifest, bring forth, the body',
  t: 'point, step, the discrete unit, contact and the mark',
  k: 'make, strike, grasp, the hard act, and the kind',
  h: 'breath, life, spirit, the open exhale',
  s: 'still, being, surface, rest, the held field',
  f: 'flow out, force, away, the moving outward',
  v: 'vibe, the felt, vibration, experiential quality',
  z: 'active, doing, energy, the current',
  x: 'hush, the soft field, the subtle, quiet perception',
  c: 'think, pierce, through, the pointed abstraction',
  w: 'world, weave, wave, the enveloping',
  l: 'line, light, flow, continuity, the smooth path',
  r: 'motion, roll, drive, radiate, the turning',
}

/**
 * Each position takes the essence and asks a different question of it. The
 * word in each cell is the essence read as an answer to that question.
 */
export const SLOT: Array<{ asks: string; means: Record<string, string> }> = [
  {
    asks: 'realm',
    means: {
      m: 'mind',
      n: 'number',
      d: 'form',
      b: 'body',
      t: 'time',
      k: 'craft',
      h: 'life',
      s: 'stillness',
      f: 'force',
      v: 'feeling',
      z: 'action',
      x: 'sense',
      c: 'thought',
      w: 'world',
      l: 'light',
      r: 'motion',
    },
  },
  {
    asks: 'force',
    means: {
      m: 'gather',
      n: 'bound',
      d: 'shape',
      b: 'bear',
      t: 'touch',
      k: 'cut',
      h: 'breathe',
      s: 'rest',
      f: 'pour',
      v: 'stir',
      z: 'drive',
      x: 'soften',
      c: 'pierce',
      w: 'wrap',
      l: 'join',
      r: 'turn',
    },
  },
  {
    asks: 'manner',
    means: {
      m: 'warm',
      n: 'sharp',
      d: 'firm',
      b: 'full',
      t: 'brief',
      k: 'hard',
      h: 'open',
      s: 'calm',
      f: 'swift',
      v: 'deep',
      z: 'bright',
      x: 'faint',
      c: 'thin',
      w: 'wide',
      l: 'smooth',
      r: 'rough',
    },
  },
  {
    asks: 'standing',
    means: {
      m: 'whole',
      n: 'part',
      d: 'kind',
      b: 'one',
      t: 'mark',
      k: 'tool',
      h: 'source',
      s: 'state',
      f: 'flow',
      v: 'trace',
      z: 'act',
      x: 'shade',
      c: 'idea',
      w: 'field',
      l: 'path',
      r: 'cycle',
    },
  },
]

/** Read a base as its four answers. */
export function readMeaning(code: string): Array<string> {
  if (!isCode(code)) {
    throw new Error(`not a base: ${JSON.stringify(code)}`)
  }
  const out: Array<string> = []
  for (let at = 0; at < WIDTH; at++) {
    out.push(SLOT[at].means[code[at]])
  }
  return out
}

/** Read a base as one phrase. */
export function sayMeaning(code: string): string {
  return readMeaning(code).join(' ')
}

/**
 * How well does the composed reading match the meaning already assigned.
 *
 * Crude on purpose: does any of the four answers appear in the name or the
 * note. A real score would need a synonym model, and a crude score is enough
 * to tell a working scheme from a decorative one.
 */
function scoreAgainstAllocated(): void {
  const bases = readBases()
  let hit = 0
  const examples: Array<string> = []

  for (const base of bases) {
    const words = readMeaning(base.code)
    const text = `${base.name} ${base.note}`.toLowerCase()
    const found = words.filter(word => text.includes(word))
    if (found.length) {
      hit++
      if (examples.length < 14) {
        examples.push(
          `  ${base.code}  ${base.name.padEnd(12)} ${sayMeaning(base.code).padEnd(30)} shares: ${found.join(', ')}`,
        )
      }
    }
  }

  console.log(`allocated bases:  ${bases.length}`)
  console.log(`any word shared:  ${hit}`)
  console.log(`rate:             ${((hit / bases.length) * 100).toFixed(1)}%`)
  console.log('')
  console.log('where it lines up:')
  for (const line of examples) {
    console.log(line)
  }
  console.log('')
  console.log('a random sample of readings:')
  for (let i = 0; i < 10; i++) {
    const code = [...Array(WIDTH)]
      .map(() => CODE[Math.floor(Math.random() * CODE.length)])
      .join('')
    console.log(`  ${code}  ${sayMeaning(code)}`)
  }
}

/**
 * The same table read letter first rather than slot first: each letter with
 * its four meanings side by side. This is the view that shows whether a
 * letter's four senses are really one sense wearing four hats, which is the
 * thing that makes the scheme learnable.
 */
function showLetters(): void {
  const width = SLOT.map(slot =>
    Math.max(slot.asks.length, ...CODE.split('').map(l => slot.means[l].length)),
  )
  console.log(
    `    ${SLOT.map((s, n) => s.asks.padEnd(width[n])).join('  ')}   essence`,
  )
  console.log(
    `    ${width.map(w => '-'.repeat(w)).join('  ')}   -------`,
  )
  for (let i = 0; i < CODE.length; i++) {
    const letter = CODE[i]
    const cells = SLOT.map((slot, n) => slot.means[letter].padEnd(width[n]))
    console.log(
      `${letter} ${String(i).padStart(2)} ${cells.join('  ')}   ${ESSENCE[letter].split(',')[0]}`,
    )
  }
}

function main(): void {
  const argv = process.argv.slice(2)
  if (argv.includes('--letters')) {
    showLetters()
    return
  }
  if (argv.length) {
    for (const code of argv) {
      console.log(`${code}  ${sayMeaning(code)}`)
    }
    return
  }
  console.log('slot questions:')
  SLOT.forEach((slot, at) => {
    console.log(`  ${at + 1}  ${slot.asks}`)
  })
  console.log('')
  scoreAgainstAllocated()
}

main()
