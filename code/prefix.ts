/**
 * English prefixes, and the word each one already is.
 *
 * THERE IS NO PREFIX FAMILY AND THERE SHOULD NOT BE ONE. This file was
 * first written as 24 "marks", a third operator family beside the 132
 * kinds, on the reading that a prefix does something a kind cannot. Then
 * the proposed names were checked against the vocabulary that exists:
 *
 *   34 proposed          32 are ALREADY a base word or one of the 132 kinds
 *                         1 is built from others      half = inverse + two
 *                         1 is genuinely missing      meta
 *
 * So a prefix is not a new kind of operator. It is an ordinary word in the
 * LEFT half of a join, which is the modifier position, exactly as `cow` is
 * in `cow meat`.
 *
 *   unhappy      not    + happy       the head is the base `happy`
 *   rebuild      again  + build       `again` is one of the 132 kinds
 *   defrost      undo   + frost       `undo` is one of the 132 kinds
 *   overcook     over   + cook        `over` is an ordinary base
 *   microclimate small  + climate     so is `small`
 *   monorail     one    + rail        a number word, and numbers are words
 *
 * That is worth the eight lines it takes to say, because the deleted
 * family would have been 24 permanent addresses spent on concepts the
 * vocabulary already held, and every one of them would have been a second
 * way to say something with an established first way.
 *
 * WHAT THIS TABLE IS FOR is reading English, which still writes these as
 * bound morphemes. `un-` has to resolve to something before `unhappy` can
 * be filed, and this says to what.
 */

/** Which family the resolved word belongs to, which decides the join. */
export type Family = 'kind' | 'base'

export type Prefix = {
  /** As MorphyNet writes it, with the trailing dash. */
  form: string
  /** The word it resolves to. */
  take: string
  family: Family
  /** One English word, so the table reads by eye. */
  show: string
  /** Only where the resolution is not obvious from the pair. */
  note?: string
}

