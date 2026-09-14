# Order, heads and context

**Order says which part is the head. It cannot say what the other parts
have to do with it.** Those are two different jobs and only one of them is
free.

## The head is last

```
cow food        a food
food cow        a cow
```

One rule, every compound. If a category word is said at all it is said
last, which is the same rule: the category word IS the head, so
`mdm tks` is an action for exactly the reason `cow meat` is a meat.

## What order cannot do

**English has one slot and five relations in it.**

```
dog house       a house FOR a dog
dog food        food FOR a dog
dog show        a show OF dogs
dog bite        a bite BY a dog
dog years       years MEASURED BY a dog
```

Same order, same head rule, five unrelated relations, and nothing on the
page distinguishes them. A reader recovers them from knowing about dogs and
houses, which is exactly the knowledge a notation is supposed to not
require.

**Chinese does not escape it.** 牛肉 is `cow` + `meat` and reads as beef,
but the work is done by 肉 meaning *flesh*. Put 牛 in front of 奶 and you
get milk, in front of 皮 and you get leather. The left-hand character is
doing nothing but naming a cow in all three.

**So the relation needs a morpheme, and there is no ordering trick that
replaces one.** With `n` parts there are `n - 1` gaps, and each gap can hold
any relation at all. Order is one bit of information per gap at best, which
is nowhere near enough.

## The kinds are the relation vocabulary

**This is what the 132 kinds are for.** Choose a head that names the
relation and the ambiguity never arises.

```
cow meat        beef              meat    its flesh as food
cow skin        leather           skin    its skin
cow young       calf              young   its young
cow home        byre              home    where it lives
cow agent       rancher           agent   one who does it
cow waste       manure            waste   what it leaves
cow place       pasture           place   where it is
```

**`food` is a bad head, and not because of word order.** It is a substance
kind sitting where a relation kind was wanted. `meat` carries the material
relation inside it, so `cow meat` needs no bracket and no marker.

That is the whole answer to beef: it is `cow meat`, two words, six letters.

### And the gap the exercise found

**There is no kind for "what it eats".** The 132 have `meat`, `skin`,
`waste`, `home` and `young`, so five of the six relations a farm animal
stands in can be written and the sixth cannot. `cattle feed` has no head to
take.

That is a real hole rather than a quibble, because the same missing
relation covers `birdseed`, `fuel`, `fodder` and every `X food` in the
language. It is the sort of thing only turns up by trying to write a
specific compound, which is the argument for working through them one at a
time rather than admiring the inventory.

## Context is punctuation, not a category

**Considered and rejected: making one of the four dimensions
`context / main`.** It would have let the word itself say which part was the
modifier, with no grouping marks needed anywhere.

**It fails the test the other three passed.** A category is a claim about
the CONCEPT, true in every use of it. Water is stuff alone, stuff in a
compound and stuff on Tuesday. But being the context is a fact about the
POSITION:

```
cow meat        cow is the modifier
milk cow        cow is the head
```

**Same concept, two answers.** Put that in the category and `cow` needs two
codes, and resolving which one you meant requires reading the rest of the
compound. A word's code has to be stable or it is not an identifier.

This is the same line that ruled out `actual / potential`: a category has to
be decidable by a mechanical test on the concept itself, and anything that
needs the surrounding sentence is syntax rather than ontology.

**So context is carried by punctuation**, outside the words entirely, and
the fourth dimension stays `individual / collection`.

## What punctuation has to do

**Only one thing: say where a group begins and ends.** Head-final plus
grouping is enough to write any tree, because the last part of a group is
its head and a group can hold a group.

```
cow meat soup           ambiguous without grouping
(cow meat) soup         a soup made of beef
cow (meat soup)         a meat soup belonging to a cow
```

**Flat order already reads left to right as modifier before head**, so the
brackets are needed only where the intended tree is not the default one.
The default is that everything modifies the last part, which is the
commonest case by a wide margin and so costs nothing to write.

**Not settled.** Which mark, and whether the default nesting should be
left-branching or flat. Both are decisions about the written form rather
than about the code, which is why they can wait.
