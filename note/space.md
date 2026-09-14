# The shape of the space

65,536 bases, cut by the digits themselves.

```
1 letter    16 blocks     4,096 each
2 letters   256 shelves     256 each
3 letters   4,096 rows       16 each
4 letters   65,536 bases      1 each
```

**Nothing in the encoding requires this.** It is what base 16 already gives,
and using it costs nothing. Allocating by block keeps related concepts near
each other with no index, no tags and no second file.

## What is allocated

Block `m` only, one shelf per group, all of it carried over from the Tune
work where it was already settled.

```
mm   ontology     15 of 256
mn   phase        15
md   role         17
mb   part         10
mt   quality      15
mk   life          7
mh   body         16
ms   standing     10
mf   frame         9
mv   shape         5
mz   tie           4
mx   amount        5
mc   mode          5
mw   aspect        4
ml   do            8
mr   way           2
```

147 used, 65,389 free.

## What the rest is for

**The fifteen empty blocks are empty on purpose.** The base concepts are the
part that needs iterating, and filling them now would only make them harder
to change.

The working estimate is 4,000 to 16,000 bases for ordinary use. That leaves
most of the space, which is the right shape for the things a first pass
always underestimates:

```
rocks, minerals, metals, soils
animals, plants, fungi, the parts of each
diseases, injuries, remedies
tools, instruments, vessels, materials
the spiritual, religious, emotional and experiential vocabulary
  that a technical list skips entirely
```

That last line is the one to watch. A list built from a dictionary and a
frequency table will produce a good inventory of objects and a thin one of
inner life, and the thin half is not less real.

## Landmarks

**The scarcest thing in the space is a code you cannot forget.** Four of the
same letter is 16 of them. A mirror, reading the same backwards, is 240 more.

They go to the ontology, by hand, and the letter is chosen so its essence
matches: `vvvv` vibe, `llll` link, `wwww` weave, `cccc` mind, `rrrr` tuning.
A pair of opposites gets a pair of mirrors, so `mmff` fill against `ffmm`
will, and `mnnm` oneness against `nmmn` balance.

**The first 32 slots of every shelf are reserved for hand assignment.**
Counters start at 32. That costs 32 of 256 per shelf and keeps the memorable
codes available. It is not optional: the first seed ran without it and the
phase counter took `mnmn` out from under `tone`.

## Two rules for allocating

**Leave room.** A shelf holds 256 and no group here needs more than 17. The
gap is the point: a group can grow without anything moving, and a base that
moves after anybody has used it is a base with two meanings.

**A retired base keeps its slot.** If a concept turns out to be wrong, its
code is marked retired and never reused. Reusing it means old data silently
says something new, which is worse than losing one slot out of 65,536.
