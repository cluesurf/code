/**
 * Check `base/base.csv`, and say what is used and what is free.
 *
 * This is the gate the base list has to pass before anything is built on
 * top of it. It answers the one question that gets expensive to answer late:
 * has this four-letter value already been given a meaning.
 *
 * Everything it reports is a fact about the file rather than a judgement
 * about the concepts, so it can run on every change without anybody having
 * to agree about semantics first.
 *
 *   pnpm check
 *   pnpm check --free m
 *   pnpm check --next 20
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeTable } from '#/code/table'
import {
  CODE,
  SIZE,
  SPACE,
  WIDTH,
  eachInBlock,
  findStrayLetters,
  isCode,
  makeCode,
  readBlock,
  readCode,
} from '#/code/base'

const HERE = new URL('..', import.meta.url).pathname
const CSV = join(HERE, 'base/base.csv')

/**
 * Every file that ALLOCATES codes, and the layer each one holds.
 *
 * A code may be allocated once and once only. That is the whole point of a
 * single address space, and it is the one thing that cannot be checked file
 * by file.
 *
 * `onlyNew` is for the link files. `base/link/chinese.base.csv` mostly
 * POINTS at codes the home tree already allocated, which is the design
 * working rather than a clash: 学 shares the code for `learn` on purpose.
 * Only its `new` rows hand out an address, and only those are checked. Its
 * `none` rows hand out nothing at all, because the character is in the file
 * as a record and the block ran out before it.
 */
export const CODED: Array<{
  path: string
  layer: string
  onlyNew?: boolean
}> = [
  { path: 'base/base.csv', layer: '' },
  { path: 'base/home/base.csv', layer: 'vibe' },
  { path: 'base/link/chinese.base.csv', layer: 'link', onlyNew: true },
]


export type Base = {
  code: string
  name: string
  /** vibe, class, or kind. See `note/vibe.md` */
  layer: string
  group: string
  note: string
  /** which line of the CSV it came from, for the error messages */
  line: number
}

/**
 * The three layers, and nothing else.
 *
 *   vibe    a generalized experience, neither verb nor noun
 *   class   turns a vibe into a part of speech, adding no meaning
 *   kind    what a chain ends with, adding meaning
 */
export const LAYER = new Set(['vibe', 'class', 'kind'])

/** Split one CSV record, honouring double quotes. */
export function splitCsv(line: string): Array<string> {
  const out: Array<string> = []
  let field = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      out.push(field)
      field = ''
    } else {
      field += ch
    }
  }
  out.push(field)
  return out
}

export function readBases(path = CSV): Array<Base> {
  const text = readFileSync(path, 'utf8')
  const line = text.split('\n')
  const out: Array<Base> = []
  for (let i = 1; i < line.length; i++) {
    if (!line[i].trim()) {
      continue
    }
    const [code, name, layer, group, note] = splitCsv(line[i])
    out.push({
      code: (code ?? '').trim(),
      name: (name ?? '').trim(),
      layer: (layer ?? '').trim(),
      group: (group ?? '').trim(),
      note: (note ?? '').trim(),
      line: i + 1,
    })
  }
  return out
}

export type Problem = { line: number; code: string; says: string }

/** Every way the file can be wrong, checked in one pass. */
export function checkBases(bases: Array<Base>): Array<Problem> {
  const problem: Array<Problem> = []
  const seenCode = new Map<string, number>()
  const seenName = new Map<string, number>()

  for (const base of bases) {
    if (!base.code) {
      problem.push({ line: base.line, code: '', says: 'no code' })
      continue
    }

    if (base.code.length !== WIDTH) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `${base.code.length} letters, wants ${WIDTH}`,
      })
      continue
    }

    const stray = findStrayLetters(base.code)
    if (stray.length) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `letters not in the alphabet: ${stray.join(' ')}`,
      })
      continue
    }

    const had = seenCode.get(base.code)
    if (had !== undefined) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `already used on line ${had}`,
      })
    } else {
      seenCode.set(base.code, base.line)
    }

    if (!base.name) {
      problem.push({ line: base.line, code: base.code, says: 'no name' })
      continue
    }

    // Two codes for one meaning is the quiet failure. Nothing breaks, and
    // from then on there are two ways to say the same thing.
    //
    // Scoped to the LAYER, not the whole list. `heart` is a kind meaning the
    // centre of something and a home base meaning the organ, and those are
    // two concepts that happen to share an English spelling. Checking the
    // name globally would force them to merge, which is a wrong claim rather
    // than a tidy one.
    const key = `${base.layer}|${base.name}`
    const nameAt = seenName.get(key)
    if (nameAt !== undefined) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `"${base.name}" is already a ${base.layer} on line ${nameAt}`,
      })
    } else {
      seenName.set(key, base.line)
    }

    if (/\s/.test(base.name)) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `the name "${base.name}" is more than one word`,
      })
    }

    if (!LAYER.has(base.layer)) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `layer "${base.layer}" is not one of ${[...LAYER].join(', ')}`,
      })
    }
  }

  return problem
}

/**
 * Every coded row in the project, from every file.
 *
 * The home and link files carry `code,name,...` with no layer column of
 * their own, so the layer comes from which file the row was in.
 */
