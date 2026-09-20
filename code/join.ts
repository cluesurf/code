/**
 * Composition: the structural joins, application, and the parser and
 * serializer for both.
 *
 * Seven marks, five mechanisms, and most concepts use only three of
 * them. Each mark has two spellings, and the two say the same thing:
 *
 *   role        unicode   ascii
 *   tight join     ·        .      level 3
 *   medium join    ~        ~      level 2
 *   loose join     -        -      level 1
 *   application    ∘        *      X∘F is F(X)
 *   word           +        +      absolute
 *   open scope     ⟨        (
 *   shut scope     ⟩        )
 *
 * THE PARSER READS BOTH AND NEVER CARES WHICH. It works in ROLES, and a
 * character is turned into one the moment it is scanned, so `a.b*c` and
 * `a·b∘c` are the same phrase and compare equal. The serializer picks a
 * style and writes every mark from it, so a round trip through either
 * spelling is stable.
 *
 * THE THREE LEVELS ARE RELATIVE, NOT MEANINGFUL. `~` does not mean
 * modifier. It says only that this boundary binds more tightly than `-`
 * and less tightly than `·`, and that is the entire trick: a stronger
 * join on the right nests rightward, so `A-B~C` is `A-(B-C)` and
 * `A~B-C` is `(A-B)-C`, with no brackets written anywhere. Head,
 * possessor, classifier and argument are relations, and a relation is
 * named by a word, never by a level.
 *
 * APPLICATION IS NOT A FOURTH LEVEL. It cuts a word into complete
 * expressions and applies each to the one before, so both sides may be
 * whole compounds and neither has to be rewritten:
 *
 *   great-white-shark            the concept
 *   great-white-shark∘many       the same concept, as an operand
 *   a-b-c∘x-y-z                  (x-y-z) applied to (a-b-c)
 *   A∘X∘P                        P(X(A)), folded left
 *
 * That stability is the point. Nothing promotes a join to move an
 * operator, because no operator has a reach to argue about.
 *
 * THE WORD MARK IS ABSOLUTE. No join and no application crosses it, so
 * `A+B∘X` is `A X(B)` and can never be `X(A+B)`.
 *
 * SCOPE IS THE ESCAPE HATCH, AND MOST STRINGS SHOULD NOT HOLD ONE. It
 * parses what is inside as a whole expression and hands the result back
 * as one constituent, which covers the two things precedence alone
 * cannot say: an application used as a constituent (`A-⟨B∘X⟩` against
 * `A-B∘X`), and a right comb deeper than three levels.
 *
 * SERIALIZING IS THE HARDER HALF, and it is one recursive walk. Each
 * node is written at the weakest level its position allows, and a
 * bracket appears exactly where the grammar leaves no other spelling.
 * Nothing is stored on a node: no level on a join, no style anywhere. A
 * node able to disagree with its own spelling eventually does.
 *
 * The specification, with the test suites and the argument behind every
 * rule, is in note/join.md.
 */

import { isCode, findStrayLetters, WIDTH } from '#/code/base'

/**
 * What a mark does.
 *
 * THE PARSER SPEAKS ONLY IN THESE. A character is one of two spellings
 * of a role, and once scanned the spelling is gone, which is what lets
 * one parser read both alphabets without a second code path.
 */
export type Role =
  | 'tight'
  | 'medium'
  | 'loose'
  | 'apply'
  | 'word'
  | 'open'
  | 'shut'

/** Which alphabet a string is written in. */
export type Style = 'unicode' | 'ascii'

/** `·` U+00B7 MIDDLE DOT. Join level 3, the tightest. */
export const TIGHT = '·'

/** `~` U+007E TILDE. Join level 2. Shared by both alphabets. */
export const MEDIUM = '~'

/** `-` U+002D HYPHEN-MINUS. Join level 1, the loosest. Shared. */
export const LOOSE = '-'

/** `∘` U+2218 RING OPERATOR. Application boundary. */
export const APPLY = '∘'

/** `+` U+002B PLUS SIGN. Word boundary, absolute. Shared. */
export const WORD = '+'

