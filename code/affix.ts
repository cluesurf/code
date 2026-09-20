/**
 * The operator table: which English affix realises which operator.
 *
 * This is the one hand-written file in the derivation pipeline and it is
 * where the judgement lives. Everything else is a join, a filter or a
 * count.
 *
 * THREE THINGS TO KNOW BEFORE EDITING IT.
 *
 * 1. AN AFFIX NAMES A SET, NOT A VALUE. No common English suffix carries
 *    fewer than about six distinct concepts. `-ion` is `act`, `process`,
 *    `event`, `result`, `product` or `state` and nothing in the word says
 *    which. So `kind` here is a CANDIDATE LIST, and settling one word to
 *    one kind is hand work done per word in `base/word/derive.csv`, never
 *    here. A guess in this file is a guess applied to thousands of words
 *    at once.
 *
 * 2. AN AFFIX THAT IS ALSO A WORD IS A COMPOUND. `watergate` is `water`
 *    plus the base `gate`. 169 of the 2,302 affix strings in the English
 *    derivation table are whole words, and they are detected rather than
 *    listed: if the bare string is in the base vocabulary, the join is a
 *    compound. Listing one here would be a second mechanism for something
 *    the base list already decides.
 *
 * 3. THE ROLE MATTERS AND THE LETTERS DO NOT. `-ing` is the act when it
 *    makes a noun (`the building`), `progress` when it makes an adjective
 *    (`running water`) and an inflection when it makes a verb (`is
 *    running`). `take` says which role pairs an entry answers for, as
 *    MorphyNet writes them: N noun, V verb, J adjective, R adverb.
 *
 * Kind names must exist in `base/word/kind.csv`. Mark names must exist in
 * `code/mark.ts`. `make/derive.ts` refuses the build if one does not,
 * which is what stops a typo becoming a silent unclassified pile.
 */

import { COMPARISON, PREFIX } from '#/code/prefix'

export type Join = 'kind' | 'compound'

export type Affix = {
  /** As MorphyNet writes it, with the dash on the side it attaches. */
  form: string
  /** Which family the head comes from. */
  join: Join
  /**
   * The operator, or the candidates for it where English does not say.
   * First is the commonest reading, and that is a note rather than a
   * default: nothing downstream picks it.
   */
  take: Array<string>
  /**
   * Role pairs this entry answers for, `from>to`, or `*` for any. An affix
   * with several entries is disambiguated by this and nothing else.
   */
  role?: Array<string>
  /** One English word, so the table can be read by eye. */
  show: string
}

/** Suffixes that make a THING out of an ACTION. */
const ACTION_TO_THING: Array<Affix> = [
  { form: '-ion', join: 'kind', take: ['act', 'process', 'event', 'result', 'product', 'state'], show: 'creation' },
  { form: '-tion', join: 'kind', take: ['act', 'process', 'event', 'result', 'product', 'state'], show: 'reception' },
  { form: '-sion', join: 'kind', take: ['act', 'process', 'event', 'result', 'state'], show: 'tension' },
  { form: '-ition', join: 'kind', take: ['act', 'process', 'result', 'state'], show: 'addition' },
  { form: '-ation', join: 'kind', take: ['act', 'process', 'result', 'content'], show: 'information' },
  { form: '-ification', join: 'kind', take: ['act', 'process', 'result'], show: 'clarification' },
  { form: '-ization', join: 'kind', take: ['act', 'process', 'result'], show: 'nationalization' },
  { form: '-isation', join: 'kind', take: ['act', 'process', 'result'], show: 'nationalisation' },
  { form: '-ment', join: 'kind', take: ['act', 'result', 'state', 'product'], show: 'payment' },
  { form: '-ance', join: 'kind', take: ['act', 'state', 'nature'], show: 'performance' },
  { form: '-ence', join: 'kind', take: ['act', 'state', 'nature'], show: 'presence' },
  { form: '-ancy', join: 'kind', take: ['state', 'nature'], show: 'vacancy' },
  { form: '-ency', join: 'kind', take: ['state', 'nature'], show: 'urgency' },
  { form: '-ure', join: 'kind', take: ['act', 'result', 'product'], show: 'pressure' },
  { form: '-al', join: 'kind', take: ['act'], role: ['V>N'], show: 'arrival' },
  { form: '-age', join: 'kind', take: ['act', 'measure', 'collection', 'fee'], show: 'marriage' },
  { form: '-ing', join: 'kind', take: ['act', 'process', 'product'], role: ['V>N', 'N>N'], show: 'building' },
  { form: '-ery', join: 'kind', take: ['practice', 'place', 'collection'], show: 'bakery' },
  { form: '-ry', join: 'kind', take: ['practice', 'place', 'collection'], show: 'weaponry' },
  { form: '-er', join: 'kind', take: ['agent', 'tool', 'place'], role: ['V>N', 'N>N'], show: 'creator' },
  { form: '-or', join: 'kind', take: ['agent', 'tool'], show: 'creator' },
  { form: '-ar', join: 'kind', take: ['agent', 'tool'], role: ['V>N'], show: 'liar' },
  { form: '-ee', join: 'kind', take: ['target', 'recipient'], show: 'payee' },
  { form: '-ant', join: 'kind', take: ['agent', 'tool'], role: ['V>N'], show: 'servant' },
  { form: '-ent', join: 'kind', take: ['agent', 'tool'], role: ['V>N'], show: 'student' },
  { form: '-ist', join: 'kind', take: ['agent', 'school'], show: 'artist' },
  { form: '-ism', join: 'kind', take: ['school', 'practice', 'act'], show: 'creationism' },
  { form: '-ster', join: 'kind', take: ['agent'], show: 'youngster' },
  { form: '-ology', join: 'kind', take: ['study'], show: 'phonology' },
  { form: '-logy', join: 'kind', take: ['study'], show: 'geology' },
  { form: '-ics', join: 'kind', take: ['study'], show: 'physics' },
  { form: '-ory', join: 'kind', take: ['place', 'tool'], role: ['V>N'], show: 'factory' },
  { form: '-arium', join: 'kind', take: ['place'], show: 'aquarium' },
  { form: '-atory', join: 'kind', take: ['place', 'tool'], role: ['V>N'], show: 'laboratory' },
]

