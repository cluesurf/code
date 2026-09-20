# Composition, structure and application

**Seven marks, five mechanisms, and most concepts use only three of
them.**

```text
·       join, tight, level 3
~       join, medium, level 2
-       join, loose, level 1

∘       application. X∘F is F(X)

+       word boundary, and absolute

⟨ ⟩     recursive scope, one paired mechanism
```

Each does exactly one job.

```text
· ~ -   build structure inside one expression
∘       apply one complete expression to another
+       end the word, and all application scope with it
⟨ ⟩     package an expression as one constituent
```

## Two alphabets, one notation

**Every mark has an ascii spelling, and the two say the same thing.**

```text
role            unicode   ascii
tight join         ·        .
medium join        ~        ~
loose join         -        -
application        ∘        *
word               +        +
open scope         ⟨        (
shut scope         ⟩        )
```

Only four differ. `~`, `-` and `+` are one character in both.

```text
a-b~c·d              a-b~c.d
a-b-c∘x-y-z          a-b-c*x-y-z
a∘⟨x∘y⟩              a*(x*y)
large-⟨black-bird∘many⟩-colony
                     large-(black-bird*many)-colony
```

**The parser reads either, and a mixture of the two.** It works in
roles, and a character becomes one the moment it is scanned, so nothing
downstream knows which alphabet it came from and `a.b*c` compares equal
to `a·b∘c`. A serializer picks a style and writes every mark from it, so
converting is parse and write again, and nothing is lost either way.

**Unicode is the default**, because the marks are distinct from
everything else a name can hold and read as what they are. The ascii set
is for places that cannot carry them: a filename, a shell argument, a
keyboard with no compose key.

One thing to keep straight: the analytical form below uses round
brackets for explanation, and ascii spells a scope with the same two
characters. They are never fed to each other. The analytical form does
not parse back, in either alphabet.

This notation answers the question the base files leave open. A compound
is recorded in `base/home/link.csv` as a flat list of parts, and a flat
list cannot say which parts group together. The notation here can.

## What the levels are for

The three joins have fixed precedence, and all three are
left-associative.

```text
· > ~ > -
```

Equal joins associate left, so a repeated join costs no extra level.

```text
A-B-C        (A-B)-C
A~B~C        (A-B)-C
A·B·C        (A-B)-C
A-B-C-D-E    (((A-B)-C)-D)-E
```

**A stronger join on the right nests rightward.** That is the whole
trick, and it is what removes the brackets.

```text
A-B~C        A-(B-C)
A~B-C        (A-B)-C
A-B~C·D      A-(B-(C-D))
```

**The levels solve grouping and nothing else.** `~` does not mean
modifier. It says only that this boundary binds more tightly than `-`
and less tightly than `·`. Head, possessor, classifier, argument,
agency and causation are relations, and a relation is named by a word,
never by a level. That is what the kinds are for, and it is argued in
[order.md](order.md).

So one notation holds all of these without claiming they are the same
relation.

```text
black-bird
book-store
water-source
protein-structure
```

## Why the level count is not the leaf count

Level count measures right-branching depth inside one scope. It does not
measure size.

```text
A-B-C-D-E-F-G-H-I-J          one level, ten leaves
A·B~C·D-E·F~G·H              three levels, eight leaves, balanced
A-B~C·D                      three levels, four leaves, a right comb
```

The balanced tree above is:

```text
((A-B)-(C-D))-((E-F)-(G-H))
```

Large balanced trees are cheap. Deep right combs are the only expensive
shape.

## Application, and why it is not a fourth level

`∘` cuts a word into complete structural expressions and applies each to
the one before it.

```text
X∘F          F(X)
X∘F∘G        G(F(X))
E0∘E1∘E2∘E3  E3(E2(E1(E0)))
```

**Both sides may be whole compounds**, and neither side is restricted to
a name.

```text
a∘x              x(a)
a-b-c∘x          x(a-b-c)
a∘x-y-z          (x-y-z)(a)
a-b-c∘x-y-z      (x-y-z)(a-b-c)
a-b-c∘x-y-z∘p-q-r
```