export const PREFIX: Array<Prefix> = [
  { form: 'un-', take: 'not', family: 'base', show: 'unhappy', note: 'on a feature. On an action it is `undo`, and `readAffix` cannot tell them apart from the letters, so both readings are offered' },
  { form: 'in-', take: 'not', family: 'base', show: 'incomplete' },
  { form: 'im-', take: 'not', family: 'base', show: 'impossible' },
  { form: 'il-', take: 'not', family: 'base', show: 'illegal' },
  { form: 'ir-', take: 'not', family: 'base', show: 'irregular' },
  { form: 'non-', take: 'not', family: 'base', show: 'nonstandard' },
  { form: 'dis-', take: 'not', family: 'base', show: 'dishonest' },
  { form: 'a-', take: 'not', family: 'base', show: 'atypical', note: 'the privative a-, which is also an unrelated a- meaning `on`, as in `aboard`' },
  { form: 'an-', take: 'not', family: 'base', show: 'anaerobic' },
  { form: 'de-', take: 'undo', family: 'kind', show: 'defrost' },
  { form: 're-', take: 'again', family: 'kind', show: 'rebuild' },
  { form: 'anti-', take: 'opposite', family: 'base', show: 'antifreeze' },
  { form: 'counter-', take: 'opposite', family: 'base', show: 'counterattack' },
  { form: 'contra-', take: 'opposite', family: 'base', show: 'contraflow' },
  { form: 'pre-', take: 'before', family: 'base', show: 'preheat' },
  { form: 'fore-', take: 'before', family: 'base', show: 'foresee' },
  { form: 'ante-', take: 'before', family: 'base', show: 'antechamber' },
  { form: 'proto-', take: 'before', family: 'base', show: 'prototype' },
  { form: 'post-', take: 'after', family: 'base', show: 'postdate' },
  { form: 'mis-', take: 'wrong', family: 'base', show: 'misread' },
  { form: 'mal-', take: 'wrong', family: 'base', show: 'malformed' },
  { form: 'co-', take: 'with', family: 'base', show: 'cowrite' },
  { form: 'con-', take: 'with', family: 'base', show: 'conjoin' },
  { form: 'com-', take: 'with', family: 'base', show: 'compress' },
  { form: 'syn-', take: 'with', family: 'base', show: 'synchronise' },
  { form: 'self-', take: 'self', family: 'base', show: 'self-taught' },
  { form: 'auto-', take: 'self', family: 'base', show: 'autopilot' },
  { form: 'inter-', take: 'between', family: 'base', show: 'interweave' },
  { form: 'intra-', take: 'inside', family: 'base', show: 'intravenous' },
  { form: 'trans-', take: 'across', family: 'base', show: 'transplant' },
  { form: 'over-', take: 'over', family: 'base', show: 'overcook' },
  { form: 'super-', take: 'over', family: 'base', show: 'superimpose' },
  { form: 'hyper-', take: 'over', family: 'base', show: 'hyperactive' },
  { form: 'ultra-', take: 'over', family: 'base', show: 'ultrasound' },
  { form: 'arch-', take: 'over', family: 'base', show: 'archbishop' },
  { form: 'under-', take: 'under', family: 'base', show: 'undercook' },
  { form: 'sub-', take: 'under', family: 'base', show: 'submarine' },
  { form: 'hypo-', take: 'under', family: 'base', show: 'hypothermia' },
  { form: 'semi-', take: 'partly', family: 'kind', show: 'semicircle' },
  { form: 'demi-', take: 'partly', family: 'kind', show: 'demigod' },
  { form: 'hemi-', take: 'partly', family: 'kind', show: 'hemisphere' },
  { form: 'pseudo-', take: 'fake', family: 'kind', show: 'pseudoscience' },
  { form: 'quasi-', take: 'fake', family: 'kind', show: 'quasiparticle' },
  { form: 'micro-', take: 'small', family: 'base', show: 'microclimate' },
  { form: 'mini-', take: 'small', family: 'base', show: 'minibus' },
  { form: 'nano-', take: 'small', family: 'base', show: 'nanotube' },
  { form: 'macro-', take: 'large', family: 'base', show: 'macroeconomics' },
  { form: 'mega-', take: 'large', family: 'base', show: 'megacity' },
  { form: 'mono-', take: 'one', family: 'base', show: 'monorail' },
  { form: 'uni-', take: 'one', family: 'base', show: 'unicycle' },
  { form: 'bi-', take: 'two', family: 'base', show: 'bilingual' },
  { form: 'di-', take: 'two', family: 'base', show: 'dioxide' },
  { form: 'duo-', take: 'two', family: 'base', show: 'duotone' },
  { form: 'multi-', take: 'many', family: 'base', show: 'multilingual' },
  { form: 'poly-', take: 'many', family: 'base', show: 'polygon' },
  { form: 'pluri-', take: 'many', family: 'base', show: 'plurilingual' },
  { form: 'homo-', take: 'same', family: 'base', show: 'homogeneous' },
  { form: 'iso-', take: 'same', family: 'base', show: 'isometric' },
  { form: 'sym-', take: 'same', family: 'base', show: 'symmetric' },
  { form: 'equi-', take: 'same', family: 'base', show: 'equidistant' },
  { form: 'meta-', take: 'meta', family: 'base', show: 'metadata', note: 'THE ONE GAP. No English base word carries it and no kind does either. It wants a word of its own, and it is the only one of 34 that does' },
]

/**
 * The two comparison suffixes, which behave like prefixes in every way
 * that matters here: they resolve to an ordinary word and the head stays
 * what it was.
 *
 * `bigger` is `more big`, so the head is `big`. The `degree` KIND is a
 * different thing and makes a THING out of a feature: `intensity`,
 * `severity`, `magnitude`.
 */
export const COMPARISON: Array<Prefix> = [
  { form: '-er', take: 'more', family: 'base', show: 'bigger' },
  { form: '-est', take: 'most', family: 'base', show: 'biggest' },
  { form: '-most', take: 'most', family: 'base', show: 'topmost' },
]

const BY_FORM = new Map<string, Prefix>()
for (const one of [...PREFIX, ...COMPARISON]) {
  if (BY_FORM.has(one.form)) {
    throw new Error(`prefix ${one.form} is listed twice`)
  }
  BY_FORM.set(one.form, one)
}

export function readPrefix(form: string): Prefix | undefined {
  return BY_FORM.get(form)
}
