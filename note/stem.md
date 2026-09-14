# The first four thousand

**A first pass at the 4,096 stems.** It stands at 4,052 across 48 domains,
so 44 slots are unspent.

```
stem.candidate.csv     the list, and what gets edited
stem.candidate.txt     the same list, column aligned
stem.pruned.csv        the 1,347 dropped as subclasses, with what dropped
                       them, for review
modifier.csv           every word English uses to modify a compound
```

Built by `pnpm tune:all`, which runs the five steps in dependency order:
`base-build`, `hanzi`, `concept`, `modifier`, `domain`.

## Why frequency alone picks the wrong 4,096

**Take the commonest 4,096 English words and you get no colours, no
numbers, and almost no body.** `Thing`, `way` and `time` come first, and
`nostril`, `seven` and `purple` never arrive, because the words a
vocabulary cannot do without are said rarely and needed constantly.

So this cuts by domain first and takes the commonest of each, which is how
a vocabulary is actually built rather than how a corpus is sorted.

## The four sources

```
wordnet   3,243     the commonest of each open domain
modifier    383     words English reaches for to modify a compound
hand        294     closed sets, listed out in full
kind        132     the last-word endings, already reviewed
```

### kind

**The 132 endings every compound in the language is built with**, from
`note/library/tune/concept/kind.csv`. `act`, `process`, `event`, `result`,
`agent`, `place`, `tool`, `meat`. A candidate list without these is not
usable, because they are what everything else gets combined with, and
because they are the vocabulary that names the RELATION in a compound. See
`order.md`.

### hand

**Thirteen closed sets, listed in full because they are small, complete,
and WordNet files their members under whatever they happen to denote.** Nine
are taken from Tune's own term pages, which already settled them.

```
math        41    add, tree, graph, network, metric, circle, group, ring
size        28    the gradable pairs: big/small, hot/cold, near/far
number      26    sixteen digits, the count words, the magnitudes
measure     24    the SI units, plus the customary ones people still say
clock       22    second to year, and the day's own parts
colour      20    sixteen plus the four metals
call        20    hello, sorry, ouch, shh, taken as concepts
direction   18    relative, temporal and cardinal, kept apart
sound       16    the twelve notes and what they are heard inside of
vibe        15    the Tune ontology
worth       15    good, bad, clean, dirty, strong, weak
logic       14    and, or, not, if, all, some, cause
frame        9    the notation's own four dimensions, said in it
```

**`number` is 26 and not 16.** Sixteen digits, because sixteen is the base
of the notation itself, then the five count words that turn a digit into a
use of it and the five magnitudes.

```
order two       second
time two        twice
count two       double
bind two        pair
inverse two     half
```

**`direction` keeps three systems apart and does not merge them.** Eleven
relative, which is what a body has, five temporal, and four cardinal, which
is a learned second system rather than a fact about anybody.

**`molecule` exists because no lexfile holds the chemistry.** WordNet splits
it between `noun.substance` for the materials and `noun.body` for the
biochemicals, so `epinephrine`, `hormone` and `collagen` file beside
`elbow`. They are molecules, and a molecule is not a part of a body the way
an elbow is.

### wordnet

**Thirty-three open domains, from WordNet's own `lexfile`**, which is a
45-way hand classification of every sense and the only large one that
exists. Cap is 240 per domain.

**`adj.all` was not wired up at first and that was a hole**, because
`noun.attribute` gives `height` and `beauty` while nothing gave `tall` and
`beautiful`, and those are different concepts rather than two spellings of
one. It is the `quality` domain now, and it fills its cap.

**`adj.pert` is deliberately NOT read.** Those are the relational
adjectives, each derived from a noun that is already a base: `nasal` from
nose, `dental` from tooth, `solar` from sun. Minting a stem for each would
spend 3,663 of the 4,096 on words the notation builds for free.

### modifier

**`blackbird` cannot be built unless `black` is already a base.** A word
used to modify many different heads has earned a stem by USE, which is a
different kind of evidence from anybody's judgement about what a vocabulary
needs, and the two disagreeing is the interesting part.

19,191 compound uses across 3,584 distinct modifiers. The commonest:

```
white 159   water 139   common 133   black 127   red 124
sea    98   blue   92   air     91   high  88   small  88
```

**This is the only source that ignores the per-domain cap**, because the
evidence is about the word and not about how crowded its domain is. It put
`iron`, `stone`, `bone`, `star`, `milk` and `war` into the list, none of
which the domain pass had reached.

Free for multiword lemmas, because WordNet writes them with underscores and
the boundaries are already marked. No splitting heuristic is involved, so
none of the `doctor = doc + tor` failures can happen.

## Pruning the subclasses

**1,347 words dropped because they are a kind of something already in the
list.** `granite` is a kind of rock, `pine` a kind of tree, `melon` a kind
of fruit, and each reads as `<something> <base>` already.

The rule, and why it needs all four parts, is in `depth.md`. In short: drop
a word when a base ancestor sits within three hypernym hops AND is said at
least twice as often AND is not a WordNet unique beginner AND the word is a
noun.

```
pine    < tree      granite < rock      trout  < fish
oak     < wood      melon   < produce   eagle  < bird
salami  < sausage   uranium < element   sherry < wine
```