/** `⟨` U+27E8 MATHEMATICAL LEFT ANGLE BRACKET. Opens a recursive scope. */
export const OPEN = '⟨'

/** `⟩` U+27E9 MATHEMATICAL RIGHT ANGLE BRACKET. Closes one. */
export const SHUT = '⟩'

/**
 * The two alphabets.
 *
 * `~ - +` are the same character in both, so only four marks actually
 * differ. THE ASCII SET EXISTS FOR PLACES THAT CANNOT CARRY THE OTHER:
 * a filename, a shell argument, a keyboard without a compose key. It is
 * not a lesser notation, and nothing is lost converting between them.
 */
export const MARKS: Record<Style, Record<Role, string>> = {
  unicode: {
    tight: TIGHT,
    medium: MEDIUM,
    loose: LOOSE,
    apply: APPLY,
    word: WORD,
    open: OPEN,
    shut: SHUT,
  },
  ascii: {
    tight: '.',
    medium: MEDIUM,
    loose: LOOSE,
    apply: '*',
    word: WORD,
    open: '(',
    shut: ')',
  },
}

/** The alphabet a serializer uses unless it is told otherwise. */
export const STYLE: Style = 'unicode'

/** Every character either alphabet reserves. A leaf may hold none of them. */
export const JOINERS = Array.from(
  new Set([...Object.values(MARKS.unicode), ...Object.values(MARKS.ascii)]),
)

/** Which role each character plays, over both alphabets at once. */
const ROLE_OF: Record<string, Role> = {}

for (const marks of Object.values(MARKS)) {
  for (const [role, mark] of Object.entries(marks)) {
    ROLE_OF[mark] = role as Role
  }
}

/**
 * The three join levels, weakest first, as roles.
 *
 * The index is the level less one, so `LEVEL_ROLE[0]` is level 1.
 */
export const LEVEL_ROLE: Array<Role> = ['loose', 'medium', 'tight']

/** The same three, spelled in the default alphabet, weakest first. */
export const LEVELS = LEVEL_ROLE.map(role => MARKS[STYLE][role])

/**
 * How many join levels there are.
 *
 * Three, and scope is what keeps three from being a ceiling: a bracket
 * starts a fresh expression, and inside it all three are available
 * again.
 */
export const DEPTH = LEVEL_ROLE.length

/** A join level: 1 is loose, 2 is medium, 3 is tight. */
export type Level = 1 | 2 | 3

/**
 * A node of the tree.
 *
 * `form` is the discriminant.
 */
export type Node =
  /** One name, carrying no structure. */
  | { form: 'leaf'; name: string }
  /**
   * A binary compound.
   *
   * It carries NO level. A level belongs to the SPELLING and is chosen
   * when serializing. Storing one on the tree is how two spellings of
   * one concept start looking like two concepts.
   */
  | { form: 'join'; left: Node; right: Node }
  /**
   * An application: `operator(base)`.
   *
   * BOTH SIDES ARE WHOLE EXPRESSIONS. The operator is not restricted to
   * a name, because `A∘X-Y-Z` applies the compound `X-Y-Z`, and whether
   * a concept may act as an operator is a question for the model rather
   * than for the parser.
   */
  | { form: 'apply'; base: Node; operator: Node }

/**
 * A phrase: the words a word mark separates, always at least one.
 *
 * The word mark is outside the expression grammar, so a phrase is a
 * list rather than a tree. Nothing reaches across it, an application
 * least of all.
 */
export type Phrase = Array<Node>

/**
 * What a leaf has to look like.
 *
 * `undefined` from a checker means the leaf is fine. A string is the
 * reason it is not, and becomes the parse error. This is the whole of
 * how the notation is told whether it is reading English or codes.
 */
export type Check = (name: string) => string | undefined

/** A name with nothing structural in it. */
export function leaf(name: string): Node {
  return { form: 'leaf', name }
}

/** A compound of two constituents. */
export function join(left: Node, right: Node): Node {
  return { form: 'join', left, right }
}

/** `operator(base)`. Either side may be a whole expression. */
export function apply(base: Node, operator: Node): Node {
  return { form: 'apply', base, operator }
}

