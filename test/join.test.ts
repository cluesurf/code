import { describe, expect, test } from 'vitest'
import {
  APPLY,
  DEPTH,
  LEVELS,
  LOOSE,
  MARKS,
  MEDIUM,
  OPEN,
  SHUT,
  STYLE,
  TIGHT,
  WORD,
  apply,
  canonical,
  checkCode,
  checkName,
  countScopes,
  join,
  leaf,
  parse,
  readApplications,
  readDepth,
  readUses,
  samePhrase,
  serialize,
  show,
  showPhrase,
} from '#/code/join'

/** One written concept in, its analytical form out. */
function read(input: string): string {
  return showPhrase(parse(input))
}

/** Every input in the suites below, for the properties that hold of all. */
const EVERY = [
  'A-B-C',
  'A~B~C',
  'A·B·C',
  'A-B~C',
  'A~B-C',
  'A-B~C·D',
  'A·B~C·D-E·F~G·H',
  'A∘X',
  'A-B-C∘X',
  'A∘X-Y-Z',
  'A-B-C∘X-Y-Z',
  'A∘X∘P',
  'A-B-C∘X-Y-Z∘P-Q-R',
  'A+B',
  'A+B∘X',
  'A+B-C∘X+D',
  'A-B∘X+C-D∘Y',
  'A-⟨B∘X⟩',
  'A-⟨B-C∘X⟩-D',
  'A∘⟨X∘Y⟩',
  'A-⟨B-⟨C-D∘X⟩-E∘Y⟩-F',
  'A-B~C·⟨D-E⟩',
  'great-white-shark∘many',
  'great-white·like-shark∘many',
  'great-black·cause·process-shark∘many',
  'child-two·cardinal-language-vocabulary-acquire·ordinary·process',
  'large-⟨black-bird∘many⟩-colony',
]

describe('the characters', () => {
  test('seven glyphs, all different', () => {
    const all = [TIGHT, MEDIUM, LOOSE, APPLY, WORD, OPEN, SHUT]

    expect(new Set(all).size).toBe(7)
  })

  test('the codepoints are the ones the specification names', () => {
    expect(TIGHT).toBe('·')
    expect(MEDIUM).toBe('~')
    expect(LOOSE).toBe('-')
    expect(APPLY).toBe('∘')
    expect(WORD).toBe('+')
    expect(OPEN).toBe('⟨')
    expect(SHUT).toBe('⟩')
  })

  test('the levels are the three joins, weakest first', () => {
    expect(LEVELS).toEqual([LOOSE, MEDIUM, TIGHT])
    expect(DEPTH).toBe(3)
  })
})

describe('structural precedence', () => {
  test('equal joins associate left', () => {
    expect(read('A-B-C')).toBe('(A-B)-C')
    expect(read('A~B~C')).toBe('(A-B)-C')
    expect(read('A·B·C')).toBe('(A-B)-C')
    expect(read('A-B-C-D')).toBe('((A-B)-C)-D')
  })

  test('all three strengths are one tree when repeated', () => {
    expect(samePhrase(parse('A-B-C'), parse('A~B~C'))).toBe(true)
    expect(samePhrase(parse('A~B~C'), parse('A·B·C'))).toBe(true)
  })

  test('a stronger join on the right nests rightward', () => {
    expect(read('A-B~C')).toBe('A-(B-C)')
    expect(read('A~B-C')).toBe('(A-B)-C')
    expect(read('A-B~C·D')).toBe('A-(B-(C-D))')
  })

  test('a left-growing chain costs one strength however long it is', () => {
    expect(readDepth(parse('A-B-C-D-E-F-G-H-I-J')[0])).toBe(1)
  })

  test('a balanced tree of eight leaves fits in three strengths', () => {
    expect(read('A·B~C·D-E·F~G·H')).toBe('((A-B)-(C-D))-((E-F)-(G-H))')
    expect(readDepth(parse('A·B~C·D-E·F~G·H')[0])).toBe(3)
  })

  test('a flat compound is left grouped, and the other tree is stated', () => {
    expect(read('black-bird-house')).toBe('(black-bird)-house')
    expect(read('black-bird~house')).toBe('black-(bird-house)')
    expect(read('old-book-store')).toBe('(old-book)-store')
    expect(read('old-book~store')).toBe('old-(book-store)')
  })
})

