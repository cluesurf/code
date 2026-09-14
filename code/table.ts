/**
 * Every data file is written twice: a CSV, which is the source of truth and
 * what gets edited, and a column-aligned text mirror, which is what gets
 * read.
 *
 * They are never edited apart. The CSV changes and the TXT is regenerated,
 * so a disagreement between them is impossible rather than merely unlikely.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * How wide each column has to be.
 *
 * A plain loop rather than a spread into `Math.max`, because these tables
 * run to thousands of rows and spreading that many arguments overflows the
 * call stack.
 */
function measure(
  columns: Array<string>,
  rows: Array<Array<string>>,
): Array<number> {
  const width = columns.map(column => column.length)
  for (const row of rows) {
    for (let n = 0; n < width.length; n++) {
      const length = (row[n] ?? '').length
      if (length > width[n]) {
        width[n] = length
      }
    }
  }
  return width
}

export function writeTable(
  dir: string,
  name: string,
  columns: Array<string>,
  rows: Array<Array<string>>,
): void {
  mkdirSync(dir, { recursive: true })

  const csv = [columns.join(',')]
  for (const row of rows) {
    csv.push(row.map(value => csvField(value ?? '')).join(','))
  }
  writeFileSync(join(dir, `${name}.csv`), csv.join('\n') + '\n', 'utf8')

  const width = measure(columns, rows)
  const line = (row: Array<string>): string =>
    row
      .map((value, n) => (value ?? '').padEnd(width[n]))
      .join('  ')
      .trimEnd()

  const txt = [line(columns), width.map(w => '-'.repeat(w)).join('  ')]
  for (const row of rows) {
    txt.push(line(row))
  }
  writeFileSync(join(dir, `${name}.txt`), txt.join('\n') + '\n', 'utf8')
}
