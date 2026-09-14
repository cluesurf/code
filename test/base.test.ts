import { describe, expect, test } from 'vitest'
import {
  CODE,
  FIRST,
  LAST,
  SIZE,
  SPACE,
  WIDTH,
  eachInBlock,
  isCode,
  makeCode,
  readBlock,
  readCode,
} from '#/code/base'
import {
  LAYER,
  checkBases,
  findCodeClashes,
  findFree,
  isUsed,
  readBases,
  readEverything,
} from '#/make/check'

describe('the alphabet', () => {
  test('is sixteen distinct letters', () => {
    expect(SIZE).toBe(16)
    expect(new Set(CODE).size).toBe(16)
  })

  test('spans the whole space', () => {
    expect(SPACE).toBe(65536)
    expect(readCode(FIRST)).toBe(0)
    expect(readCode(LAST)).toBe(SPACE - 1)
  })
})

describe('reading and making', () => {
  test('round trips every corner', () => {
    for (const value of [0, 1, 15, 16, 255, 256, 4095, 4096, 65534, 65535]) {
      expect(readCode(makeCode(value))).toBe(value)
    }
  })

  test('round trips a sample of the whole space', () => {
    for (let value = 0; value < SPACE; value += 137) {
      expect(readCode(makeCode(value))).toBe(value)
    }
  })

  test('refuses what is not a base', () => {
    expect(isCode('mmm')).toBe(false)
    expect(isCode('mmmmm')).toBe(false)
    expect(isCode('mmma')).toBe(false)
    expect(isCode('MMMM')).toBe(false)
    expect(isCode('')).toBe(false)
    expect(() => readCode('mmma')).toThrow()
    expect(() => makeCode(SPACE)).toThrow()
    expect(() => makeCode(-1)).toThrow()
    expect(() => makeCode(1.5)).toThrow()
  })
})

describe('blocks', () => {
  test('a block is a sixteenth of the space', () => {
    expect(eachInBlock('m')).toHaveLength(SPACE / SIZE)
  })

  test('every base in a block starts with its letter', () => {
    for (const code of eachInBlock('k')) {
      expect(readBlock(code)).toBe('k')
    }
  })
})

describe('the base list', () => {
  const bases = readBases()

  test('has no problems', () => {
    expect(checkBases(bases)).toEqual([])
  })

  test('every code is well formed', () => {
    for (const base of bases) {
      expect(isCode(base.code)).toBe(true)
    }
  })

  test('knows what it has used', () => {
    expect(isUsed(bases, bases[0].code)).toBe(true)
    // not a hardcoded code: `rrrr` used to be free and is now `tuning`
    expect(isUsed(bases, findFree(bases, 1)[0])).toBe(false)
  })

  test('the landmark codes went to the ontology', () => {
    const landmark = (code: string) =>
      bases.find(base => base.code === code)
    expect(landmark('mmmm')?.name).toBe('experience')
    expect(landmark('vvvv')?.name).toBe('vibe')
    expect(landmark('llll')?.name).toBe('link')
    expect(landmark('wwww')?.name).toBe('weave')
    expect(landmark(LAST)?.name).toBe('tuning')
    // the opposites are mirrors of each other
    expect(landmark('mmff')?.name).toBe('fill')
    expect(landmark('ffmm')?.name).toBe('will')
    expect(landmark('mnnm')?.name).toBe('oneness')
    expect(landmark('nmmn')?.name).toBe('balance')
  })

  test('finds free values that are really free', () => {
    const free = findFree(bases, 25)
    expect(free).toHaveLength(25)
    for (const code of free) {
      expect(isUsed(bases, code)).toBe(false)
    }
  })

  test('finds free values inside one block', () => {
    for (const code of findFree(bases, 5, 'r')) {
      expect(readBlock(code)).toBe('r')
      expect(isUsed(bases, code)).toBe(false)
    }
  })

  test('every name is one lowercase word', () => {
    for (const base of bases) {
      expect(base.name).toMatch(/^[a-z]+$/)
    }
  })

  test('every layer is one of the three', () => {
    for (const base of bases) {
      expect(LAYER.has(base.layer)).toBe(true)
    }
  })

  test('the five classes are there and add no meaning', () => {
    const classes = bases.filter(base => base.layer === 'class')
    expect(classes.map(c => c.name).sort()).toEqual([
      'action',
      'cradle',
      'design',
      'manner',
      'object',
    ])
  })

  test('no base carries a part of speech, because a vibe has none', () => {
    for (const base of bases) {
      expect(base.layer).not.toBe('noun')
      expect(base.layer).not.toBe('verb')
    }
  })
})

describe('every file together', () => {
  test('no code is allocated twice, across all of them', () => {
    expect(findCodeClashes()).toEqual([])
  })

  test('every code anywhere is well formed', () => {
    for (const base of readEverything()) {
      expect(isCode(base.code)).toBe(true)
    }
  })

  test('the home tree is allocated', () => {
    const home = readEverything().filter(base =>
      base.group.startsWith('base/home/'),
    )
    expect(home.length).toBeGreaterThan(9000)
  })
})

describe('the checker catches what it is for', () => {
  const at = (line: number, code: string, name: string) => ({
    code,
    name,
    layer: 'vibe',
    group: 'test',
    note: '',
    line,
  })

  test('a repeated code', () => {
    const problem = checkBases([at(2, 'mmmm', 'one'), at(3, 'mmmm', 'two')])
    expect(problem).toHaveLength(1)
    expect(problem[0].says).toContain('already used')
  })

  test('a repeated name inside one layer', () => {
    const problem = checkBases([at(2, 'mmmm', 'one'), at(3, 'mmmn', 'one')])
    expect(problem).toHaveLength(1)
    expect(problem[0].says).toContain('is already a vibe on line 2')
  })

  test('but the same name in two layers is fine', () => {
    // `heart` is a kind meaning the centre and a vibe meaning the organ.
    // Two concepts that share an English spelling, not one concept twice.
    const problem = checkBases([
      { ...at(2, 'mmmm', 'heart'), layer: 'vibe' },
      { ...at(3, 'mmmn', 'heart'), layer: 'kind' },
    ])
    expect(problem).toEqual([])
  })

  test('a bad length', () => {
    expect(checkBases([at(2, 'mmm', 'one')])[0].says).toContain('wants 4')
  })

  test('a letter outside the alphabet', () => {
    expect(checkBases([at(2, 'mmma', 'one')])[0].says).toContain(
      'not in the alphabet',
    )
  })

  test('a clean list', () => {
    expect(checkBases([at(2, 'mmmm', 'one'), at(3, 'mmmn', 'two')])).toEqual([])
  })
})
