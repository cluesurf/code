<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <!-- <img src='https://github.com/cluesurf/code/blob/make/view/code.svg?raw=true' height='222'/> -->
</p>

<h3 align='center'>code</h3>
<p align='center'>
  A fixed-width notation for concepts Ω
</p>

<br/>
<br/>
<br/>

## Introduction

**Code** is a notation for concepts. Not a language for speaking, which
is what [Tune](https://github.com/cluesurf/tune) is for. Code is the
layer underneath: a compact, uniform, machine-first way of naming a
concept, which Tune is then derived from and maps back onto.

A concept in Code is **four letters**, always, drawn from an alphabet of
**sixteen consonants**. That is the entire format. There is no prefix,
no suffix, no variable length, and no escape hatch.

```
mmmm   experience
llll   link
mndm   act
mddm   agent
```

The whole space is `16^4`, which is **65,536 concepts**, and there will
never be a 65,537th.

## Why a fixed width

The ceiling is the feature. A notation that can always grow one more
letter never has to decide what belongs in it, and ends up holding
everything, which is the same as holding nothing.

Four letters buys five properties that a variable-length name cannot
have:

- **Every concept is the same size.** No concept is longer than another,
  so none is quietly more important than another.
- **It is two bytes.** A concept fits in a `uint16`, an array index, a
  bitfield, a column, a sprite sheet.
- **It sorts.** The letters are hex digits in order, so alphabetical
  order and numeric order are the same order, for free.
- **It has blocks.** The first letter cuts the space into 16 domains of
  4,096. The first two cut it into 256 shelves of 256. Related concepts
  can live near each other without any extra machinery.
- **It is finite, and the finiteness is the design pressure.** Deciding
  that a concept deserves one of 65,536 slots is a real decision.
  Nothing else in the project forces that decision to be made.

## The alphabet

```ts
export const CODE = 'mndbtkhsfvzxcwlr'
```

Sixteen consonants, in the order that gives each one its value.

```
m  0    t  4    f  8    c  12
n  1    k  5    v  9    w  13
d  2    h  6    z  10   l  14
b  3    s  7    x  11   r  15
```

So `mmmm` is 0, `rrrr` is 65,535, and `mnmm` is `0x0100`, which is 256.

**Consonants only.** Two reasons. A base can never accidentally spell a
word in a language that uses vowels, so no concept arrives carrying a
meaning nobody gave it. And the vowels stay free, which is what lets
Tune add grammar to a base without touching the base itself.

The sixteen are drawn from Tune's twenty-two, dropping the six that are
hardest to tell apart across accents.

## The space

```
65,536   bases in all
     1   block is 4,096, named by the first letter
     1   shelf is 256, named by the first two
```

Only block `m` is allocated so far, and only with vocabulary that was
already settled elsewhere: the ontology, and the 132 kinds a chain can
end with. One shelf per group.

```
mm   ontology     the substance and its parts
mn   phase        where on an action's arc a concept points
md   role         which participant in an action it names
mb   part         which piece of a thing it names
mt   quality      which property of a thing it names
mk   life         which living-thing relation it names
mh   body         which collective or field it names
ms   standing     what normative status it carries
mf   frame        at what remove from the thing it stands
mv   shape        how it resembles
mz   tie          what it bears or concerns
mx   amount       how much of it
mc   mode         can it, must it, does it resist
mw   aspect       when in its run
ml   do           which action it becomes
mr   way          in what manner
```

**The other fifteen blocks are empty on purpose.** The base concepts are
the part that has to be iterated, and guessing at them now would only
make them harder to change later. The working estimate is 4,000 to
16,000 to cover ordinary use, which leaves most of the space for the
things a first pass always underestimates: rocks, animals, plants,
minerals, diseases, tools, and the spiritual, religious, emotional and
experiential vocabulary that a technical list tends to skip entirely.

## Landmarks

**A landmark is a base whose spelling you cannot forget**: four of the
same letter, or a mirror that reads the same backwards. There are 16 of
the first kind and 240 of the second in the whole space, which makes
them the scarcest thing in it.

They are reserved for the ontology, and assigned by hand.

```
mmmm  experience   zero, and everything else is a pattern in it
vvvv  vibe         v is the felt, the vibration
llll  link         l is the line, the join
wwww  weave        w is the world, the weave
tttt  beat         t is the point, the step, the tick
ssss  self         s is the still held field, the surface
nnnn  other        n is the limit, the boundary, the beyond
hhhh  aware        h is the breath, the open
cccc  mind         c is thought, the pointed abstraction
rrrr  tuning       r is motion, the turning. Also the last code
```

**A pair of opposites gets a pair of mirrors.**

```
mmff  fill      the receptive pull, gathering inward
ffmm  will      the projective push, pouring outward

mnnm  oneness   the undivided whole
nmmn  balance   the coupling of the poles
```

`m` and `n` are the good and bad poles in the sound scheme, so the tone
axis is spelled out of them directly:

```
mnmn  tone      pleasure, pain, peace
```

**The first 32 slots of every shelf are left free for this.** Counters
start after them. Without that reservation the counter walks straight
over the landmarks, which is exactly what happened the first time:
`tone` wants `mnmn` and the phase shelf had already taken it.

## Files

```
base/base.csv     the bases, one per line, the source of truth
base/base.txt     the same thing, column aligned, for reading
code/base.ts      the alphabet, and the conversion between a base and its number
make/check.ts     the gate
make/seed.ts      how base.csv was first written. Run once, not again
```

The CSV and the TXT are mirrors. The CSV is edited, the TXT is rewritten
by the checker, and neither is ever edited by hand to disagree with the
other.

```
code,name,role,group,note
mmmm,experience,thing,ontology,"the one substance, all else a pattern in it"
vvvv,vibe,thing,ontology,"one quantum of experience, with a tone, at a moment"
mndm,act,kind,phase,"the bare doing, no bounds in view"
```

## Checking

```
pnpm check              what is used, what is free, and what is wrong
pnpm check --next 20    the next twenty free bases, in order
pnpm check --free h     the next free bases inside block h
```

The checker answers the one question that gets expensive to answer late:
**has this four-letter value already been given a meaning.** It also
refuses a file where a base is the wrong length, uses a letter outside
the alphabet, repeats a code, or gives two codes to the same name.

The last of those is the quiet one. Nothing breaks when a meaning gets
two codes. From then on there are simply two ways to say the same thing,
and every consumer has to know both.

## Relation to Tune

**Code is the notation. Tune is the language.** They hold the same
concepts and are converted back and forth.

```
code    mddm         fixed width, no vowels, machine first
tune    zek          speakable, inflected, carries grammar
```

Tune has to be pronounceable, which means vowels, syllable shapes, and a
vocabulary that avoids collisions in the mouth. Code has none of those
constraints, so it can be perfectly uniform. Anything Tune can say, Code
can name. Anything Code names, Tune can be given a word for.

Neither is derived from the other automatically yet. That mapping is the
next piece of work.

## Status

**Early.** The format is settled, the alphabet is settled, the checker
works, and 147 bases are allocated. The base concepts themselves are
barely started, and compounds are not specified at all.

## Notes

- [the shape of the space](note/space.md)
- [why sixteen and four](note/size.md)
- [what goes in a base](note/base.md)
- [can a letter mean something](note/sound.md)

And one experiment, in [hack](hack/readme.md): whether each letter can
carry four meanings, one per position, so a base reads as a phrase.

## License

Dual licensed, because the code and the data are different kinds of
thing.

**The code is [MIT](license.md#code).** Use it in anything.

**The data is [CC BY 4.0](license.md#data).** Use it in anything,
including commercially, and cite where it came from. The base list is
the part that takes the work, and attribution is the only thing asked in
return.

Full text in [license.md](license.md).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
