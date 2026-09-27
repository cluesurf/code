<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <img src='https://github.com/cluesurf/code/blob/make/view/code.svg?raw=true' height='222'/>
</p>

<h3 align='center'>code</h3>
<p align='center'>
  A distinct semantic registry Λ
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

## A base is a vibe

**This is the central claim, and everything else follows from it.** A
base is not a verb and not a noun. It is a generalized experience, and
it is called a **vibe**.

English cannot write one down. Take `discuss`. That word arrives already
shaped as a verb, with a doer, a thing done to, and a tense. To get at
the experience itself you have to strip all of that off, and English
gives you nothing to write the remainder in.

```
discuss        the verb
discussion     the verb plus a noun ending
discussant     the verb plus a person ending
```

**The thing all three share has no name in English.** That is the mental
baggage: every English root drags a part of speech behind it, and you
cannot put the root down without it.

In Code the bare experience is the base, and the class is a separate
word.

```
mmmm            experience, the bare vibe, no class at all
mmmm mmzz       to experience
mmmm mmss       an experience
mmmm mmww       experiencingly
mmmm mmdd       experiential
```

**To make a verb you write the vibe and then the action class.** Four
letters and four letters. A verb is eight letters, a noun is eight
letters, and neither is privileged over the other.

The five classes add no meaning at all, which is what separates them
from the kinds.

```
mmzz  action   says the vibe as a doing            Tune -i
mmss  object   says the vibe as a thing            Tune -a
mmww  manner   says the vibe as a way of doing     Tune -e
mmdd  design   says the vibe as a feature          Tune -o
mmkk  cradle   says the vibe as an orientation     Tune -u
```

Tune does the same job with a single vowel, because Tune has to be short
enough to say out loud. Code has no such constraint and pays four
letters for perfect uniformity.

**This is where the kinds earn their place.** Once the base is a bare
vibe, "what kind of thing is the noun" becomes a real question with 132
answers.

```
<vibe> mndn    the process of it
<vibe> mndd    one occurrence of it
<vibe> mndb    what it leaves behind
<vibe> mddm    one who does it
```

English writes all four of those as `discussion` or `discussant` and
leaves the reader to work it out. That is not the reader's failing.
Nothing in the word says which, and no common English suffix carries
fewer than eight distinct concepts.

Longer, in [note/vibe.md](note/vibe.md).

## Universal or human

**Code is human and Earth oriented on purpose.** `bird` is a
foundational concept here, not a derived one, even though nothing in
physics or logic makes birds fundamental.

The reason is length. A code built only from abstract first principles
has to reach everyday concepts by descending through every category
above them, and that descent is long. Measured against WordNet's chain
of "is a kind of" steps:

```
robin    13   redbreast < thrush < oscine < passeriform bird < bird <
              craniate < chordate < animal < being < animate thing <
              unit < object < physical entity < entity
dog      13   dog < canid < carnivore < eutherian < mammal < craniate < ...
mother   12   female parent < parent < genitor < primogenitor < ...
bird      9   bird < craniate < chordate < animal < being < ...
```

**The mean across eighteen everyday words is 7.1 steps**, so about 28
letters to say an ordinary thing and 52 to say `robin`. Run it yourself
with `pnpm depth`.

A universal code that says exactly what a bird is would be correct and
unusable. Correctness is not the constraint that bites. Length is.

**So there are two trees**, each running general to specific, differing
in where the root is planted.

```
mesh   plants at the universal top and descends
       entity, matter, life, animal, bird, robin

home   plants at ordinary human experience and descends
       bird, robin
```

`mesh` stops at what is true regardless of who is looking. `home` stops
at what a human on Earth already has a word for without being taught.
Neither is a rival to the other: a definition wants `mesh` and a
sentence wants `home`.

**Every home concept carries its mesh expansion**, and that bridge is
what keeps the human tree from being arbitrary. Anything short can be
said at length, so nothing is only sayable in the parochial tree.

**`home` is built and `mesh` is not.** 9,463 concepts are allocated in
the human tree. The universal tree is empty, which is the honest order
to do it in: `home` is what makes the project usable and `mesh` is what
makes it true.

Longer, with the costs and the open questions, in
[note/home.md](note/home.md).

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

Four of the sixteen blocks are in use.

```
m   structure   152    the ontology, the five classes, the 132 kinds
n   home        480    the foundational bases, what other concepts use
d b t  home   8,983    every other base
k   link        495    what Mandarin composes with and English has no word for
```