describe('application', () => {
  test('X∘F is F(X), and either side may be a compound', () => {
    expect(read('A∘X')).toBe('X(A)')
    expect(read('A-B-C∘X')).toBe('X((A-B)-C)')
    expect(read('A∘X-Y-Z')).toBe('((X-Y)-Z)(A)')
    expect(read('A-B-C∘X-Y-Z')).toBe('((X-Y)-Z)((A-B)-C)')
  })

  test('a chain folds left', () => {
    expect(read('A∘X∘P')).toBe('P(X(A))')
    expect(read('A∘X∘Y∘Z')).toBe('Z(Y(X(A)))')
    expect(read('A-B-C∘X-Y-Z∘P-Q-R')).toBe(
      '((P-Q)-R)(((X-Y)-Z)((A-B)-C))',
    )
  })

  test('the operand is the whole completed expression', () => {
    expect(read('great-white-shark∘many')).toBe('many((great-white)-shark)')
    expect(read('great-white·like-shark∘many')).toBe(
      'many((great-(white-like))-shark)',
    )
    expect(read('great-black·cause·process-shark∘many')).toBe(
      'many((great-((black-cause)-process))-shark)',
    )
  })

  test('the base spelling does not change when it becomes an operand', () => {
    const base = canonical('great-white·like-shark')

    expect(canonical('great-white·like-shark∘many')).toBe(
      `${base}${APPLY}many`,
    )
  })

  test('it is not a fourth strength, so no join moves to admit it', () => {
    expect(canonical('great-white-shark')).toBe('great-white-shark')
    expect(canonical('great-white-shark∘many')).toBe(
      'great-white-shark∘many',
    )
  })
})

describe('the word boundary', () => {
  test('nothing crosses it', () => {
    expect(parse('A+B')).toHaveLength(2)
    expect(read('A+B')).toBe('A B')
    expect(read('A+B∘X')).toBe('A X(B)')
    expect(read('great-white+shark∘many')).toBe('great-white many(shark)')
  })

  test('it bounds application on both sides', () => {
    expect(read('A+B-C∘X+D')).toBe('A X(B-C) D')
    expect(read('A-B+C-D∘X+E')).toBe('A-B X(C-D) E')
    expect(read('A-B∘X+C-D∘Y')).toBe('X(A-B) Y(C-D)')
  })

  test('compound against phrase', () => {
    expect(read('black+bird')).toBe('black bird')
    expect(read('black-bird')).toBe('black-bird')
    expect(read('green+house')).toBe('green house')
    expect(read('green-house')).toBe('green-house')
  })
})

describe('recursive scope', () => {
  test('an application used as a constituent', () => {
    expect(read('A-B∘X')).toBe('X(A-B)')
    expect(read('A-⟨B∘X⟩')).toBe('A-X(B)')
    expect(read('black-bird∘many')).toBe('many(black-bird)')
    expect(read('black-⟨bird∘many⟩')).toBe('black-many(bird)')
  })

  test('those are two different trees', () => {
    expect(samePhrase(parse('A-B∘X'), parse('A-⟨B∘X⟩'))).toBe(false)
    expect(canonical('A-B∘X')).not.toBe(canonical('A-⟨B∘X⟩'))
  })

  test('an operator expression, which a flat chain cannot say', () => {
    expect(read('A∘X∘Y')).toBe('Y(X(A))')
    expect(read('A∘⟨X∘Y⟩')).toBe('(Y(X))(A)')
    expect(samePhrase(parse('A∘X∘Y'), parse('A∘⟨X∘Y⟩'))).toBe(false)
  })

  test('embedded application inside a compound', () => {
    expect(read('A-⟨B-C∘X⟩-D')).toBe('(A-X(B-C))-D')
    expect(read('large-⟨black-bird∘many⟩-colony')).toBe(
      '(large-many(black-bird))-colony',
    )
  })

  test('a right comb deeper than three strengths', () => {
    expect(read('A-B~C·⟨D-E⟩')).toBe('A-(B-(C-(D-E)))')
  })

  test('scopes nest without a limit', () => {
    expect(read('A-⟨B-⟨C-D∘X⟩-E∘Y⟩-F')).toBe(
      '(A-Y((B-X(C-D))-E))-F',
    )
    expect(countScopes(parse('A-⟨B-⟨C-D∘X⟩-E∘Y⟩-F'))).toBe(2)
  })

  test('inside a scope the whole grammar begins again', () => {
    expect(read('A-⟨B-C~D·E∘X⟩')).toBe('A-X(B-(C-(D-E)))')
  })
})