**That stability is the point.** A completed concept becomes an operand
without one character of it changing.

```text
great-white-shark
great-white-shark∘many

great-white~like-shark
great-white~like-shark∘many
```

Nothing is promoted, because no operator has a reach to argue about. The
`∘` says where the operand ends, and the operand is everything on its
side of the boundary.

```text
great-white·like-shark∘many      many((great-(white-like))-shark)
great-black·cause·process-shark∘many
```

A parser needs no knowledge of English to find the operand. Whether a
concept may act as an operator is a separate question, and it belongs to
the model rather than to the parser.

## The word boundary

`+` is absolute. No join and no application crosses it.

```text
A+B                  A B
A+B∘X                A x(B)
A-B+C-D∘X+E          A-B X(C-D) E
A-B∘X+C-D∘Y          X(A-B) Y(C-D)
great-white+shark∘many   great-white many(shark)
```

`A+B∘X` can never be `X(A+B)`. So the notation records whether something
is one lexical compound or two independent words, which is information
English spelling loses.

```text
black+bird       two words
black-bird       one compound

green+house      two words
green-house      one compound
```

If a transformation really has to consume material on both sides of a
`+`, those pieces were never two words. That belongs to a higher layer,
not to a bracket.

## Same leaves, different concept

A flat sequence is left grouped, and the other tree is stated.

```text
black-bird-house      (black-bird)-house
black-bird~house      black-(bird-house)

old-book-store        (old-book)-store
old-book~store        old-(book-store)
```

**Two trees with the same leaves never serialize to the same string.**
That is the property a permanent identifier needs.

## Recursive scope, and the two things it is for

`⟨E⟩` parses `E` as a whole expression and hands the result back as one
constituent. **Most strings should not hold one.**

**One. An application used as a constituent.** A top-level `∘` divides
the whole word, so a flat spelling cannot put an application inside a
compound.

```text
A-B∘X          X(A-B)      the application takes the compound
A-⟨B∘X⟩        A-X(B)      the application is one constituent

black-bird∘many        many(black-bird)
black-⟨bird∘many⟩      black-many(bird)

large-⟨black-bird∘many⟩-colony
```

**Two. An operator expression.** An application chain has one direction,
so `X∘Y` as an operator has to be packaged.

```text
A∘X∘Y          Y(X(A))
A∘⟨X∘Y⟩        (Y(X))(A)
```

**And one lesser use: a right comb deeper than three.**

```text
A-B~C·D            A-(B-(C-D))          three strengths, no bracket
A-B~C·⟨D-E⟩        A-(B-(C-(D-E)))      four boundaries, one bracket
```

Scopes nest without a limit, and inside each one the whole grammar
begins again.

```text
A-⟨B-⟨C-D∘X⟩-E∘Y⟩-F
```

A bracket never spans a `+`. Word segmentation and expression recursion
are orthogonal, and `+` is the outer one.

## How to avoid a bracket

A serializer reaches for `⟨ ⟩` last. In order:

**Use left association.** `⟨⟨A-B⟩-C⟩-D` is `A-B-C-D`.

**Use a stronger join for right-hand structure.** `A-⟨B-C⟩` is `A-B~C`,
and `A-⟨B-⟨C-D⟩⟩` is `A-B~C·D`.

**Let `∘` delimit complete operands.** `⟨A-B-C⟩∘X` is `A-B-C∘X`, and
`A∘⟨X-Y-Z⟩` is `A∘X-Y-Z`.

**Let `+` end the application scope.** `A+B-C∘X` already means
`A x(B-C)`, so no bracket is needed to keep `∘` out of the first word.

**Reuse an established concept.** A concept that exists is one leaf. Do
not expand every concept into its analytical parts and then complain
about the depth.

**And then the test that settles it:** if the brackets can come out and
the parser returns the same tree, the brackets were not canonical.

## Canonical form

Because levels are relative, one tree has many spellings. In isolation
all three of these are the same two-leaf tree.

