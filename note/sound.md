# Can a letter mean something

**The open question at the heart of Code.** Is a base an arbitrary number
that happens to be spelled in consonants, or does each letter carry meaning,
so that four letters read as four concepts.

If the second, a base is legible without a lookup table, and the spelling
becomes a check on the filing.

## The proposal

**Each letter has four meanings, one per position.** Sixteen letters, four
positions, 64 meanings, and `16^4` readings, which is exactly the size of the
space. Nothing is wasted and nothing overflows.

```
    realm      force    manner  standing   essence
    ---------  -------  ------  --------   -------
m  0 mind       gather   warm    whole      good
n  1 number     bound    sharp   part       bad
d  2 form       shape    firm    kind       form
b  3 body       bear     full    one        being
t  4 time       touch    brief   mark       point
k  5 craft      cut      hard    tool       make
h  6 life       breathe  open    source     breath
s  7 stillness  rest     calm    state      still
f  8 force      pour     swift   flow       flow out
v  9 feeling    stir     deep    trace      vibe
z 10 action     drive    bright  act        active
x 11 sense      soften   faint   shade      hush
c 12 thought    pierce   thin    idea       think
w 13 world      wrap     wide    field      world
l 14 light      join     smooth  path       line
r 15 motion     turn     rough   cycle      motion
```

**Each row is one essence wearing four hats**, which is what makes it
learnable. `l` is the line: light in a realm, join as a force, smooth as a
manner, path as a standing. You learn sixteen essences, not sixty-four
entries.

The essences are not invented here. They come from the sound-meaning work in
`note/library/tune/sound-meanings.md` and the Tune essay at
<https://cluesurf.substack.com/p/tune>, which assigns a felt meaning to every
consonant. Code uses sixteen of those twenty-two.

## What it reads like

```
rlkm   motion join hard whole
dzrt   form drive rough mark
thcf   time breathe thin flow
bzvv   body drive deep trace
zwls   action wrap smooth state
```

Every one is a phrase you could hang a concept on, produced with no lookup.
As a generator this plainly works.

## The problem

**If all four letters carry meaning, a base's meaning is forced by its
spelling, and there is no freedom left to assign one.**

`xwzb` means "sense wrap bright one" whether or not anybody wants a concept
there. The space stops being 65,536 slots to fill and becomes 65,536 readings
to accept, and most of them are nonsense.

A fully compositional Code is a generator, not a vocabulary.

## The middle path

**Make the first two letters carry meaning and leave the last two free.**

```
slot 1   realm     16 domains       carries meaning
slot 2   force     16 per domain    carries meaning
slot 3   counter   256 per shelf    free
slot 4   counter                    free
```

256 semantically named shelves, each with 256 free slots. `bk..` is the
body-cut shelf, and everything filed there is about cutting bodies, but which
of the 256 a concept gets is still somebody's decision.

**This costs almost nothing, because block allocation already does slot 1.**
The block letter is the realm. The only new commitment is slot 2.

## What is settled and what is not

**Settled.** The letters have essences, and those essences are stable enough
to specialise per position without straining.

**Not settled.** Whether slot 2 should be `force`. The alternative is
`realm + kind`, using the 132 kinds that are already a checked inventory,
which would tie the two halves of the project together instead of introducing
a second vocabulary.

**Not settled.** Whether sixteen realms is the right cut. Eight broad realms
with more room each may suit a vocabulary that is mostly concrete nouns.

## How it was tested

`hack/letter-meaning.ts` scores the composed reading against the meanings
already assigned. It comes out at **4.8%**, which is chance.

That is not a refutation. The 147 allocated bases were filed by block and
counter, so their spellings were never meant to mean anything. The test
measures the conflict between the two schemes rather than the worth of the
idea. It would have to be rerun after any reallocation.

## Why it matters

**A base you can read is a base you can check.** If `bktr` is supposed to be
about bodies and it is filed somewhere else, the spelling says so. That turns
a naming convention into a validator, which is the same trick the block
scheme already plays, one level finer.