/**
 * Every leaf is a four-letter base.
 *
 * The strict one, and the reason the parser takes a checker at all. A
 * code layer that accepts `smallroom` as a leaf has silently stopped
 * being a code layer, and the failure would surface much later as a
 * name nothing can resolve.
 */
export const checkCode: Check = name => {
  if (isCode(name)) {
    return undefined
  }

  const stray = findStrayLetters(name)

  if (stray.length) {
    return `${JSON.stringify(name)} uses ${stray.join('')}, not in the alphabet`
  }

  return `${JSON.stringify(name)} is ${name.length} letters, not ${WIDTH}`
}

/**
 * Every leaf is a lowercase name.
 *
 * The loose one, for the English concept layer. It refuses an empty
 * name and anything holding a character that would have to be escaped
 * in a path segment, and says nothing about meaning.
 */
export const checkName: Check = name => {
  if (!/^[a-z0-9]+$/u.test(name)) {
    return `${JSON.stringify(name)} is not a lowercase name`
  }

  return undefined
}

/**
 * Join precedence, and the grammar's floors.
 *
 *   0   expression   an application chain
 *   1   loose
 *   2   medium
 *   3   tight
 *   4   primary      a name, or a bracketed expression
 *
 * ONE NUMBER LINE SERVES BOTH HALVES. The parser climbs it upward and
 * the writer is handed a floor, which is the weakest level a position
 * will accept without a bracket. A node that cannot meet its floor is
 * bracketed, and inside the bracket the floor starts over. That is the
 * whole of how the two stay in agreement.
 */
const RANK: Partial<Record<Role, number>> = {
  loose: 1,
  medium: 2,
  tight: 3,
}

/** The floor an application has to sit at, which is the expression level. */
const EXPRESSION = 0

type Token =
  | { form: 'name'; text: string; at: number }
  | { form: 'mark'; text: string; role: Role; at: number }

/**
 * Split the input into names and marks.
 *
 * A LEAF IS EVERYTHING THAT IS NOT A MARK, which is why the marks are
 * punctuation and why a name may hold neither a hyphen nor a dot.
 * Whitespace is refused rather than trimmed: the notation exists so a
 * concept can be written without spaces, so a space in the middle of
 * one means the writer meant a word mark.
 *
 * Nothing structural is judged here. Two marks in a row, a scope that
 * never closes, a mark where a name was wanted: the parser reports all
 * of those, because it is the half that knows what it was expecting.
 */
function scan(input: string, check?: Check): Array<Token> {
  const out: Array<Token> = []
  let name = ''
  let start = 0

  function keep(): void {
    if (!name) {
      return
    }

    const why = check?.(name)

    if (why) {
      throw new Error(`${why}, at ${start} in ${JSON.stringify(input)}`)
    }

    out.push({ form: 'name', text: name, at: start })
    name = ''
  }

  for (let at = 0; at < input.length; at++) {
    const one = input[at]

    if (/\s/u.test(one)) {
      throw new Error(
        `whitespace at ${at}, and a word boundary is written ${WORD}`,
      )
    }

    const role = ROLE_OF[one]

    if (role) {
      keep()
      out.push({ form: 'mark', text: one, role, at })
      continue
    }

    if (!name) {
      start = at
    }

    name += one
  }

  keep()

  if (!out.length) {
    throw new Error('nothing to parse')
  }

  return out
}

type Reader = { tokens: Array<Token>; at: number }

function peek(reader: Reader): Token | undefined {
  return reader.tokens[reader.at]
}

function isRole(one: Token | undefined, role: Role): boolean {
  return one !== undefined && one.form === 'mark' && one.role === role
}

/**
 * A name, or a bracketed expression.
 *
 * A scope parses what is inside as a whole expression and hands back
 * one constituent, which is what makes a finite set of marks fully
 * expressive.
 */
