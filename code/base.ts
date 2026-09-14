/**
 * The Code alphabet, and the conversion between a base and its number.
 *
 * Code is base 16 written in consonants. Each letter is one hex digit, a
 * base is exactly four letters, and so the whole space is 16^4 = 65,536
 * bases and there is never going to be a 65,537th. That ceiling is the
 * point rather than a limitation: a fixed width means every base is the
 * same size, sorts in its own numeric order, and can be stored in two
 * bytes.
 */

/**
 * Sixteen consonants, in the order that gives each one its value. `m` is 0
 * and `r` is 15.
 *
 * Consonants only, so a base can never accidentally spell a word in any
 * language that uses vowels, and so the vowels stay free for Tune to carry
 * the grammar with.
 */
export const CODE = 'mndbtkhsfvzxcwlr'

/** How many letters the alphabet has, which is the number base. */
export const SIZE = CODE.length

/** Letters in one base. Fixed, never variable. */
export const WIDTH = 4

/** Every base there will ever be. */
export const SPACE = SIZE ** WIDTH

/** The first base, `mmmm`, which is zero. */
export const FIRST = CODE[0].repeat(WIDTH)

/** The last base, `rrrr`, which is 65,535. */
export const LAST = CODE[SIZE - 1].repeat(WIDTH)

if (SIZE !== 16) {
  throw new Error(`CODE must hold 16 letters, it holds ${SIZE}`)
}

if (new Set(CODE).size !== SIZE) {
  throw new Error('CODE must not repeat a letter')
}

const VALUE: Record<string, number> = {}
for (let i = 0; i < CODE.length; i++) {
  VALUE[CODE[i]] = i
}

/** Is this a well-formed base: four letters, all from the alphabet. */
export function isCode(text: string): boolean {
  if (text.length !== WIDTH) {
    return false
  }
  for (const letter of text) {
    if (VALUE[letter] === undefined) {
      return false
    }
  }
  return true
}

/** Which letters in this text are not in the alphabet. */
export function findStrayLetters(text: string): Array<string> {
  const stray: Array<string> = []
  for (const letter of text) {
    if (VALUE[letter] === undefined && !stray.includes(letter)) {
      stray.push(letter)
    }
  }
  return stray
}

/** A base to its number. Throws rather than guessing at a malformed base. */
export function readCode(text: string): number {
  if (!isCode(text)) {
    throw new Error(`not a base: ${JSON.stringify(text)}`)
  }
  let total = 0
  for (const letter of text) {
    total = total * SIZE + VALUE[letter]
  }
  return total
}

/** A number to its base. */
export function makeCode(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value >= SPACE) {
    throw new Error(`out of the space 0..${SPACE - 1}: ${value}`)
  }
  let text = ''
  let left = value
  for (let i = 0; i < WIDTH; i++) {
    text = CODE[left % SIZE] + text
    left = Math.floor(left / SIZE)
  }
  return text
}

/**
 * The block a base sits in.
 *
 * The first letter cuts the space into 16 domains of 4,096. The first two
 * cut it into 256 shelves of 256. Nothing in the encoding requires this, it
 * is just what the digits already give for free, and allocating by block
 * keeps related concepts near each other for no extra machinery.
 */
export function readBlock(text: string): string {
  return text.slice(0, 1)
}

export function readShelf(text: string): string {
  return text.slice(0, 2)
}

/** Every base in a block, in order. */
export function eachInBlock(block: string): Array<string> {
  const at = VALUE[block]
  if (at === undefined) {
    throw new Error(`not a block letter: ${JSON.stringify(block)}`)
  }
  const size = SIZE ** (WIDTH - 1)
  const out: Array<string> = []
  for (let i = 0; i < size; i++) {
    out.push(makeCode(at * size + i))
  }
  return out
}