describe('the specification structural suite', () => {
  const CASES: Array<[string, string]> = [
    ['A-B-C', '(A-B)-C'],
    ['A~B~C', '(A-B)-C'],
    ['A·B·C', '(A-B)-C'],
    ['A-B~C', 'A-(B-C)'],
    ['A~B-C', '(A-B)-C'],
    ['A-B~C·D', 'A-(B-(C-D))'],
    ['A·B~C·D-E·F~G·H', '((A-B)-(C-D))-((E-F)-(G-H))'],
  ]

  test.each(CASES)('%s is %s', (input, expected) => {
    expect(read(input)).toBe(expected)
  })
})

describe('the specification application suite', () => {
  const CASES: Array<[string, string]> = [
    ['A∘X', 'X(A)'],
    ['A-B-C∘X', 'X((A-B)-C)'],
    ['A∘X-Y-Z', '((X-Y)-Z)(A)'],
    ['A-B-C∘X-Y-Z', '((X-Y)-Z)((A-B)-C)'],
    ['A∘X∘P', 'P(X(A))'],
    ['A-B-C∘X-Y-Z∘P-Q-R', '((P-Q)-R)(((X-Y)-Z)((A-B)-C))'],
    ['A∘X-Y', '(X-Y)(A)'],
    ['A-B∘X-Y', '(X-Y)(A-B)'],
  ]

  test.each(CASES)('%s is %s', (input, expected) => {
    expect(read(input)).toBe(expected)
  })
})

describe('the specification boundary suite', () => {
  const CASES: Array<[string, string]> = [
    ['A+B', 'A B'],
    ['A+B∘X', 'A X(B)'],
    ['A+B-C∘X+D', 'A X(B-C) D'],
    ['A-B∘X+C-D∘Y', 'X(A-B) Y(C-D)'],
    ['A-B+C-D∘X+E', 'A-B X(C-D) E'],
  ]

  test.each(CASES)('%s is %s', (input, expected) => {
    expect(read(input)).toBe(expected)
  })
})

describe('the specification recursive suite', () => {
  const CASES: Array<[string, string]> = [
    ['black-bird∘many', 'many(black-bird)'],
    ['black-⟨bird∘many⟩', 'black-many(bird)'],
    ['A-B∘X', 'X(A-B)'],
    ['A-⟨B∘X⟩', 'A-X(B)'],
    ['A∘X∘Y', 'Y(X(A))'],
    ['A∘⟨X∘Y⟩', '(Y(X))(A)'],
    ['A-⟨B-C∘X⟩-D', '(A-X(B-C))-D'],
    ['large-⟨black-bird∘many⟩-colony', '(large-many(black-bird))-colony'],
  ]

  test.each(CASES)('%s is %s', (input, expected) => {
    expect(read(input)).toBe(expected)
  })
})