/** Suffixes that make a THING out of a THING or a FEATURE. */
const TO_THING: Array<Affix> = [
  { form: '-ness', join: 'kind', take: ['nature'], show: 'kindness' },
  { form: '-ity', join: 'kind', take: ['nature', 'instance'], show: 'creativity' },
  { form: '-ty', join: 'kind', take: ['nature'], show: 'safety' },
  { form: '-cy', join: 'kind', take: ['nature', 'state'], show: 'accuracy' },
  { form: '-th', join: 'kind', take: ['nature'], role: ['J>N'], show: 'width' },
  { form: '-ability', join: 'kind', take: ['ability'], show: 'readability' },
  { form: '-ibility', join: 'kind', take: ['ability'], show: 'visibility' },
  { form: '-ship', join: 'kind', take: ['state', 'office', 'art'], show: 'kingship' },
  { form: '-hood', join: 'kind', take: ['period', 'society'], show: 'childhood' },
  { form: '-dom', join: 'kind', take: ['state', 'domain'], show: 'kingdom' },
  { form: '-ling', join: 'kind', take: ['young'], show: 'duckling' },
  { form: '-let', join: 'kind', take: ['unit', 'young'], show: 'treelet' },
  { form: '-ette', join: 'kind', take: ['unit'], show: 'kitchenette' },
  { form: '-ess', join: 'kind', take: ['female'], show: 'lioness' },
  { form: '-itis', join: 'kind', take: ['disease'], show: 'arthritis' },
  { form: '-osis', join: 'kind', take: ['disease'], show: 'sclerosis' },
  { form: '-ia', join: 'kind', take: ['disease', 'domain'], show: 'anaemia' },
  { form: '-ate', join: 'kind', take: ['office', 'domain'], role: ['N>N'], show: 'doctorate' },
  { form: '-ian', join: 'kind', take: ['agent', 'language'], show: 'historian' },
  { form: '-an', join: 'kind', take: ['agent', 'language'], role: ['N>N'], show: 'republican' },
  { form: '-ite', join: 'kind', take: ['agent', 'unit'], show: 'luddite' },
]