```text
A-B
A~B
A·B
```

**Canonical means weakest, and fewest.** Every join takes the weakest
strength its position allows, and every bracket has to earn its place.

```text
written                canonical
A·B                    A-B
A~B~C                  A-B-C
A~B·C                  A-B~C
⟨A-B-C⟩∘X              A-B-C∘X
A∘⟨X-Y-Z⟩              A∘X-Y-Z
A-⟨B-⟨C-D⟩⟩            A-B~C·D
⟨⟨A-B⟩-C⟩-D            A-B-C-D
A-⟨B∘X⟩                A-⟨B∘X⟩        kept, removal changes the parse
A∘⟨X∘Y⟩                A∘⟨X∘Y⟩        kept, same reason
```

The procedure, once the tree exists:

1. Keep the true `+` boundaries.
2. Build the expression tree inside each word.
3. Write top-level application chains with `∘`.
4. Inside each segment, write the binary structure with `· > ~ > -`,
   taking the weakest strength each position allows.
5. Serialize an embedded expression recursively.
6. Add `⟨ ⟩` only where the grammar leaves no other spelling.
7. Remove every bracket pair whose removal leaves the parse unchanged.
8. Never move a `+`, and never alter the tree to shorten the string.

**Every tree can be written.** A join runs out of strengths and gets a
bracket; an application in a constituent position gets a bracket. There
is no tree the notation refuses, which is what the escape hatch buys.

## One thing canonicalization cannot preserve

**A strength the tree shape does not require is not recoverable.** The
serializer takes the weakest one that parses back to the same tree, so a
`·` written where `~` would do comes back as `~`.

```text
written                              canonical
great-white·like-shark               great-white~like-shark
great-black·cause·process-shark      great-black~cause~process-shark
child-two·cardinal-language-vocabulary-acquire·ordinary·process
      child-two~cardinal-language-vocabulary-acquire~ordinary~process
```

Every one of those is the same tree before and after. A tight
constituent inside a loose chain only has to beat `-`, and `~` already
does.

**So if the model wants to mark an established tight constituent as
tight, that is a fact about the model and it needs somewhere of its own
to live.** A tree with no room to carry it cannot round-trip it, and a
serializer cannot invent it. The alternative is to store the strength on
the join, which means two spellings of one tree become two trees, and
then nothing can be used as a key.

## Decompose the concept, not the spelling

```text
creator        create-agent
acquisition    acquire-process
second         two-cardinal
blacken        black-cause
blackening     black-cause-process
```

Those may be right. What makes them right is the concept, not the fact
that English spells them with a suffix. An English ending is not
evidence of a universal decomposition, and the question is always what
the concept is rather than how the word is spelled.

The same goes for hyphens and spaces. English orthography is evidence
about an English realization, not about the tree. Settle the tree first,
then write it.

## The same notation over codes

**A base is four letters and a compound is a tree of them, so the
notation applies unchanged.** The joiners are punctuation and the
alphabet is consonants, so nothing collides.

```text
nnmd-nmnr             bath + room
nmhn-nnmd-nmnr        (small + bath) + room
nmhn-nnmd~nmnr        small + (bath + room)
```

The last two are different concepts, and the flat `parts` column in
`base/home/link.csv` cannot tell them apart. This is what it would take
to record the difference.

**A class or a kind said after a base is an application.** That is
already how the base layer works, and `∘` is the character for it.

```text
mmmm∘mmzz             the action class over the vibe, to experience
mmmm∘mmss             the object class, an experience
mmmm∘mddm             the agent kind, one who does it
mmmm∘mndn∘mddm        one who does the process of it
```

And the whole-compound case needs no rewrite of the compound, which over
codes matters more than anywhere else: a base keeps its address.

```text
nnmd-nmnr∘mmss        the class takes the whole of bath-room
nnmd-⟨nmnr∘mmss⟩      the class takes only room
```

## In a URL

`+` is already the space, so a canonical string is a path segment as it
stands.