describe('canonical form', () => {
  test('an isolated compound takes the weakest strength', () => {
    expect(canonical('A-B')).toBe('A-B')
    expect(canonical('A~B')).toBe('A-B')
    expect(canonical('A·B')).toBe('A-B')
  })

  test('a left-growing chain compresses all the way down', () => {
    expect(canonical('A~B~C')).toBe('A-B-C')
    expect(canonical('A·B·C·D')).toBe('A-B-C-D')
  })

  test('a right branch spends exactly one strength', () => {
    expect(canonical('A~B·C')).toBe('A-B~C')
    expect(canonical('A-B~C')).toBe('A-B~C')
    expect(canonical('A-B~C·D')).toBe('A-B~C·D')
  })

  test('a balanced tree keeps only the strengths it needs', () => {
    expect(canonical('A·B~C·D-E·F~G·H')).toBe('A-B-C~D-E~F~G·H')
  })

  test('a strength the tree does not need is weakened', () => {
    // Every `·` here is doing work `~` already does, because a tight
    // constituent inside a loose chain only has to beat `-`.
    expect(canonical('great-white·like-shark')).toBe(
      'great-white~like-shark',
    )
    expect(canonical('great-black·cause·process-shark∘many')).toBe(
      'great-black~cause~process-shark∘many',
    )
    expect(
      canonical('child-two·cardinal-language-vocabulary-acquire·ordinary·process'),
    ).toBe('child-two~cardinal-language-vocabulary-acquire~ordinary~process')
  })

  test('a bracket whose removal changes nothing is removed', () => {
    expect(canonical('⟨A-B-C⟩∘X')).toBe('A-B-C∘X')
    expect(canonical('A∘⟨X-Y-Z⟩')).toBe('A∘X-Y-Z')
    expect(canonical('⟨A-B-C⟩∘⟨X-Y-Z⟩∘⟨P-Q-R⟩')).toBe('A-B-C∘X-Y-Z∘P-Q-R')
    expect(canonical('A-⟨B-C⟩')).toBe('A-B~C')
    expect(canonical('A-⟨B-⟨C-D⟩⟩')).toBe('A-B~C·D')
    expect(canonical('⟨⟨A-B⟩-C⟩-D')).toBe('A-B-C-D')
  })

  test('a bracket whose removal changes the parse is kept', () => {
    expect(canonical('A-⟨B∘X⟩')).toBe('A-⟨B∘X⟩')
    expect(canonical('A-⟨B∘X⟩-C')).toBe('A-⟨B∘X⟩-C')
    expect(canonical('A∘⟨X∘Y⟩')).toBe('A∘⟨X∘Y⟩')
    expect(canonical('large-⟨black-bird∘many⟩-colony')).toBe(
      'large-⟨black-bird∘many⟩-colony',
    )
  })

  test('a right comb deeper than three brackets its tail', () => {
    const comb = join(
      leaf('A'),
      join(leaf('B'), join(leaf('C'), join(leaf('D'), leaf('E')))),
    )

    expect(readDepth(comb)).toBe(4)
    expect(serialize([comb])).toBe('A-B~C·⟨D-E⟩')
    expect(countScopes([comb])).toBe(1)
  })

  test('an ordinary concept carries no bracket at all', () => {
    const plain = [
      'A-B-C',
      'A-B~C·D',
      'A-B-C∘X-Y-Z∘P-Q-R',
      'A+B-C∘X+D',
      'great-white-shark∘many',
    ]

    for (const one of plain) {
      expect(countScopes(parse(one))).toBe(0)
    }
  })

  test('no two distinct trees share a canonical string', () => {
    const inputs = [
      'A-B-C',
      'A-B~C',
      'A-B~C·D',
      'A∘X',
      'A-B∘X',
      'A∘X-Y',
      'A∘X∘Y',
      'A∘⟨X∘Y⟩',
      'A-⟨B∘X⟩',
      'A+B',
      'A+B∘X',
    ]
    const keys = inputs.map(one => canonical(one))

    expect(new Set(keys).size).toBe(inputs.length)
  })

  test('canonicalizing is idempotent, and never changes the tree', () => {
    for (const input of EVERY) {
      const once = canonical(input)

      expect(canonical(once)).toBe(once)
      expect(samePhrase(parse(once), parse(input))).toBe(true)
    }
  })

  test('every tree can be written, so nothing is ever refused', () => {
    const deep = join(
      leaf('a'),
      join(
        leaf('b'),
        join(leaf('c'), join(leaf('d'), join(leaf('e'), leaf('f')))),
      ),
    )
    const right = join(leaf('A'), apply(join(leaf('B'), leaf('C')), leaf('x')))
    const operator = apply(leaf('A'), apply(leaf('X'), leaf('Y')))

    for (const one of [deep, right, operator]) {
      const text = serialize([one])

      expect(samePhrase(parse(text), [one])).toBe(true)
    }
  })
})

describe('building a tree by hand', () => {
  test('a whole-compound application', () => {
    const tree = apply(join(leaf('black'), leaf('bird')), leaf('many'))

    expect(serialize([tree])).toBe('black-bird∘many')
    expect(show(tree)).toBe('many(black-bird)')
  })

  test('the same two leaves with the application inside', () => {
    const tree = join(leaf('black'), apply(leaf('bird'), leaf('many')))

    expect(serialize([tree])).toBe('black-⟨bird∘many⟩')
    expect(show(tree)).toBe('black-many(bird)')
  })

  test('a compound operator', () => {
    const tree = apply(leaf('a'), join(leaf('x'), leaf('y')))

    expect(serialize([tree])).toBe('a∘x-y')
    expect(show(tree)).toBe('(x-y)(a)')
  })
})

