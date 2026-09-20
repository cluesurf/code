/**
 * The three-letter word space.
 *
 * `code/base.ts` holds the four-letter space, which was 65,536 addresses
 * of which 61,440 were a stem in a category nobody had checked. The
 * category moved out of the word and became a word of its own, so a word
 * is three letters and there are 4,096 of them.
 *
 *   16^3 = 4,096 words, and there is never going to be a 4,097th
 *
 * Same alphabet, same digit values, same sorting property: the letters are
 * hex digits in order, so alphabetical order and numeric order are one
 * order for free.
 */

import { CODE, SIZE } from '#/code/base'

/** Letters in one word. Fixed, never variable. */
export const WORD_WIDTH = 3

/** Every word there will ever be. */
export const WORD_SPACE = SIZE ** WORD_WIDTH

/**
 * A block is the first letter, so 16 blocks of 256.
 * A shelf is the first two, so 256 shelves of 16.
 */
export const BLOCK_SIZE = SIZE ** (WORD_WIDTH - 1)
export const SHELF_SIZE = SIZE

const VALUE: Record<string, number> = {}
for (let i = 0; i < CODE.length; i++) {
  VALUE[CODE[i]] = i
}

/** Is this a well-formed word: three letters, all from the alphabet. */
export function isWord(text: string): boolean {
  if (text.length !== WORD_WIDTH) return false
  for (const letter of text) {
    if (VALUE[letter] === undefined) return false
  }
  return true
}

/** A word to its number. Throws rather than guessing at a malformed word. */
export function readWord(text: string): number {
  if (!isWord(text)) {
    throw new Error(`not a word: ${JSON.stringify(text)}`)
  }
  let total = 0
  for (const letter of text) total = total * SIZE + VALUE[letter]
  return total
}

/** A number to its word. */
export function makeWord(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value >= WORD_SPACE) {
    throw new Error(`out of the space 0..${WORD_SPACE - 1}: ${value}`)
  }
  let text = ''
  let left = value
  for (let i = 0; i < WORD_WIDTH; i++) {
    text = CODE[left % SIZE] + text
    left = Math.floor(left / SIZE)
  }
  return text
}

export function readWordBlock(text: string): string {
  return text.slice(0, 1)
}

export function readWordShelf(text: string): string {
  return text.slice(0, 2)
}

/** The first number in a block, by its letter. */
export function blockStart(block: string): number {
  const at = VALUE[block]
  if (at === undefined) {
    throw new Error(`not a block letter: ${JSON.stringify(block)}`)
  }
  return at * BLOCK_SIZE
}

/**
 * How the space is cut.
 *
 * Block `m` is the structure and the other fifteen are ordinary concepts.
 * Nothing in the encoding requires this. It is what the digits give for
 * free, and allocating by block keeps related concepts adjacent with no
 * extra machinery, which is the whole of what the block system buys.
 */
export const STRUCTURE_BLOCK = 'm'

/**
 * The shelves inside block `m`, in order, and what each holds.
 *
 * `vibe` sits first because `mmm` should be `experience`, which is zero,
 * and everything else is a pattern in it.
 */
export const STRUCTURE: Array<{ shelf: string; group: string; room: number }> = [
  { shelf: 'mm', group: 'vibe', room: 16 },
  { shelf: 'mn', group: 'category', room: 16 },
  { shelf: 'md', group: 'digit', room: 16 },
  { shelf: 'mb', group: 'kind', room: 144 },
]