/** Suffixes that make a FEATURE. */
const TO_FEATURE: Array<Affix> = [
  { form: '-able', join: 'kind', take: ['able'], show: 'creatable' },
  { form: '-ible', join: 'kind', take: ['able'], show: 'visible' },
  { form: '-ful', join: 'kind', take: ['full'], show: 'joyful' },
  { form: '-less', join: 'kind', take: ['less'], show: 'treeless' },
  { form: '-ish', join: 'kind', take: ['partly', 'like'], show: 'greenish' },
  { form: '-like', join: 'kind', take: ['like'], show: 'treelike' },
  { form: '-ly', join: 'kind', take: ['like'], role: ['N>J', 'J>J'], show: 'kingly' },
  { form: '-y', join: 'kind', take: ['like', 'full'], show: 'angry' },
  { form: '-ous', join: 'kind', take: ['full', 'oriented'], show: 'joyous' },
  { form: '-ious', join: 'kind', take: ['full', 'oriented'], show: 'ambitious' },
  { form: '-ive', join: 'kind', take: ['prone', 'oriented'], show: 'creative' },
  { form: '-ative', join: 'kind', take: ['prone', 'oriented'], show: 'talkative' },
  { form: '-al', join: 'kind', take: ['oriented'], role: ['N>J', 'J>J'], show: 'national' },
  { form: '-ial', join: 'kind', take: ['oriented'], show: 'official' },
  { form: '-ical', join: 'kind', take: ['oriented'], show: 'historical' },
  { form: '-ic', join: 'kind', take: ['oriented', 'like'], show: 'heroic' },
  { form: '-ual', join: 'kind', take: ['oriented'], show: 'factual' },
  { form: '-ary', join: 'kind', take: ['oriented'], role: ['N>J'], show: 'legendary' },
  { form: '-en', join: 'kind', take: ['material'], role: ['N>J'], show: 'wooden' },
  { form: '-ed', join: 'kind', take: ['featuring', 'complete'], role: ['N>J', 'V>J', 'J>J'], show: 'horned' },
  { form: '-ing', join: 'kind', take: ['progress'], role: ['V>J', 'N>J', 'J>J'], show: 'running' },
  { form: '-some', join: 'kind', take: ['much'], show: 'burdensome' },
  { form: '-ward', join: 'kind', take: ['route'], show: 'homeward' },
  { form: '-wards', join: 'kind', take: ['route'], show: 'backwards' },
  { form: '-wise', join: 'kind', take: ['route', 'manner'], show: 'lengthwise' },
  { form: '-proof', join: 'kind', take: ['resistant'], show: 'waterproof' },
  { form: '-free', join: 'kind', take: ['free'], show: 'duty-free' },
  { form: '-oid', join: 'kind', take: ['resembling'], show: 'humanoid' },
  { form: '-istic', join: 'kind', take: ['resembling'], show: 'nationalistic' },
  { form: '-esque', join: 'kind', take: ['resembling'], show: 'picturesque' },
  { form: '-worthy', join: 'kind', take: ['worthy'], show: 'noteworthy' },
  { form: '-fold', join: 'kind', take: ['measure'], show: 'twofold' },
  { form: '-ine', join: 'kind', take: ['oriented', 'material'], role: ['N>J'], show: 'canine' },
]

/** Affixes that make an ACTION or a MANNER. */
const TO_ACTION: Array<Affix> = [
  { form: '-ize', join: 'kind', take: ['make'], show: 'nationalize' },
  { form: '-ise', join: 'kind', take: ['make'], show: 'nationalise' },
  { form: '-ify', join: 'kind', take: ['make'], show: 'clarify' },
  { form: '-fy', join: 'kind', take: ['make'], show: 'liquefy' },
  { form: '-en', join: 'kind', take: ['make', 'become'], role: ['J>V', 'N>V'], show: 'harden' },
  { form: '-ate', join: 'kind', take: ['make'], role: ['N>V', 'J>V'], show: 'activate' },
  { form: 'en-', join: 'kind', take: ['make', 'put', 'give'], show: 'endanger' },
  { form: 'em-', join: 'kind', take: ['make', 'put', 'give'], show: 'embody' },
  { form: 'be-', join: 'kind', take: ['make', 'put'], show: 'befriend' },
  { form: '-ly', join: 'kind', take: ['manner'], role: ['J>R', 'N>R', 'V>R'], show: 'creatively' },
  { form: '-ally', join: 'kind', take: ['manner'], show: 'historically' },
  { form: '-ably', join: 'kind', take: ['manner'], show: 'reasonably' },
]

/**
 * Prefixes and the comparisons, from `code/prefix.ts`.
 *
 * These put the resolved word in the MARK position, so the head is
 * whatever the affix attached to. `unhappy` is `not + happy` and the head
 * is `happy`, which is why the join is a compound whenever the resolved
 * word is a base: the head came off the base list like any other.
 */
const FRONT: Array<Affix> = [...PREFIX, ...COMPARISON].map(one => ({
  form: one.form,
  join: one.family === 'kind' ? ('kind' as const) : ('compound' as const),
  take: [one.take],
  show: one.show,
}))

/** `un-` is `not` on a feature and `undo` on an action, and only the role says so. */
FRONT.push({
  form: 'un-',
  join: 'kind',
  take: ['undo'],
  role: ['V>V', 'V>N'],
  show: 'untie',
})

export const AFFIX: Array<Affix> = [
  ...ACTION_TO_THING,
  ...TO_THING,
  ...TO_FEATURE,
  ...TO_ACTION,
  ...FRONT,
]

/**
 * Look an affix up, narrowed by the role pair.
 *
 * Several entries may share a form, and the role pair is the only thing
 * that tells them apart. An entry with no `role` answers for any pair, so
 * it is tried last: a specific entry always beats a general one, or
 * `-ing` would be the act even where it plainly makes an adjective.
 */
const BY_FORM = new Map<string, Array<Affix>>()
for (const entry of AFFIX) {
  const at = BY_FORM.get(entry.form)
  if (at) at.push(entry)
  else BY_FORM.set(entry.form, [entry])
}

export function readAffix(
  form: string,
  from: string,
  to: string,
): Affix | undefined {
  const every = BY_FORM.get(form)
  if (!every) return undefined
  const pair = `${from}>${to}`
  return every.find(one => one.role?.includes(pair)) ?? every.find(one => !one.role)
}

/** Every affix string the table knows, for a coverage report. */
export function eachAffixForm(): Array<string> {
  return [...BY_FORM.keys()]
}