function readPrimary(reader: Reader): Node {
  const one = peek(reader)

  if (!one) {
    throw new Error('the word ends where a name was expected')
  }

  if (one.form === 'name') {
    reader.at++

    return leaf(one.text)
  }

  if (one.role === 'open') {
    reader.at++

    if (isRole(peek(reader), 'shut')) {
      throw new Error(`an empty scope at ${one.at}`)
    }

    const node = readExpression(reader)
    const shut = peek(reader)

    if (isRole(shut, 'word')) {
      throw new Error(
        `${WORD} at ${shut?.at} is inside a scope, and ${WORD} is absolute`,
      )
    }

    if (!isRole(shut, 'shut')) {
      throw new Error(`a scope opened at ${one.at} and never closes`)
    }

    reader.at++

    return node
  }

  if (one.role === 'shut') {
    throw new Error(`a scope closes at ${one.at} and never opened`)
  }

  if (one.role === 'word') {
    throw new Error(
      `${WORD} at ${one.at} is inside a scope, and ${WORD} is absolute`,
    )
  }

  throw new Error(
    `expected a name or an open scope at ${one.at}, found ${one.text}`,
  )
}

/**
 * The joins, climbing the precedence line.
 *
 * All three are LEFT-associative, so a repeated join costs no extra
 * level: `A-B-C-D` is `(((A-B)-C)-D)` and stays at level 1 throughout.
 * A join parses its right side one rank higher, which is what makes a
 * stronger join on the right nest rightward.
 */
function readStructural(reader: Reader, floor: number): Node {
  if (floor > DEPTH) {
    return readPrimary(reader)
  }

  let out = readStructural(reader, floor + 1)

  for (;;) {
    const one = peek(reader)

    if (!one || one.form !== 'mark' || RANK[one.role] !== floor) {
      break
    }

    reader.at++
    out = join(out, readStructural(reader, floor + 1))
  }

  return out
}

/**
 * One expression: structural segments, folded left through application.
 *
 * `E0∘E1∘E2` is `E2(E1(E0))`. Each segment is a complete structural
 * expression, which is why neither side of an application ever has to
 * be rewritten to become an operand.
 */
function readExpression(reader: Reader): Node {
  let out = readStructural(reader, 1)

  for (;;) {
    if (!isRole(peek(reader), 'apply')) {
      break
    }

    reader.at++
    out = apply(out, readStructural(reader, 1))
  }

  return out
}

/**
 * Parse one written concept into its phrase.
 *
 * READS EITHER ALPHABET, AND A MIXTURE OF THE TWO. Only four marks
 * differ between them, and each character names its own role, so there
 * is nothing to disambiguate and no reason to refuse a string somebody
 * typed half one way.
 *
 * Throws rather than guessing. There is no error recovery on purpose:
 * these strings go in URLs and in stored keys, and a silently repaired
 * parse is a key that means something else.
 *
 * Pass `check` to say what a leaf must look like. `checkName` is the
 * loose one and `checkCode` demands a four-letter base.
 */
export function parse(input: string, check?: Check): Phrase {
  const tokens = scan(input, check)
  const words: Array<Array<Token>> = [[]]
  let depth = 0

  for (const one of tokens) {
    if (isRole(one, 'open')) {
      depth++
    }

    if (isRole(one, 'shut')) {
      depth--
    }

    // Only a word mark outside every scope divides the phrase. One
    // inside a scope is an error, and the parser says so by name.
    if (isRole(one, 'word') && depth === 0) {
      words.push([])
      continue
    }

    words[words.length - 1].push(one)
  }

  return words.map(word => {
    if (!word.length) {
      throw new Error(`an empty word around ${WORD} in ${input}`)
    }

    const reader: Reader = { tokens: word, at: 0 }
    const node = readExpression(reader)
    const left = peek(reader)

    if (left) {
      if (left.form === 'mark' && left.role === 'shut') {
        throw new Error(`a scope closes at ${left.at} and never opened`)
      }

      throw new Error(`unexpected ${left.text} at ${left.at}`)
    }

    return node
  })
}

/**
 * Write one node at the weakest level its position allows.
 *
 * `floor` is that position: `0` accepts an application, `1` to `3`
 * accept a join of at least that strength, and `4` accepts only a name
 * or a scope. A node that cannot meet its floor is bracketed, and
 * inside the bracket the floor starts over, which is exactly what a
 * scope means in the grammar.
 *
 * SO EVERY BRACKET IS FORCED. A join is bracketed only after all three
 * strengths are spent, and an application only where the grammar has no
 * other place to put one, which is as the operand of a join or as the
 * operator of another application. Nothing else can produce one, so the
 * output carries the fewest pairs that still parse back to this tree.
 *
 * It follows that EVERY TREE CAN BE WRITTEN. There is no refusal
 * anywhere in this file.
 */
