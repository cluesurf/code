# How specific a base is allowed to be

**Broad types get a stem. Subclasses get a compound.**

With only 4,096 stems, spending one on `granite` is spending one of 4,096
slots on a kind of rock, when `rock` is already there and the compound is
free. The budget is what forces the question, but the answer is right
regardless: a notation that mints `granite`, `basalt`, `slate` and `marble`
separately has not modelled rock at all.

## The three levels

```
too broad          entity, object, physical entity
GOOD               tree, plant, bush, leaf, flower
                   metal, rock, soil, fruit
GOOD               frog, moss, bee, moth, volcano, grass, grain, medicine
too specific       granite, orchid, iron, melon, oak, pine, aspirin
```

**The middle two both get stems and the ends do not.** The top is useless
because nothing is said with it. The bottom is a compound waiting to be
written.

```
granite     a kind of rock
oak         a kind of tree
pine        a kind of tree
melon       a kind of fruit
orchid      a kind of flower
aspirin     a kind of medicine
iron        a kind of metal
```

**Every one of those reads as `<something> <base>` already**, in English, on
the page, which is the tell.

## The test

**A word is too specific when one of its own hypernyms, a hop or two up, is
also a base and is said far more often.**

Both halves are needed and neither works alone. Measured against WordNet's
hypernym tree and SUBTLEX frequency, per million words:

```
word       nearest base ancestor    hops   its rate   theirs   ratio
granite    rock                     3      1.59       86.16    54x
pine       tree                     3      6.20       65.00    10x
oak        wood                     1      5.61       27.00     5x
melon      fruit                    2      4.27       21.73     5x
bee        insect                   2     10.35        3.16     0.3x
moth       insect                   2      2.27        3.16     1.4x
frog       animal                   4     11.82       45.49     4x
```

**Depth alone fails.** `melon` and `bee` are both two hops under a base, and
one is a subclass while the other is not.

**Frequency alone fails.** `frog` is four times rarer than `animal` and is
still exactly the word people reach for.

**Together they work.** Drop a word when a base ancestor sits within three
hops AND is said at least twice as often. `granite`, `pine`, `oak` and
`melon` all go; `bee` survives because `insect` is three times RARER than it
is; `moth` survives at 1.4x; `frog` survives because `animal` is four hops
away.

### And then two more conditions, each paid for

**Running it turned up two ways the tree lies**, and the rule needed a
guard for each. The count is what to watch:

```
depth and ratio only          2,532 cut
  then: nouns only            1,196 cut
  then: no unique beginners     972 cut
  then: cap raised to 240     1,347 cut
```

**Verbs are out.** WordNet's noun hierarchy is a real taxonomy, so an oak
IS a tree and nothing is lost by writing it as one. Its verb hierarchy is
troponymy, which is much looser: `walk` is filed under `move` and `whisper`
under `speak`, but neither is a compound of its parent, because the parent
does not carry the manner that IS the word. Pruning on it took `cause` (96
words), `act` (80) and `state` (69), all wrongly. Adjectives have no
hypernyms in WordNet at all.

**Unique beginners are out.** `noun.Tops` is WordNet's own list of the roots
of the noun tree, and `state`, `matter`, `cause`, `thing`, `amount`, `form`
and `time` are all in it. Everything is under one of those, so letting them
prune took 58, 32, 32, 18, 24, 19 and 15 words respectively, every one of
them a word that is not a subclass of anything.

**After both, the reasons read as taxonomy rather than as noise:**

```
herb 23   tree 22   water 17   structure 17   noise 17   force 17
drink 16  wood 13   bird 13   organ 12   land 12   area 12
```

### Why this is the right shape

**It is the basic-level category, which is a measured thing rather than a
taste.** Rosch found people default to one level of abstraction: they say
`dog`, not `mammal` and not `retriever`. That level is the one named by the
shortest word, learned first by children, and reached for fastest in
naming. Frequency is a proxy for all three, which is why it separates `bee`
from `melon` when depth cannot.

## Where it does not decide

**`iron` is 17.94 against `metal` at 19.45, a ratio of 1.09, so the rule
keeps it and the judgement is that it should go.** The rule is doing what it
was asked and the ratio genuinely is not there: iron is nearly as common a
word as metal.

Cases like this are a hand list, and the hand list is short. What matters is
that the rule handles the long tail, not that it handles everything.

## What this buys, in slots

**A domain spends most of its budget below the basic level.** The commonest
`noun.plant` words run out of broad types by about the fortieth and the rest
is species: `macadamia`, `mulberry`, `brier`, `absinthe`, `artichoke`.

**So the prune pays for itself twice**: it drops 1,347 subclasses AND it
lets the cap go from 150 to 240, because the extra depth now buys broad
types rather than more species. The shape of the result says the same
thing:

```
before pruning, cap 160        after pruning, cap 240
  plant     160                  plant      79
  animal    160                  animal    157
  body      160                  body       81
  food      160                  food       73
```

**`plant` halved and `animal` barely moved.** Plant vocabulary is nearly all
species below a handful of broad types; animal vocabulary keeps producing
basic-level words much further down. That is a fact about the two domains
rather than about the rule, and it is the sort of thing the count tells you
and a judgement call does not.

Where the freed slots are still needed: `manner` at 2, `frame` at 9 and
`weather` at 10.

## A note on how Chinese does it

**It does not mint them either.** The pattern is visible right through
`china.compound`:

```
蜜蜂    bee             sweet + 蜂
黄蜂    wasp            yellow + 蜂
火山    volcano         fire  + mountain
西瓜    watermelon      west  + melon
```

**蜂 is the base and both the bee and the wasp are built from it**, one as
the sweet one and one as the yellow one. Mandarin spends a morpheme on the
genus and none on the species, which is the same rule arrived at
independently, by a language with 3,500 characters facing the same budget.

It also shows the rule biting where English resists: `watermelon` is a west
melon and `volcano` is a fire mountain, and neither needs a stem.