```text
/concepts/black-bird
/concepts/great-white-shark∘many
/concepts/two-cardinal-language
/concepts/child-two~cardinal-language-vocabulary-acquire~ordinary~process
/concepts/large-⟨black-bird∘many⟩-colony
```

Word boundaries, structural grouping, application and recursive scope
all survive, with no round brackets and no literal spaces. Transport
encoding is the platform's business and does not change the canonical
form.

## Test suites

Round brackets below are the analytical form, so every join is written
with one neutral `-`, and no level appears in them. A level belongs to
the spelling. Round brackets are never canonical syntax.

**Structure.**

```text
A-B-C                      (A-B)-C
A~B~C                      (A-B)-C
A·B·C                      (A-B)-C
A-B~C                      A-(B-C)
A~B-C                      (A-B)-C
A-B~C·D                    A-(B-(C-D))
A·B~C·D-E·F~G·H            ((A-B)-(C-D))-((E-F)-(G-H))
```

**Application.**

```text
A∘X                        X(A)
A-B-C∘X                    X((A-B)-C)
A∘X-Y-Z                    ((X-Y)-Z)(A)
A-B-C∘X-Y-Z                ((X-Y)-Z)((A-B)-C)
A∘X∘P                      P(X(A))
A-B-C∘X-Y-Z∘P-Q-R          ((P-Q)-R)(((X-Y)-Z)((A-B)-C))
```

**Boundary.**

```text
A+B                        A B
A+B∘X                      A X(B)
A+B-C∘X+D                  A X(B-C) D
A-B∘X+C-D∘Y                X(A-B) Y(C-D)
A-B+C-D∘X+E                A-B X(C-D) E
```

**Recursive scope.**

```text
black-bird∘many            many(black-bird)
black-⟨bird∘many⟩          black-many(bird)
A-B∘X                      X(A-B)
A-⟨B∘X⟩                    A-X(B)
A∘X∘Y                      Y(X(A))
A∘⟨X∘Y⟩                    (Y(X))(A)
A-⟨B-C∘X⟩-D                (A-X(B-C))-D
large-⟨black-bird∘many⟩-colony
                           (large-many(black-bird))-colony
```

**The two alphabets.** Each pair is one phrase, and each side is what
the other serializes to when asked for that style.

```text
unicode                          ascii
a-b-c                            a-b-c
a-b~c·d                          a-b~c.d
a-b-c~d·e                        a-b-c~d.e
a-b-c∘x-y-z                      a-b-c*x-y-z
a∘x∘y                            a*x*y
a∘⟨x∘y⟩                          a*(x*y)
a-⟨b∘x⟩-c                        a-(b*x)-c
a-⟨b-⟨c-d∘x⟩-e∘y⟩-f              a-(b-(c-d*x)-e*y)-f
a+b-c∘x+d                        a+b-c*x+d
large-⟨black-bird∘many⟩-colony   large-(black-bird*many)-colony
```

**The serializer's half.**

```text
A·B                        A-B
A~B~C                      A-B-C
A~B·C                      A-B~C
A·B·C·D                    A-B-C-D
A·B~C·D-E·F~G·H            A-B-C~D-E~F~G·H
⟨A-B-C⟩∘X                  A-B-C∘X
A∘⟨X-Y-Z⟩                  A∘X-Y-Z
⟨A-B-C⟩∘⟨X-Y-Z⟩∘⟨P-Q-R⟩    A-B-C∘X-Y-Z∘P-Q-R
A-⟨B-C⟩                    A-B~C
A-⟨B-⟨C-D⟩⟩                A-B~C·D
⟨⟨A-B⟩-C⟩-D                A-B-C-D
great-white·like-shark     great-white~like-shark
A-(B-(C-(D-E)))            A-B~C·⟨D-E⟩
A-⟨B∘X⟩                    unchanged
A∘⟨X∘Y⟩                    unchanged
large-⟨black-bird∘many⟩-colony   unchanged
```

## Formal summary

