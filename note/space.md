# The shape of the space

4,096 words, cut by the digits themselves.

```
1 letter    16 blocks      256 each
2 letters   256 shelves     16 each
3 letters   4,096 words      1 each
```

**Three letters, not four.** The fourth letter used to carry the category
and made the space 65,536. The category is a word of its own now, so a word
is three letters and there are 4,096 of them. See `category.md`.

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

147 used, 3,949 free.

## What the rest is for

**The fifteen empty blocks are empty on purpose.** The base concepts are the
part that needs iterating, and filling them now would only make them harder
to change.

**And the space is now smaller than the appetite.** The working estimate was
4,000 to 16,000 words for ordinary use, and there are 4,096. So the list
below is no longer a description of the slack, it is a description of the
competition:

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

**The scarcest thing in the space is a code you cannot forget.** Three of
the same letter is 16 of them, and that is the whole supply: a three letter
word has no mirrors, because a palindrome in three letters is `aba` and
there are only 240 of those.

They go to the ontology, by hand, and the letter is chosen so its essence
matches: `vvv` vibe, `lll` link, `www` weave, `ccc` mind, `rrr` tuning. A
pair of opposites gets a pair of palindromes, so `mfm` fill against `fmf`
will, and `mnm` oneness against `nmn` balance.

**The first 4 slots of every shelf are reserved for hand assignment.**
Counters start at 4. A shelf now holds 16 rather than 256, so the old
reserve of 32 would have taken the whole shelf twice over. It is not
optional: the first seed ran without a reserve and the phase counter took
`mnmn` out from under `tone`.

## Two rules for allocating

**Leave room.** A shelf holds 16 and a block holds 256, so a group that
outgrows its shelf spills into the block around it. The gap is the point: a
group can grow without anything moving, and a word that moves after anybody
has used it is a word with two meanings.

**A retired base keeps its slot.** If a concept turns out to be wrong, its
code is marked retired and never reused. Reusing it means old data silently
says something new, which is worse than losing one slot out of 4,096.