export function readEverything(): Array<Base> {
  const out: Array<Base> = []
  for (const { path, layer, onlyNew } of CODED) {
    const full = join(HERE, path)
    if (!existsSync(full)) {
      continue
    }
    if (!layer) {
      // carry the path in `group` so the report can count per file, the
      // same way the link files do
      out.push(...readBases(full).map(base => ({ ...base, group: path })))
      continue
    }
    const line = readFileSync(full, 'utf8').split('\n')
    const head = splitCsv(line[0])
    const howAt = head.indexOf('how')
    for (let i = 1; i < line.length; i++) {
      if (!line[i].trim()) {
        continue
      }
      const field = splitCsv(line[i])
      const [code, name] = field
      if (onlyNew && howAt >= 0 && (field[howAt] ?? '').trim() !== 'new') {
        continue
      }
      out.push({
        code: (code ?? '').trim(),
        name: (name ?? '').trim(),
        layer,
        group: path,
        note: '',
        line: i + 1,
      })
    }
  }
  return out
}

/** Only the codes, and which file each came from. Nothing may repeat. */
export function findCodeClashes(): Array<string> {
  const seen = new Map<string, string>()
  const clash: Array<string> = []
  for (const { path, onlyNew } of CODED) {
    const full = join(HERE, path)
    if (!existsSync(full)) {
      continue
    }
    const line = readFileSync(full, 'utf8').split('\n')
    const head = splitCsv(line[0])
    const howAt = head.indexOf('how')
    for (let i = 1; i < line.length; i++) {
      if (!line[i].trim()) {
        continue
      }
      const field = splitCsv(line[i])
      const [code, name] = field
      const at = (code ?? '').trim()
      if (!at) {
        continue
      }
      // a row that points at an existing code is not allocating one
      if (onlyNew && howAt >= 0 && (field[howAt] ?? '').trim() !== 'new') {
        continue
      }
      const had = seen.get(at)
      const here = `${path}:${i + 1} ${name}`
      if (had) {
        clash.push(`${at} in both ${had} and ${here}`)
      } else {
        seen.set(at, here)
      }
    }
  }
  return clash
}

/** Is this four-letter value taken. The question the file exists to answer. */
export function isUsed(bases: Array<Base>, code: string): boolean {
  return bases.some(base => base.code === code)
}

/** The next free values, in numeric order, optionally inside one block. */
export function findFree(
  bases: Array<Base>,
  howMany: number,
  block?: string,
): Array<string> {
  const used = new Set(bases.map(base => base.code))
  const pool = block ? eachInBlock(block) : undefined
  const out: Array<string> = []
  if (pool) {
    for (const code of pool) {
      if (out.length >= howMany) {
        break
      }
      if (!used.has(code)) {
        out.push(code)
      }
    }
    return out
  }
  for (let value = 0; value < SPACE && out.length < howMany; value++) {
    const code = makeCode(value)
    if (!used.has(code)) {
      out.push(code)
    }
  }
  return out
}

/** Rewrite `base/base.txt` as a column-aligned mirror of the CSV. */
export function writeMirror(bases: Array<Base>): void {
  writeTable(
    join(HERE, 'base'),
    'base',
    ['code', 'name', 'layer', 'group', 'note'],
    bases.map(base => [
      base.code,
      base.name,
      base.layer,
      base.group,
      base.note,
    ]),
  )
}

function report(bases: Array<Base>): void {
  const used = bases.length
  const free = SPACE - used

  console.log(`alphabet:  ${CODE} (${SIZE} letters)`)
  console.log(`width:     ${WIDTH} letters, so ${SPACE} bases in all`)
  console.log(`used:      ${used}`)
  console.log(`free:      ${free}`)
  console.log('')
  console.log('by block:')
  for (const letter of CODE) {
    const inBlock = bases.filter(base => readBlock(base.code) === letter)
    if (!inBlock.length) {
      continue
    }
    const groups = [...new Set(inBlock.map(b => b.group).filter(Boolean))]
    console.log(
      `  ${letter}      ${String(inBlock.length).padStart(5)} used  ${groups.join(', ')}`,
    )
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const bases = readBases()
  const problem = checkBases(bases)

  const freeAt = argv.indexOf('--free')
  const nextAt = argv.indexOf('--next')

  if (freeAt >= 0) {
    const block = argv[freeAt + 1]
    const free = findFree(bases, 40, block)
    console.log(`free in block ${block}: ${free.join(' ')}`)
    return
  }

  if (nextAt >= 0) {
    const howMany = Number(argv[nextAt + 1] ?? 10)
    console.log(findFree(bases, howMany).join(' '))
    return
  }

  report(bases)

  // the one thing that cannot be checked file by file
  const clash = findCodeClashes()
  if (clash.length) {
    console.log('')
    for (const one of clash.slice(0, 20)) {
      console.log(`  ${one}`)
    }
    console.log('')
    console.log(`${clash.length} codes used in more than one file`)
    process.exit(1)
  }

  const everything = readEverything()
  console.log('')
  console.log('across every file:')
  for (const { path } of CODED) {
    const n = everything.filter(base => base.group === path).length
    if (n) {
      console.log(`  ${path.padEnd(28)} ${String(n).padStart(6)}`)
    }
  }
  console.log(`  ${'total'.padEnd(28)} ${String(everything.length).padStart(6)}`)

  if (problem.length) {
    console.log('')
    for (const one of problem) {
      console.log(`  line ${one.line}  ${one.code.padEnd(4)}  ${one.says}`)
    }
    console.log('')
    console.log(`${problem.length} problems in base/base.csv`)
    process.exit(1)
  }

  writeMirror(bases)
  console.log('')
  console.log('base/base.csv is clean, base/base.txt rewritten to match')
}

// only when run, so the functions above can be imported by a test
if (process.argv[1] && process.argv[1].endsWith('check.ts')) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}

export { readCode, isCode, makeCode }
