# Two trees, and why one of them is about Earth

**Code is human and Earth oriented on purpose.** `bird` is a foundational
concept here, not a derived one, even though nothing in physics or logic
makes birds fundamental.

That is a deliberate choice with a cost and a reason, and this note is both.

## The problem: depth is expensive

A code built only from abstract first principles has to reach everyday
concepts by descending through every category above them. That descent is
long.

Measured against WordNet's hypernym chain, which is a rough but real count
of how many "is a kind of" steps lie between a concept and the top:

```
robin    13   redbreast < thrush < oscine < passeriform bird < bird <
              craniate < chordate < animal < being < animate thing <
              unit < object < physical entity < entity
dog      13   dog < canid < carnivore < eutherian < mammal < craniate <
              chordate < animal < being < animate thing < unit < object <
              physical entity < entity
mother   12   female parent < parent < genitor < primogenitor < ancestor <
              relation < individual < being < animate thing < unit <
              object < physical entity < entity
knife    11   knife < edge tool < cutlery < cutting implement < tool <
              implement < instrumentality < artefact < unit < object <
              physical entity < entity
bird      9   bird < craniate < chordate < animal < being < animate thing <
              unit < object < physical entity < entity
```

**The mean across eighteen everyday words is 7.1 steps.** At four letters a
step, that is about 28 letters to say an ordinary thing, and 52 to say
`robin`.

Run it with `pnpm depth`.

**A universal code that says exactly what a bird is would be correct and
unusable.** Correctness is not the constraint that bites. Length is.

## The proposal: two trees

Two codes over the same space, each a tree, each running from general to
specific, differing only in **where the root is planted**.

```
mesh    plants at the universal top and descends
             entity, matter, life, animal, bird, robin

home    plants at ordinary human experience and descends
             bird, robin
```

**Both go generic to specific.** That is not the difference. The difference
is what counts as generic enough to stop at.

`mesh` stops at what is true regardless of who is looking. It would
work for an observer with no body, no planet and no history.

`home` stops at what a human on Earth already has a word for without
being taught. Bird, tree, water, hand, fire, mother, stone. Not because
those are fundamental to the universe, but because they are fundamental to
the only speakers there are.

## What each is for

| | mesh | home |
| :--- | :--- | :--- |
| root | the universal top | ordinary experience |
| `bird` is | nine steps down | a base |
| good at | precision, independence, defining | compactness, speaking, naming |
| bad at | length | parochialism |
| answers | what is this, exactly | what is this, quickly |

**They are not rivals.** A definition wants mesh and a sentence wants
home, and those are different jobs.

## The bridge

**Every home concept carries its mesh expansion.** That is the
link that keeps home from being arbitrary.

```
home    <bird>
base    <animate> <flying> <feathered> <egg laying> <warm blooded> ...
```

The home code is short and the base expansion is what it means. A reader who
wants the compact form uses the first. A reader who needs to know exactly
what is being claimed follows the second.

**This makes home checkable.** A home concept with no base expansion is
a concept nobody has defined, and that is visible rather than implied. It
also makes home translatable: two communities with different home trees
can meet in the base tree.

## Why not just do frequency coding

Because the compactness is a consequence, not the goal.

Giving short codes to common things is an old idea and a good one. That
alone would produce a flat table of the 4,000 commonest concepts, which is
useful and has no structure.

**The point of the second tree is that it has its own hierarchy.** `robin`
descends from `bird` in home the same way it descends from
`passeriform bird` in mesh. You get the compactness AND the ability to
say "a kind of bird", which a flat frequency table cannot do.

## The honest cost

**Home-code is parochial and will date.** It encodes what a human on Earth
in this era finds obvious. Some of that is durable across every human
culture, such as hand, water, mother, fire, day. Some of it is not, such as
anything to do with a particular technology.

The defence is the bridge. Anything in home can be said in mesh,
at length, so nothing is only sayable in the parochial tree. If home
turns out to be wrong about what is obvious, mesh is unaffected.

**There is a second cost, and it is the harder one.** Two trees means two
places a concept can live, and therefore a question every time: is this
familiar enough for home, or does it belong in base. That question has no
mechanical answer and will be got wrong sometimes.

## Where they sit in the space

Not settled. Three options, none of them chosen:

**By block.** Some of the sixteen blocks are mesh, the rest are
home. Simplest, and the tree is legible from the first letter.

**By a column.** A `tree` field in the CSV, and the two interleave in the
space. More flexible, less legible.

**By two files.** `base/base.csv` and `base/home.csv`, sharing one address
space and one checker. Clearest separation, and the checker already has
everything it needs to enforce that they never collide.

The third is probably right, because it makes the two lists separately
reviewable, which is what they will need.

## Precedents worth knowing

**Chinese has a character for 鳥.** It does not compose bird out of anything.
It does compose 河馬, river horse, for hippopotamus. That is exactly the
split proposed here: familiar things get their own sign, and unfamiliar ones
get built out of familiar ones. It is the single best working demonstration
that the approach scales, and it is why
Tune's collection of Mandarin compounds is worth reading.

**Toki Pona made the opposite choice** and holds about 120 words. Everything
is composable and nothing is compact, which produces long circumlocutions
for ordinary things. It is the endpoint of a mesh with no home.

**Basic English made this choice** and holds 850. It is compact and cannot
define itself.

**Neither one has both.** Two trees with a bridge between them is the part
that has not been tried.

## What to decide next

- Which of the three layouts above.
- How deep home goes. `bird` and `robin`, or `bird` and stop.
- Whether a base expansion is required for every home concept from the
  start, or backfilled. Required is stricter and probably right, since
  backfill never happens.
- Whether the base tree is worth building at all before home proves
  itself. Home-code is the one that makes the project usable, and mesh
  is the one that makes it true.
