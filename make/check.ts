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

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
const TXT = join(HERE, 'base/base.txt')

export type Base = {
  code: string
  name: string
  role: string
  group: string
  note: string
  /** which line of the CSV it came from, for the error messages */
  line: number
}

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
    const [code, name, role, group, note] = splitCsv(line[i])
    out.push({
      code: (code ?? '').trim(),
      name: (name ?? '').trim(),
      role: (role ?? '').trim(),
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

    // two codes for one meaning is the quiet failure. Nothing breaks, and
    // from then on there are two ways to say the same thing
    const nameAt = seenName.get(base.name)
    if (nameAt !== undefined) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `the name "${base.name}" is already on line ${nameAt}`,
      })
    } else {
      seenName.set(base.name, base.line)
    }

    if (/\s/.test(base.name)) {
      problem.push({
        line: base.line,
        code: base.code,
        says: `the name "${base.name}" is more than one word`,
      })
    }
  }

  return problem
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

/** Rewrite `base.txt` as a column-aligned mirror of the CSV. */
export function writeMirror(bases: Array<Base>, path = TXT): void {
  const columns = ['code', 'name', 'role', 'group', 'note']
  const rows = bases.map(base => [
    base.code,
    base.name,
    base.role,
    base.group,
    base.note,
  ])
  const width = columns.map(column => column.length)
  for (const row of rows) {
    for (let n = 0; n < width.length; n++) {
      if (row[n].length > width[n]) {
        width[n] = row[n].length
      }
    }
  }
  const line = (row: Array<string>): string =>
    row
      .map((value, n) => value.padEnd(width[n]))
      .join('  ')
      .trimEnd()

  const out = [line(columns), width.map(w => '-'.repeat(w)).join('  ')]
  for (const row of rows) {
    out.push(line(row))
  }
  writeFileSync(path, out.join('\n') + '\n', 'utf8')
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