function write(
  node: Node,
  floor: number,
  marks: Record<Role, string>,
): string {
  if (node.form === 'leaf') {
    return node.name
  }

  if (node.form === 'apply') {
    const text = [
      write(node.base, EXPRESSION, marks),
      marks.apply,
      // The operator sits one level tighter, so a nested application
      // there is bracketed and the chain stays a left fold.
      write(node.operator, EXPRESSION + 1, marks),
    ].join('')

    return floor > EXPRESSION ? [marks.open, text, marks.shut].join('') : text
  }

  if (floor > DEPTH) {
    return [marks.open, write(node, 1, marks), marks.shut].join('')
  }

  const level = Math.max(floor, 1)

  return [
    write(node.left, level, marks),
    marks[LEVEL_ROLE[level - 1]],
    write(node.right, level + 1, marks),
  ].join('')
}

/**
 * Write a phrase back out, canonically, in one alphabet.
 *
 * CANONICAL MEANS WEAKEST, AND FEWEST. One tree could be spelled `A-B`,
 * `A~B` or `A·B` in isolation, and only one of those can be the stored
 * key, so every join takes the weakest strength its position allows and
 * every bracket has to earn its place.
 *
 * The style decides the characters and nothing else. Both spellings of
 * a phrase parse back to the same tree, so converting one to the other
 * is `serialize(parse(text), style)` and loses nothing.
 *
 * A join spelled with a strength the tree shape does not require is
 * therefore not recoverable. If the model wants to mark an established
 * tight constituent as tight, that is a fact about the model and it
 * needs somewhere of its own to live, because this tree has no room to
 * carry it and a serializer cannot invent it.
 */
export function serialize(phrase: Phrase, style: Style = STYLE): string {
  if (!phrase.length) {
    throw new Error('a phrase holds at least one word')
  }

  const marks = MARKS[style]

  return phrase
    .map(word => write(word, EXPRESSION, marks))
    .join(marks.word)
}

/**
 * Rewrite a written concept canonically.
 *
 * `canonical('A·B')` is `'A-B'` and `canonical('⟨A-B⟩∘X')` is `'A-B∘X'`:
 * the same tree, spelled with the weakest strengths and no bracket that
 * removal would not miss. This is what a stored key or a URL segment
 * holds, so that two spellings of one concept cannot become two rows.
 *
 * `style` also converts between the alphabets, since the input may be
 * written either way and the output is whichever is asked for.
 */
export function canonical(
  input: string,
  options: { check?: Check; style?: Style } = {},
): string {
  return serialize(parse(input, options.check), options.style ?? STYLE)
}

/**
 * The analytical form, for explanation and for tests.
 *
 * Every join is written with one neutral `-` and bracketed wherever it
 * nests, and an application is written as the function it is. So
 * `great-black·cause·process-shark∘many` shows as
 * `many((great-((black-cause)-process))-shark)`.
 *
 * LEVELS DELIBERATELY DO NOT APPEAR. A level belongs to the spelling
 * and not to the tree, and showing one here would invite the reader to
 * think `~` means something.
 *
 * THIS IS NOT CANONICAL SYNTAX AND DOES NOT PARSE BACK. Its round
 * brackets are ordinary explanation, which is worth saying twice now
 * that the ascii alphabet spells a scope with the same two characters.
 */
export function show(node: Node): string {
  if (node.form === 'leaf') {
    return node.name
  }

  if (node.form === 'apply') {
    // An operator that is not a bare name needs brackets, or `A∘X-Y`
    // would show as `X-Y(A)` and read as the wrong tree.
    return [wrapOperator(node.operator), '(', show(node.base), ')'].join('')
  }

  return [nest(node.left), LOOSE, nest(node.right)].join('')
}

/**
 * A nested join gets brackets. An application does not, because
 * `f(x)` already shows its own extent.
 */