**Each of the four conditions was added because dropping it broke
something**, and the numbers are worth keeping:

```
depth alone                      2,532 cut, including `wedding` under `act`
adding the frequency ratio       still wrong: verbs cut under `cause`, `state`
restricting to nouns             1,196, still cut under `matter`, `thing`
excluding unique beginners       972, and the reasons read as real taxonomy
```

**Verbs are excluded on purpose.** WordNet's noun hierarchy is a real
taxonomy, so an oak IS a tree and nothing is lost by writing it as one. Its
verb hierarchy is troponymy, a much looser relation: `walk` is filed under
`move` and `whisper` under `speak`, but neither is a compound of its parent,
because the parent does not carry the manner that IS the word. Pruning on it
took `cause` (96 words), `act` (80) and `state` (69), all wrongly.

**It is about 90% right and the other 10% is why the list is written out.**
`kitchen < room` and `secretary < head` are both in there and both wrong.

## Three things that go wrong upstream

### Sense order files rare words under big domains

**WordNet ranks senses WITHIN an entry and says nothing between entries**,
so reading "the first sense" really means "whichever part of speech appears
first in the file". That filed `go`, `honey`, `boss` and `key` as
adjectives once `adj.all` was added.

**Fixed by demanding the file agree with the base list's own reviewed
role**, and reading the first lexfile that does. `iron` finds its noun
entry rather than its adjective one.

A separate residue needs a list rather than a rule: `tuna` files as a
prickly pear, `chess` as a grass, `queen` and `molly` as animals. 87 such
words are skipped by name.

### A derivation that never happened

**`flower` and `medicine` were missing from the base list entirely**, and
nothing noticed, because MorphyNet relates `flow -> flower` by `-er` and
`medic -> medicine` by `-ine`, so both were cut as chains.

`exclude.tsv` already existed for exactly this failure and `base-build.ts`
was not reading it. It is now, in all three places it cuts: the
derivational table, the inflectional table, and the last guard that strips
endings itself. Surveying the rest of the cuts by frequency turned up nine
more of the same shape, `happy` under `hap` and `business` under `busy`
among them.

**Worth remembering as a shape: the bug was silent, and what surfaced it
was a person reading the list and asking where flower was.**

### Believing the wrong dictionary about Chinese

**Every sense in the Mandarin export carries a `source`, and the ranking
between them decides whether the table is usable.**

```
no source at all   the export's own primary gloss. Always right
unihan, cedict     character dictionaries. Right about the character
wiktionary         usually right
open-english-wordnet   a dictionary of ENGLISH synsets that Chinese was
                       mapped onto afterwards
```

**WordNet's first entry is whichever English synonym sorts first in the
synset**, so it is a real member of a set the character really maps to and
useless as a gloss. Believe it and 中 is `eye`, 生 is `dead`, 学 is `con`.

**Then over-correcting broke it the other way.** Ranking the character
dictionaries first made 黄 read as `fall through` and 绿 as `chlorine`,
because those are the next senses each lists after the one the export had
already got right. The sourceless gloss wins outright.

```
黄   yellow          not `Kangxi radical 201`, not `surname`, not `fall through`
绿   green           not `chlorine`
中   central         not `eye`
生   life, living    not `dead`
学   learn           not `con`
```

## What is not in it yet

**44 slots, and three known gaps.**

```
Mandarin morphemes with no English word
    china.base now holds 22,592 characters that mean something, up from
    1,308, and the ones with no English stem are the ones worth minting

the ontology's reserved codes
    32 low slots per shelf, already held back by the allocator

the four cells the sixteen categories do not hold
    abstracta, fiction, collections, measures. See category.md
```

## Running it

```
WORDNET=<file.xml.gz> pnpm tune:all          all five, in order
WORDNET=<file.xml.gz> pnpm tune:domain       just the last step
```

**The order is a dependency and not a convention.** Each step writes what
the next one reads:

```
base-build   concepts.csv + WordNet + MorphyNet   -> data/base.tsv
hanzi        the Mandarin export                  -> data/china.*.tsv
concept      every data/*.tsv                     -> the published tables
modifier     base.csv + WordNet multiwords        -> modifier.csv
domain       base.csv + kind.csv + modifier.csv   -> stem.candidate.csv
```

`WORDNET` is a WN-LMF XML release, gzipped, which is where `lexfile` and the
hypernym tree come from. `EXPORT` points at the corpus export directory and
`CONCEPT` at the directory holding `base.csv` and `kind.csv`; both default
to their place in this repo. A missing `modifier.csv` is not an error and
the other three sources stand on their own.

**`concept.ts` renders and nothing else writes a published table.** Two
scripts writing the same file meant the second one silently undid the first,
which happened here and cost an hour. `hanzi.ts` writes only `data/*.tsv`
for that reason.

Worth turning:

```
--per-domain 240      how deep to go in each open domain
--modifier-floor 8    how many distinct heads earn a modifier its stem
--prune-depth 3       how far up to look for a base ancestor
--prune-ratio 2       how much commoner that ancestor has to be
--prune-floor 5       how far below the top of the tree it must itself sit
```