describe('what the model has to check', () => {
  test('every leaf in reading order, with the operator side marked', () => {
    expect(readUses(parse('great-white-shark∘many'))).toEqual([
      { name: 'great', form: 'name' },
      { name: 'white', form: 'name' },
      { name: 'shark', form: 'name' },
      { name: 'many', form: 'operator' },
    ])
  })

  test('a compound operator marks every name in it', () => {
    expect(readUses(parse('a∘x-y-z')).map(one => one.form)).toEqual([
      'name',
      'operator',
      'operator',
      'operator',
    ])
  })

  test('every application, as one question each for the model', () => {
    const found = readApplications(parse('a-b∘x∘y'))

    expect(found).toHaveLength(2)
    expect(show(found[0].operator)).toBe('y')
    expect(show(found[0].base)).toBe('x(a-b)')
    expect(show(found[1].operator)).toBe('x')
    expect(show(found[1].base)).toBe('a-b')
  })

  test('a word with no application asks nothing', () => {
    expect(readApplications(parse('a-b~c·d'))).toEqual([])
  })

  test('a word boundary does not interrupt the leaf list', () => {
    expect(readUses(parse('two·cardinal+language')).map(one => one.name)).toEqual(
      ['two', 'cardinal', 'language'],
    )
  })
})

describe('the same notation over codes', () => {
  test('a compound of bases', () => {
    expect(read('nnmd-nmnr')).toBe('nnmd-nmnr')
    expect(canonical('nnmd-nmnr', { check: checkCode })).toBe('nnmd-nmnr')
  })

  test('the grouping a flat list of parts cannot record', () => {
    expect(read('nmhn-nnmd-nmnr')).toBe('(nmhn-nnmd)-nmnr')
    expect(read('nmhn-nnmd~nmnr')).toBe('nmhn-(nnmd-nmnr)')
  })

  test('a class over a base is an application', () => {
    expect(read('mmmm∘mmzz')).toBe('mmzz(mmmm)')
    expect(read('mmmm∘mndn∘mddm')).toBe('mddm(mndn(mmmm))')
  })

  test('a class over a whole compound needs no rewrite of the compound', () => {
    expect(read('nnmd-nmnr∘mmss')).toBe('mmss(nnmd-nmnr)')
    expect(read('nnmd-⟨nmnr∘mmss⟩')).toBe('nnmd-mmss(nmnr)')
  })

  test('a leaf that is not a base is refused', () => {
    expect(() => parse('smallroom', checkCode)).toThrow(/not in the alphabet/u)
    expect(() => parse('nmnr-room', checkCode)).toThrow(/not in the alphabet/u)
  })

  test('a base of the right letters and the wrong length is refused', () => {
    expect(() => parse('mmm', checkCode)).toThrow(/3 letters, not 4/u)
    expect(() => parse('nmnrm', checkCode)).toThrow(/5 letters, not 4/u)
    expect(() => parse('nnmd∘mmm', checkCode)).toThrow(/3 letters, not 4/u)
  })

  test('without a checker anything that is not a joiner is a leaf', () => {
    expect(() => parse('smallroom')).not.toThrow()
  })
})

describe('checking English names', () => {
  test('a lowercase name passes', () => {
    expect(canonical('new-castle', { check: checkName })).toBe('new-castle')
  })

  test('a capital or a space does not', () => {
    expect(() => parse('Newcastle', checkName)).toThrow(/lowercase name/u)
    expect(() => parse('new castle', checkName)).toThrow(/whitespace/u)
  })
})