```text
CHARACTERS

·   U+00B7 MIDDLE DOT                       ascii .
~   U+007E TILDE                            ascii ~
-   U+002D HYPHEN-MINUS                     ascii -
∘   U+2218 RING OPERATOR                    ascii *
+   U+002B PLUS SIGN                        ascii +
⟨   U+27E8 MATHEMATICAL LEFT ANGLE BRACKET  ascii (
⟩   U+27E9 MATHEMATICAL RIGHT ANGLE BRACKET ascii )

ROLES

·       tight join
~       medium join
-       loose join
∘       application boundary
+       absolute word and application boundary
⟨ ⟩     recursive expression scope

ALPHABETS

a parser reads either, and a mixture
a serializer writes one, and unicode is the default
converting is parse and write again, and loses nothing

STRUCTURE

precedence      · > ~ > -
associativity   left, all three
node            binary

APPLICATION

X∘F             F(X)
X∘F∘G           G(F(X))
segmentation    A-B-C∘X-Y-Z = (A-B-C) applied to by (X-Y-Z)
not a level     it is outside structural precedence

BOUNDARY

A+B-C∘X+D       A + X(B-C) + D
nothing in · ~ - ∘ ⟨ ⟩ crosses a +

GRAMMAR

phrase      := expression ("+" expression)*
expression  := structural ("∘" structural)*
structural  := loose
loose       := medium ("-" medium)*
medium      := tight ("~" tight)*
tight       := primary ("·" primary)*
primary     := atom | "⟨" expression "⟩"

CANONICAL

the weakest strength each position allows
∘ between complete segments, never crossing a +
⟨ ⟩ only where removal would change the parse
never alter the tree to shorten the string

ROUND BRACKETS

not syntax. explanation only
```

## The mental model

```text
·       bind very tightly
~       bind tightly
-       bind loosely
∘       the complete expression before me is the operand
+       stop absolutely: new word, new application scope
⟨ ⟩     parse this whole expression and use its result as one thing
```

The architecture is deliberately asymmetric.

```text
· ~ -   make ordinary structure cheap
∘       make complete operands cheap
+       make stopping absolute
⟨ ⟩     make arbitrary recursion possible
```

Thirty-six rules, written out:

1. Meaning decides structure.
2. Spelling in any language does not decide structure.
3. `+` marks a true word and expression boundary.
4. Nothing in `· ~ - ∘` consumes structure across `+`.
5. `·` is the tightest join.
6. `~` is the middle join.
7. `-` is the loosest join.
8. Precedence is `· > ~ > -`.
9. Equal joins associate left.
10. `· ~ -` carry no relation of their own.
11. `∘` is not a fourth strength.
12. `∘` separates complete expressions taking part in application.
13. `X∘F` is `F(X)`.
14. `X∘F∘G` is `G(F(X))`.
15. Both sides of `∘` may hold complete structure.
16. `+` ends the operand available to every `∘` in the word.
17. A completed expression does not change when it becomes an operand.
18. `⟨E⟩` parses `E` and returns one constituent.
19. `⟨ ⟩` are used only inside one `+` segment.
20. Scopes nest without a depth limit.
21. Use left association before a stronger join.
22. Use a stronger join before a bracket.
23. Let `∘` delimit operands rather than bracketing them.
24. Let `+` end application scope rather than bracketing a word.
25. Use `⟨ ⟩` only where removal changes the parse.
26. Canonicalizing minimizes scope and never changes the tree.
27. Two different trees never share a canonical string.
28. Parsing never depends on intuition.
29. Validity comes from the model, after parsing.
30. An established concept is reused, not expanded into a deep tree.
31. A tree is never distorted to make its spelling fit.
32. Round brackets are analytical only.
33. Every mark has a unicode and an ascii spelling.
34. A parser reads either alphabet, and a mixture of the two.
35. A serializer writes one alphabet, and unicode is the default.
36. Converting between the alphabets changes no tree.

## Where it is implemented

```text
code/join.ts      the characters, the parser, the serializer
test/join.test.ts every case above
```
