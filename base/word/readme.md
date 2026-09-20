# The words

**The 4,096, and everything built from them.** Three letters from
`mndbtkhsfvzxcwlr`, so one word is three hex digits and there is never
going to be a 4,097th.

The reasoning behind every decision here is in `note/library/code/` in the
ClueSurf notes: `standard-form.md` for which words are bases,
`derivation.md` for what everything else is, and `concept-database.md` for
how it is stored.

## Building

```bash
MORPHY=<eng.derivational.v1.tsv> WORDNET=<english-wordnet-2024.xml.gz> pnpm word
MORPHY=<eng.derivational.v1.tsv> WORDNET=<english-wordnet-2024.xml.gz> pnpm derive
```

**Neither dataset ships with this repository** and both are separately
licensed.

```text
WORDNET   Open English WordNet, WN-LMF XML, gzipped
          github.com/globalwordnet/english-wordnet/releases
MORPHY    MorphyNet, the English derivational table
          github.com/kbatsuren/MorphyNet
```

**`word` before `derive`.** The second reads `base.csv`, which the first
writes, and it refuses to run against an affix table naming a kind or a
base that does not exist.

## The files

| file | rows | what |
| --- | --- | --- |
| `english.csv` | 3,811 | INPUT. A snapshot of Tune's own base vocabulary, `deck/tune/case/v24/base/term/english.csv`. Not edited here |
| `kind.csv` | 132 | INPUT. The kinds, with `makes` and `applies`, from `note/library/tune/concept/kind.csv` |
| `base.csv` | 3,838 | the allocation. Every word that holds one of the 4,096 |
| `derive.csv` | 71,476 | every derived concept, one row per join |
| `derive.json` | 3,655 | the same rows grouped by base, one base per line |
| `affix.csv` | 165 | the operator table from `code/affix.ts`, readable without TypeScript |
| `fold.csv` | 272 | REVIEW QUEUE. Words that look derived from another word in the list. Verdicts blank on purpose |

**Every file is written twice**, as a `.csv` which is the source of truth
and a column-aligned `.txt` which is what gets read. The TXT is
regenerated and the two are never edited apart.

## base.csv

```text
code,name,group,domain,role,note
```

```text
group      count   what
--------   -----   ----------------------------------------------
vibe          15   the ontology. `mmm` is experience, which is zero
category      16   the four questions crossed, `mn` shelf
digit         16   base sixteen, because the notation is
kind         131   the head-final readings, `mb` onward
concept    3,660   everything else, blocks `n` through `r`
```

**Block `m` is the structure and the other fifteen are concepts**, packed
by domain so a domain's words sit adjacent, and inside a domain the
commonest first, so the low codes in a block are the words said most.

**`manner` holds one code and is read two ways**, as a category and as one
of the 132 kinds. They are the same concept, so a second address for it
would mean every consumer had to know both. This is the same exception the
four-letter files make for `experience`, `tone` and `link`.

## derive.csv

```text
base,code,english,from,affix,join,mark,head,settled,depth,tier,type,variant
```

**One row is one join, written head final.**

```text
creation   from create   mark create   head result   a suffix heads
nontree    from tree     mark not      head tree     a prefix marks
```

A chain of four is four rows, each naming its own parent in `from`, which
is the same shape `concept_join` holds in the database.

| column | what |
| --- | --- |
| `join` | `kind` if the head is one of the 132, `compound` if it is an ordinary base |
| `head` | the operator, or the CANDIDATES where English does not say. `-ion` is six kinds |
| `settled` | one kind, where there is only one. Blank where a person has to choose |
| `tier` | 3 in a curated lexicon, 2 attested in a large dictionary. Nothing lower is emitted |
| `type` | `ok`, or `ill` where the kind's `applies` column says it cannot apply here |
| `variant` | the other spelling of one concept: `nationalise` beside `nationalize` |

### What the numbers say

```text
71,476   derived concepts from 3,655 bases, 19.6 each
14,397   tier 3, which is what a page prints by default
57,079   tier 2, which answers "does English have a word for this"

41,159   kind joins
30,317   compound joins

56,022   settled to one kind by the affix alone
15,454   unsettled, where English names a set and not a value

54,859   pass the signature test
11,400   fail it, 17.2%, and that is evidence about the KIND
```

**The 17.2% is the number to watch and it is meant to fall.** A form that
is attested and ill typed says the kind's `applies` column is too narrow,
never that the word is wrong. Twelve pairs account for most of it and four
fixes clear them, none of which needs a new kind. The list is in
`note/library/code/derivation.md`.

## fold.csv

**272 words that look derived from another word in the base list.**
Reported, never applied.

```text
RIGHT                         WRONG
activity   <- active -ity     stop     <- top s-
location   <- locate -ion     king     <- kin -ing
information <- inform -ation  not      <- no -t
computer   <- compute -er     seed     <- see -d
```

**About half of them are wrong**, which is why the `verdict` column is
blank and why nothing reads this file. A wrong base word is permanent.
Work it by hand, twenty rows at a time.

## Known defects in the input

- **`lily` is listed twice in `english.csv`**, at lines 3247 and 3809. The
  second is dropped and reported.
- **1,100 affix strings are not in the operator table**, covering 16,155
  edges. Most are inflections the table deliberately refuses (`-eth`,
  `-s`, `-ed` and `-ing` on a verb) and technical combining forms
  (`bio-`, `photo-`, `neuro-`, `immuno-`). Adding one is one line in
  `code/affix.ts`.
