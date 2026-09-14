# hack

Throwaway experiments. Nothing here is part of the project, and nothing here
is meant to keep working.

Nothing under `code/`, `make/` or `test/` imports anything from here, so the
project builds and checks without any of it.

## depth.ts

**Question.** How expensive is it to reach an everyday concept from the
bottom, if everything has to be built from abstract first principles?

```
pnpm depth
pnpm depth bird dog water
```

Needs Open English WordNet, which is not shipped here because it is large
and separately licensed. Download `english-wordnet-2024.xml.gz` from
<https://github.com/globalwordnet/english-wordnet/releases>, then put it at
`data/english-wordnet.xml.gz` or run with `WORDNET=<path> pnpm depth`.

**Answer.** The mean over eighteen everyday words is 7.1 steps of "is a kind
of", so roughly 28 letters per ordinary concept and 52 for `robin`. That is
the measurement behind [`note/home.md`](../note/home.md) and the argument
for a second, human-scale tree.

## letter-meaning.ts

**Question.** Can each of the sixteen letters carry meaning, so a four-letter
base READS as a four-concept expression instead of being an arbitrary number
spelled in consonants?

```
pnpm hack
pnpm hack bktr wsmn
```

**Proposal tested.** Each position asks a different question and each letter
answers it. Four positions, sixteen answers each, 64 meanings in all, and
`16^4` readings, which is exactly the size of the space.

```
1  realm      mind number form body time craft life stillness
              force feeling action sense thought world light motion
2  force      gather bound shape bear touch cut breathe rest
              pour stir drive soften pierce wrap join turn
3  manner     warm sharp firm full brief hard open calm
              swift deep bright faint thin wide smooth rough
4  standing   whole part kind one mark tool source state
              flow trace act shade idea field path cycle
```

The per-letter senses come from Tune's sound-meaning work and the essay at
<https://cluesurf.substack.com/p/tune>, then get specialised per position.

### What happened

**The readings are good.** This is the part that surprised me.

```
rlkm   motion join hard whole
dzrt   form drive rough mark
thcf   time breathe thin flow
bzvv   body drive deep trace
zwls   action wrap smooth state
```

Every one of those is a phrase you could hang a concept on, produced with no
lookup at all. As a generator this works.

**The match against what is already allocated is 4.8%**, which is chance.

```
allocated bases:  147
any word shared:  7
rate:             4.8%
```

That number is not a refutation. The 147 bases were allocated by block and
counter, so their spellings were never meant to mean anything. The test
measures the conflict rather than the idea.

### The real finding

**You cannot have block allocation and full compositionality at the same
time, and the reason is worth stating plainly.**

If all four letters carry meaning, then a base's meaning is *forced by its
spelling*. There is no freedom left to assign one. `xwzb` means "sense wrap
bright one" whether or not anybody wants a concept there. The space stops
being 65,536 slots you can fill and becomes 65,536 readings you have to
accept, and most of them are nonsense.

**A fully compositional Code is a generator, not a vocabulary.**

### The middle path, which looks right

Make the first two letters compositional and leave the last two as a counter.

```
slot 1   realm     16 domains        compositional
slot 2   force     16 per domain     compositional
slot 3   counter   256 per shelf     free
slot 4   counter                     free
```

That gives **256 semantically named shelves**, each holding 256 free slots.
`bk..` is the body-cut shelf, and everything on it is about cutting bodies,
but which of the 256 a given concept gets is still a decision somebody makes.

This costs nothing, because **block allocation already does slot 1**. The
block letter IS the realm. The only new commitment is slot 2.

### What to check next

- Do the 132 kinds fall naturally onto a realm-force grid, or were they only
  ever a flat list.
- Is 16 realms the right cut, or does the vocabulary want 8 broad ones with
  more room each.
- Whether slot 2 should be `force` at all. `realm + kind` may be more useful
  than `realm + force`, since `kind` is already a settled inventory of 132.

### Why this matters beyond being cool

A base you can read is a base you can *check*. If `bktr` is supposed to be
about bodies and it is filed under something else, the spelling says so. That
turns a naming convention into a validator, which is the same trick the block
scheme already plays, one level finer.
