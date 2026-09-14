/**
 * HACK. How expensive is it to reach an everyday concept from the bottom?
 *
 * The argument for a second, human-earth tree is that building everything
 * from abstract first principles makes ordinary words very long. That is a
 * claim about depth, and WordNet's hypernym chain is a rough but real
 * measure of it: how many steps of "is a kind of" lie between a concept and
 * the top of the hierarchy.
 *
 * A chain of depth 12 means a purely universal Code would need something in
 * the order of twelve codes, 48 letters, to say `robin` from the bottom.
 *
 *   pnpm depth
 *   pnpm depth bird dog water
 */

import { createReadStream, existsSync } from 'node:fs'
import { createGunzip } from 'node:zlib'
import sax from 'sax'

/**
 * Open English WordNet, in the WN-LMF XML, gzipped.
 *
 * Not shipped with this repo, because it is large and separately licensed.
 * Download `english-wordnet-2024.xml.gz` from
 * https://github.com/globalwordnet/english-wordnet/releases and either put
 * it at `data/english-wordnet.xml.gz` or point `WORDNET` at it.
 *
 *   WORDNET=~/somewhere/english-wordnet-2024.xml.gz pnpm depth
 */
const WORDNET = process.env.WORDNET ?? 'data/english-wordnet.xml.gz'

const EVERYDAY = [
  'bird',
  'robin',
  'dog',
  'tree',
  'oak',
  'water',
  'fire',
  'stone',
  'hand',
  'house',
  'bread',
  'knife',
  'river',
  'sun',
  'mother',
  'blood',
  'fish',
  'salt',
]

type Synset = { id: string; up: Array<string>; words: Array<string> }

async function read(): Promise<{
  synset: Map<string, Synset>
  senseOf: Map<string, Array<string>>
}> {
  const synset = new Map<string, Synset>()
  const senseOf = new Map<string, Array<string>>()

  let word = ''
  let at = ''

  const parser = sax.createStream(true, { trim: true })

  parser.on('opentag', node => {
    const a = node.attributes as Record<string, string>
    switch (node.name) {
      case 'Lemma': {
        const written = a.writtenForm ?? ''
        word =
          written && written[0] === written[0].toLowerCase()
            ? written.toLowerCase()
            : ''
        return
      }
      case 'Sense': {
        if (word && a.synset) {
          const list = senseOf.get(word) ?? []
          list.push(a.synset)
          senseOf.set(word, list)
        }
        return
      }
      case 'Synset': {
        at = a.id ?? ''
        if (at) {
          synset.set(at, { id: at, up: [], words: [] })
        }
        return
      }
      case 'SynsetRelation': {
        if (a.relType === 'hypernym' && at && a.target) {
          synset.get(at)?.up.push(a.target)
        }
        return
      }
      default:
        return
    }
  })

  parser.on('closetag', name => {
    if (name === 'Synset') {
      at = ''
    } else if (name === 'LexicalEntry') {
      word = ''
    }
  })

  await new Promise<void>((resolve, reject) => {
    const file = createReadStream(WORDNET)
    const gunzip = createGunzip()
    file.on('error', reject)
    gunzip.on('error', reject)
    parser.on('error', reject)
    parser.on('end', resolve)
    file.pipe(gunzip).pipe(parser)
  })

  for (const [lemma, ids] of senseOf) {
    for (const id of ids) {
      synset.get(id)?.words.push(lemma)
    }
  }

  return { synset, senseOf }
}

/** The shortest climb to the top, and the path it takes. */
function climb(
  synset: Map<string, Synset>,
  from: string,
): { depth: number; path: Array<string> } {
  let at = from
  const path: Array<string> = []
  const seen = new Set<string>()
  while (true) {
    const node = synset.get(at)
    if (!node || seen.has(at)) {
      break
    }
    seen.add(at)
    path.push(node.words[0] ?? at)
    if (!node.up.length) {
      break
    }
    at = node.up[0]
  }
  return { depth: path.length - 1, path }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const want = argv.length ? argv : EVERYDAY

  if (!existsSync(WORDNET)) {
    console.error(`no WordNet at ${WORDNET}`)
    console.error('')
    console.error('Download english-wordnet-2024.xml.gz from')
    console.error('https://github.com/globalwordnet/english-wordnet/releases')
    console.error('then put it at data/english-wordnet.xml.gz, or run')
    console.error('  WORDNET=<path to it> pnpm depth')
    process.exit(1)
  }

  const { synset, senseOf } = await read()

  console.log('how many "is a kind of" steps from the top, per WordNet')
  console.log('')

  let total = 0
  let counted = 0

  for (const word of want) {
    const ids = senseOf.get(word)
    if (!ids?.length) {
      console.log(`  ${word.padEnd(8)} not in WordNet`)
      continue
    }
    const { depth, path } = climb(synset, ids[0])
    total += depth
    counted++
    console.log(`  ${word.padEnd(8)} ${String(depth).padStart(2)}  ${path.join(' < ')}`)
  }

  if (counted) {
    const mean = total / counted
    console.log('')
    console.log(`mean depth:        ${mean.toFixed(1)}`)
    console.log(`codes if built up: about ${Math.round(mean)}`)
    console.log(`letters:           about ${Math.round(mean) * 4}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