**10,110 allocated, 55,426 free.** Block `m` holds one shelf per group.

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

## Three letters and a category

**A base is three letters of identity and one of category.**

```
    x y z  .  c

    xyz    the stem, one of 4,096
    c      the category, one of 16
```

The category is not free. It is four yes-or-no questions about the
concept, and each one is decided by a test rather than by
interpretation.

```
1  object or action            does part of it happen before the rest
2  type or instance            can it have instances
3  independent or dependent    could it exist with nothing to inhere in
4  unit or stuff               is part of it still it
```

Four bits, most significant first, so the category is a number from 0 to
15 and the letter is that number.

```
 0  m   object  type      independent  unit     dog, leaf, person
 1  n   object  type      independent  stuff    water, air, iron
 2  d   object  type      dependent    unit     blood type, leg count
 3  b   object  type      dependent    stuff    height, mass, age
 4  t   object  instance  independent  unit     Socrates, Paris, the UN
 5  k   object  instance  independent  stuff    this water, that sand
 6  h   object  instance  dependent    unit     her blood type
 7  s   object  instance  dependent    stuff    her height

 8  f   action  type      independent  unit     knock, arrival, sneeze
 9  v   action  type      independent  stuff    running, burning, waiting
10  z   action  type      dependent    unit     number of steps
11  x   action  type      dependent    stuff    speed, duration, tempo
12  c   action  instance  independent  unit     the 1969 landing
13  w   action  instance  independent  stuff    this afternoon's running
14  l   action  instance  dependent    unit     how many times it knocked
15  r   action  instance  dependent    stuff    how fast this one went
```

**The first eight letters are objects and the last eight are actions**,
which falls out of putting the biggest cut in the highest bit.

**4,096 words**, which is where working languages settle: Chinese basic
literacy is 3,500 characters and Arabic and Hebrew run on 2,000 to 3,500
three-consonant roots. **A list of 4,096 has an end.** Somebody can
decide to learn it and one day be done.

**Every word is three letters. There is no fourth position and no
suffix.**

```
1 word     3 letters     xyz
2 words    6 letters     xyz xyz
3 words    9 letters     xyz xyz xyz
```

**The last word is the head.** `sandfly` is a fly, `birdsong` is a song.

**A category is a word like any other, said after what it applies to.**

```
mdm        create
mdm tks    create-action, which English writes as "create"
mdm mss    create-object, the thing made
```

Sixteen of the 4,096 are the categories, and they are spent out of the
same budget as everything else. Saying one is optional: a word alone is
the concept with no claim made about its category, which is the normal
case.

**That makes the category system and the compound system one thing.**
`mdm tks` is an action for exactly the reason `cow meat` is a meat.

The whole thing, with examples for all sixteen and the tests that decide
each question, is in [note/category.md](note/category.md).

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
base/word/base       3,838   THE 4,096. Three letters, one hex digit each
base/word/derive    71,476   every derived concept, one row per join
base/word/affix        165   which English affix realises which operator
base/word/fold         272   words that look derived. A queue, not a verdict

base/base              152   the structure: ontology, classes, kinds
base/home/base.base    480   the foundational bases
base/home/base       8,983   every other base
base/home/link         492   compounds, as the bases they are made of
base/link/chinese.base 1,308 Mandarin morphemes, each pointing at a code
base/link/chinese.link 5,302 Mandarin compounds, as their parts

code/base.ts     the alphabet, and the conversion between a base and a number
code/word.ts     the three-letter space, and how block `m` is cut
code/affix.ts    the operator table. The one hand-written file
code/prefix.ts   what each English prefix already is
make/word.ts     allocates the 4,096
make/derive.ts   builds every derived concept from them
code/join.ts     composition: structure and application, parser and serializer
code/table.ts    writes every file as a CSV and an aligned TXT
make/check.ts    the gate
make/distill.ts  does every home base earn its address, asked of Tune
make/seed.ts     how base/base.csv was first written. Run once, not again
make/fill.ts     how the home tree and the links were allocated. Also once