function nest(node: Node): string {
  return node.form === 'join' ? ['(', show(node), ')'].join('') : show(node)
}

/** In operator position, anything but a bare name gets brackets. */
function wrapOperator(node: Node): string {
  return node.form === 'leaf' ? node.name : ['(', show(node), ')'].join('')
}

/** The analytical form of a whole phrase, words separated by a space. */
export function showPhrase(phrase: Phrase): string {
  return phrase.map(show).join(' ')
}

/**
 * Are these the same tree.
 *
 * Structure and names only. What proves a round trip: a canonical
 * spelling has to parse back to the tree it came from, or the
 * serializer has changed the concept. It is also what proves the two
 * alphabets agree, since they build one tree or they do not.
 */
export function same(left: Node, right: Node): boolean {
  if (left.form === 'leaf' && right.form === 'leaf') {
    return left.name === right.name
  }

  if (left.form === 'join' && right.form === 'join') {
    return same(left.left, right.left) && same(left.right, right.right)
  }

  if (left.form === 'apply' && right.form === 'apply') {
    return same(left.base, right.base) && same(left.operator, right.operator)
  }

  return false
}

/** Are these the same phrase. */
export function samePhrase(left: Phrase, right: Phrase): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((one, at) => same(one, right[at]))
}

/** One leaf, and which side of an application it was written on. */
export type Use = { name: string; form: 'name' | 'operator' }

/**
 * Every leaf a phrase uses, in reading order, marking the ones written
 * in operator position.
 *
 * What a lexicon lookup needs: the names to resolve, and which of them
 * were applied rather than composed. The parser must never guess from
 * an English meaning which concepts may be operators, so this reports
 * the syntactic fact and leaves the typing to the caller.
 */
export function readUses(phrase: Phrase): Array<Use> {
  const out: Array<Use> = []

  function walk(node: Node, operator: boolean): void {
    if (node.form === 'leaf') {
      out.push({ name: node.name, form: operator ? 'operator' : 'name' })

      return
    }

    if (node.form === 'apply') {
      walk(node.base, operator)
      walk(node.operator, true)

      return
    }

    walk(node.left, operator)
    walk(node.right, operator)
  }

  for (const word of phrase) {
    walk(word, false)
  }

  return out
}

/**
 * Every application in a phrase, outermost first.
 *
 * Parsing settles structure and the model settles validity, so this is
 * the handover: each pair is one question for the concept model, which
 * is whether that operator may apply to that operand. Nothing here
 * answers it.
 */
export function readApplications(
  phrase: Phrase,
): Array<{ base: Node; operator: Node }> {
  const out: Array<{ base: Node; operator: Node }> = []

  function walk(node: Node): void {
    if (node.form === 'leaf') {
      return
    }

    if (node.form === 'apply') {
      out.push({ base: node.base, operator: node.operator })
      walk(node.base)
      walk(node.operator)

      return
    }

    walk(node.left)
    walk(node.right)
  }

  for (const word of phrase) {
    walk(word)
  }

  return out
}

/**
 * How many join strengths a node needs at its own level.
 *
 * `0` for a name, `1` for a plain compound, and above `DEPTH` for a
 * right comb too deep to spell without a bracket. An application
 * restarts the count, because its sides are separate expressions.
 */
export function readDepth(node: Node): number {
  if (node.form === 'leaf') {
    return 0
  }

  if (node.form === 'apply') {
    return 0
  }

  return Math.max(1 + readDepth(node.right), readDepth(node.left), 1)
}

/** The deepest any word of a phrase needs. */
export function readPhraseDepth(phrase: Phrase): number {
  return phrase.reduce((deep, one) => Math.max(deep, readDepth(one)), 0)
}

/**
 * How many scope pairs the canonical spelling uses.
 *
 * The number worth watching, and the same in either alphabet. Ordinary
 * lexical concepts should be at zero, and anything above it is either
 * an application used as a constituent or a right comb deeper than
 * three, which are the only two things precedence cannot say.
 */
export function countScopes(phrase: Phrase): number {
  let total = 0

  for (const one of serialize(phrase, 'unicode')) {
    if (one === OPEN) {
      total++
    }
  }

  return total
}
