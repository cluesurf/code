/**
 * The marks.
 *
 * A KIND changes what a concept is. A MARK leaves it what it was.
 *
 *   create -> creator     an action becomes a thing     kind
 *   create -> recreate    an action, still an action    mark
 *
 * That is a test rather than a judgement, which is why it is the line the
 * two families are drawn on. It correlates with where the affix sits and
 * does not reduce to it: measured across 223,000 English derivations a
 * prefix keeps the part of speech 78.8% of the time and a suffix keeps it
 * 29.6%, and the exceptions go both ways. `en-` and `be-` are prefixes
 * that make a verb out of a noun, so they are kinds. `-er` and `-est` are
 * suffixes that change nothing, so they are marks.
 *
 * The 132 kinds in `base/word/kind.csv` do not hold any of these, and that
 * is a real gap rather than an oversight: a kind is a head-final reading,
 * so it answers "what kind of thing is this". A mark answers "which one of
 * those", and there was nowhere for it to live.
 *
 * PROPOSED, not settled. The list is short on purpose and every entry
 * earns its place by appearing on the base vocabulary in the English
 * derivation table.
 */

export type Mark = {
  /** The word. One of the 4,096, like anything else. */
  name: string
  /** What it does, in one line. */
  gloss: string
  /** The English affixes that realise it. */
  affix: Array<string>
  /** One English word built with it, for reading the table by eye. */
  show: string
}

export const MARK: Array<Mark> = [
  {
    name: 'not',
    gloss: 'the negation of it',
    affix: ['un-', 'in-', 'im-', 'il-', 'ir-', 'non-', 'a-', 'an-', 'dis-'],
    show: 'unhappy',
  },
  {
    name: 'opposite',
    gloss: 'the far end of it, not merely its absence',
    affix: ['anti-', 'counter-', 'contra-'],
    show: 'anticlockwise',
  },
  {
    name: 'undo',
    gloss: 'reverse it',
    affix: ['de-', 'dis-', 'un-'],
    show: 'defrost',
  },
  { name: 'again', gloss: 'do it once more', affix: ['re-'], show: 'rebuild' },
  {
    name: 'before',
    gloss: 'ahead of it in time or order',
    affix: ['pre-', 'fore-', 'ante-', 'proto-'],
    show: 'preheat',
  },
  {
    name: 'after',
    gloss: 'behind it in time or order',
    affix: ['post-'],
    show: 'postdate',
  },
  {
    name: 'wrong',
    gloss: 'done badly or in error',
    affix: ['mis-', 'mal-'],
    show: 'misread',
  },
  {
    name: 'with',
    gloss: 'done together',
    affix: ['co-', 'con-', 'com-', 'syn-'],
    show: 'cowrite',
  },
  {
    name: 'self',
    gloss: 'done to or by itself',
    affix: ['self-', 'auto-'],
    show: 'self-taught',
  },
  {
    name: 'between',
    gloss: 'among or across several',
    affix: ['inter-'],
    show: 'interweave',
  },
  {
    name: 'across',
    gloss: 'from one side to the other',
    affix: ['trans-'],
    show: 'transplant',
  },
  {
    name: 'excess',
    gloss: 'more of it than is right',
    affix: ['super-', 'hyper-', 'ultra-', 'over-', 'arch-'],
    show: 'overcook',
  },
  {
    name: 'short',
    gloss: 'less of it than is right',
    affix: ['sub-', 'under-', 'hypo-'],
    show: 'undercook',
  },
  {
    name: 'partly',
    gloss: 'half of it, or nearly it',
    affix: ['semi-', 'demi-', 'hemi-'],
    show: 'semicircle',
  },
  {
    name: 'fake',
    gloss: 'passing as it without being it',
    affix: ['pseudo-', 'quasi-'],
    show: 'pseudoscience',
  },
  {
    name: 'meta',
    gloss: 'about it rather than of it',
    affix: ['meta-'],
    show: 'metadata',
  },
  {
    name: 'small',
    gloss: 'a small one of it',
    affix: ['micro-', 'mini-', 'nano-'],
    show: 'microclimate',
  },
  {
    name: 'large',
    gloss: 'a large one of it',
    affix: ['macro-', 'mega-', 'giga-'],
    show: 'megacity',
  },
  { name: 'one', gloss: 'one of it', affix: ['mono-', 'uni-'], show: 'monorail' },
  { name: 'two', gloss: 'two of it', affix: ['bi-', 'di-', 'duo-'], show: 'bilingual' },
  {
    name: 'many',
    gloss: 'many of it',
    affix: ['multi-', 'poly-', 'pluri-'],
    show: 'multilingual',
  },
  {
    name: 'same',
    gloss: 'alike in it',
    affix: ['homo-', 'iso-', 'sym-', 'equi-'],
    show: 'isometric',
  },
  {
    name: 'more',
    gloss: 'a greater degree of it',
    affix: ['-er'],
    show: 'bigger',
  },
  {
    name: 'most',
    gloss: 'the greatest degree of it',
    affix: ['-est', '-most'],
    show: 'biggest',
  },
]

if (new Set(MARK.map(m => m.name)).size !== MARK.length) {
  throw new Error('a mark name is used twice')
}