describe('the two alphabets', () => {
  test('four marks differ and three are shared', () => {
    const roles = Object.keys(MARKS.unicode) as Array<keyof typeof MARKS.unicode>
    const same = roles.filter(one => MARKS.unicode[one] === MARKS.ascii[one])

    expect(same.sort()).toEqual(['loose', 'medium', 'word'])
    expect(MARKS.ascii).toEqual({
      tight: '.',
      medium: '~',
      loose: '-',
      apply: '*',
      word: '+',
      open: '(',
      shut: ')',
    })
  })

  test('unicode is what a serializer writes unless told otherwise', () => {
    expect(STYLE).toBe('unicode')
    expect(canonical('a-b*x')).toBe('a-b∘x')
  })

  const PAIRS: Array<[string, string]> = [
    ['a-b-c', 'a-b-c'],
    ['a-b~c·d', 'a-b~c.d'],
    ['a-b-c~d·e', 'a-b-c~d.e'],
    ['a-b-c∘x-y-z', 'a-b-c*x-y-z'],
    ['a∘x∘y', 'a*x*y'],
    ['a∘⟨x∘y⟩', 'a*(x*y)'],
    ['a-⟨b∘x⟩-c', 'a-(b*x)-c'],
    ['large-⟨black-bird∘many⟩-colony', 'large-(black-bird*many)-colony'],
    ['a-⟨b-⟨c-d∘x⟩-e∘y⟩-f', 'a-(b-(c-d*x)-e*y)-f'],
    ['a+b-c∘x+d', 'a+b-c*x+d'],
  ]

  test.each(PAIRS)('%s and %s are one phrase', (unicode, ascii) => {
    expect(samePhrase(parse(unicode), parse(ascii))).toBe(true)
  })

  test.each(PAIRS)('%s serializes to %s in ascii', (unicode, ascii) => {
    expect(canonical(unicode, { style: 'ascii' })).toBe(ascii)
  })

  test.each(PAIRS)('%s serializes to %s in unicode', (unicode, ascii) => {
    expect(canonical(ascii, { style: 'unicode' })).toBe(unicode)
  })

  test('converting either way loses nothing', () => {
    for (const input of EVERY) {
      const ascii = canonical(input, { style: 'ascii' })
      const back = canonical(ascii, { style: 'unicode' })

      expect(back).toBe(canonical(input))
      expect(samePhrase(parse(ascii), parse(input))).toBe(true)
    }
  })

  test('a mixture of the two reads as one phrase', () => {
    expect(samePhrase(parse('a.b*c'), parse('a·b∘c'))).toBe(true)
    // The `.` weakens to `~` on the way out, the way any strength the
    // tree does not need does. Style and strength are separate
    // questions, and canonicalizing answers both at once.
    expect(canonical('a-b.c*⟨x*y⟩')).toBe('a-b~c∘⟨x∘y⟩')
    expect(canonical('a-b.c*⟨x*y⟩', { style: 'ascii' })).toBe('a-b~c*(x*y)')
  })

  test('canonicalizing is idempotent in ascii too', () => {
    for (const input of EVERY) {
      const once = canonical(input, { style: 'ascii' })

      expect(canonical(once, { style: 'ascii' })).toBe(once)
    }
  })

  test('an ascii leaf may hold neither a dot nor a star', () => {
    expect(parse('a.b')).toHaveLength(1)
    expect(showPhrase(parse('a.b'))).toBe('a-b')
    expect(showPhrase(parse('a*b'))).toBe('b(a)')
  })

  test('the analytical form is not ascii syntax, though it looks it', () => {
    // `show` writes round brackets for explanation, and ascii spells a
    // scope with the same two characters. The two are never fed to
    // each other, and this is the case that would notice if they were.
    expect(show(parse('a-b*x')[0])).toBe('x(a-b)')
    expect(canonical('a-b*x', { style: 'ascii' })).toBe('a-b*x')
  })
})

describe('what the parser refuses', () => {
  test.each([
    ['', /nothing to parse/u],
    ['-A', /expected a name/u],
    ['∘A', /expected a name/u],
    ['A--B', /expected a name/u],
    ['A-~B', /expected a name/u],
    ['A∘∘B', /expected a name/u],
    ['A-', /ends where a name was expected/u],
    ['A∘', /ends where a name was expected/u],
    ['A+', /an empty word/u],
    ['+A', /an empty word/u],
    ['a b', /whitespace/u],
    ['a\tb', /whitespace/u],
    ['⟨A', /never closes/u],
    ['A⟩', /never opened/u],
    ['⟨⟩', /an empty scope/u],
    ['⟨A+B⟩', /is absolute/u],
  ])('%s throws', (input, pattern) => {
    expect(() => parse(input)).toThrow(pattern)
  })

  test('a scope may not span a word boundary', () => {
    expect(() => parse('A-⟨B+C⟩')).toThrow(/is absolute/u)
  })
})