base/home/distill    every home base with its verdict, worst first
```

**Every file is written twice**, as a `.csv` and as a column-aligned
`.txt`. The CSV is the source of truth and is what gets edited. The TXT
is regenerated from it and is what gets read. They are never edited
apart.

**A compound gets no code of its own.** It IS its parts, and giving it
an address would mean the same concept had two.

```
name        code       parts
father      mkdn nnbl  male + parent
girlfriend  nmnm nmnw  girl + friend
bathroom    nmlf nmnz  bath + room
```

**The `parts` column is a flat list, and a flat list cannot say which
parts group together.** `small + bath + room` is two different concepts
depending on where the bracket falls, and nothing in that column
distinguishes them. A handful of characters do, with no brackets:

```
nmhn-nnmd-nmnr    (small + bath) + room
nmhn-nnmd~nmnr    small + (bath + room)
mmmm∘mmzz         the action class over the vibe, to experience
nnmd-nmnr∘mmss    the object class over the whole of bath-room
```

`-`, `~` and `·` are three levels of grouping, `∘` applies one complete
expression to another, and `+` ends the word. A base keeps its address
when it becomes an operand, which is the property that matters here.
Every mark has an ascii spelling too, so the same compound is
`nnmd-nmnr*mmss` where the other characters cannot go.

The specification is [note/join.md](note/join.md), and it is one parser
for both layers: the same notation writes English concept trees and code
trees.

**A Mandarin morpheme shares a code where English already has the
concept**, and takes a new one where it does not. 813 of 1,308 are
shared, which is a rough measure of how much of Mandarin's composing
vocabulary English also treats as basic.

```
code  chinese  english  how
dmss  人        person   shared
dmwt  学        learn    shared
kmmm  不        no       new
```

**A name may repeat across layers, and must not repeat inside one.**
`heart` is a kind meaning the centre of something and a home base
meaning the organ. Those are two concepts that share an English
spelling, not one concept listed twice, so they hold two codes. Checking
the name globally would force them to merge, which is a wrong claim
rather than a tidy one. 116 home bases shadow a kind's name this way.

The ontology is the exception. `experience`, `vibe`, `tone`, `link`,
`beat`, `weave`, `self`, `balance`, `mind` and `fill` really are the
same concept in both places, so they hold one code and appear once, in
`base/base`.

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
pnpm distill            does every home base earn its address
pnpm distill --commit   write base/home/distill.csv and .txt
```

**The two ask different questions and neither covers the other.**
`check` asks whether the FILE is well formed: one code per meaning, no
stray letters, no repeats. It says nothing about whether a concept
deserves a code. `distill` asks only that, and can answer only for the
4,086 home bases Tune knows about at all, which is why the unexamined
5,477 are reported as their own number rather than folded into a pass.

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

**Early, but no longer empty.**

```
settled     the format, the alphabet, the five classes, the 132 kinds
settled     how a compound is written as a tree, beyond the pair
built       the home tree, 9,347 concepts with permanent codes
built       492 English compounds and 5,302 Mandarin ones
empty       the mesh tree, every one of it
open        the compound files still record flat pairs, not trees
open        whether the letters themselves carry meaning
```

**The home tree is allocated but not reviewed concept by concept.** It
was carried over in bulk from work that reviewed the English side, and
the question of whether each one deserves a permanent address in 65,536
has been answered wholesale rather than one at a time.

**`pnpm distill` turns that admission into a number.** It asks Tune's
hand distillation, which judges English words one at a time into `base`,
`compound` or `name`, what it thinks of every home base.

```
  home bases              9,563
  addresses to reclaim      266

   251  JUDGED A COMPOUND     first = order one, lunch = midday meal
    15  JUDGED NOT A CONCEPT  sir, troy, benjamin, goliath, iodine
  5477  UNKNOWN TO TUNE       never examined, which is the larger fact
   824  in english.csv, unjudged
  2994  seated in tune        it earns the address
```

**The 266 are defects and the 5,477 are not.** A base judged a compound
holds an address for something that IS its parts, which is the one thing
the compound rule forbids, because then one concept has two addresses.
The seven worst are ordinals and fractions: `first`, `second`, `third`,
`fourth`, `fifth`, `half` and `quarter` all hold permanent codes, and an
ordinal is `inverse` plus the number. `sir` is the single highest-load
defect at 964.47 and is not a concept at all.

The full table is [base/home/distill.csv](base/home/distill.csv), worst
first, one row per home base. Nothing is moved by it: an address stays
where it is until a person retires it, because that is a decision about
a permanent identity rather than a cleanup.

## Notes

- [the category letter, and the sixteen](note/category.md)
- [composition, structure and application](note/join.md)
- [order, heads, and where context lives](note/order.md)
- [how specific a base is allowed to be](note/depth.md)
- [the first four thousand stems](note/stem.md)
- [a base is a vibe](note/vibe.md)
- [two trees, universal and human](note/home.md)
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
