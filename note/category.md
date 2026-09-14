# The category word

**Four distinctions. Sixteen categories. Each one a word.**

Every word in Code is three letters from a sixteen-consonant alphabet.
There are no suffixes and no fourth position.

```text
xyz

xyz = one word, one of 4,096
```

A category is not a letter attached to a stem. **It is one of the 4,096
words, and you say it after the word it applies to.**

```text
mdm        create
tks        action

mdm tks    create-action, which English writes as "create"
```

The first word says **what concept**. The second says **what form of that
concept**. Both are ordinary words and either can appear alone.

The category is determined by four independent binary distinctions:

```text
OBJECT       ↔ ACTION
INDEPENDENT  ↔ DEPENDENT
UNIVERSAL    ↔ PARTICULAR
INDIVIDUAL   ↔ COLLECTION
```

Together, four binary distinctions produce:

```text
2 × 2 × 2 × 2 = 16 categories
```

Sixteen of the 4,096 words are the category words. They are spent out of
the same budget as everything else, because they are not special.

## Why this is not a fourth letter any more

**The earlier design gave every word a fourth letter carrying the
category**, which made the space `4,096 × 16 = 65,536` and made a word
four letters long. Three things were wrong with it.

**The category was compulsory.** Every word had to answer all four
questions, including the ones its concept has no opinion about. Writing
`dog` meant asserting sixteen bits' worth of ontology whether or not
anybody had checked it.

**It was a second mechanism for something the language already had.**
A compound is head-final: `cow meat` is a meat. `mdm tks` is an action for
exactly the same reason, so the category system and the compound system
turn out to be one thing rather than two.

**It cost a letter on every word, forever**, to carry information that is
usually obvious and occasionally wrong.

Now the category is said only when it needs saying, and when it is said it
is said the same way everything else is said.

---

# 1. Object ↔ Action

The first distinction asks:

**Is the concept something, or is it something happening?**

An **object** exists or persists.

An **action** occurs or unfolds.

```text
OBJECT                  ACTION

dog                     run
person                  think
water                   flow
fire                    burn
food                    eat
growth                  grow
death                   die
movement                move
speech                  speak
```

"Object" is used broadly here. It does not mean only a physical object.

Objects can include:

```text
dog
person
water
idea
language
number
place
time
knowledge
```

Likewise, "action" is broad. It includes not only deliberate actions but
events, processes, states, and changes:

```text
run
fall
rain
sleep
know
exist
grow
die
become
```

The distinction is therefore approximately:

```text
OBJECT    something conceived as being

ACTION    something conceived as happening
```

This also allows closely related concepts to occupy opposite sides:

```text
OBJECT                  ACTION

movement                move
growth                  grow
death                   die
thought                 think
speech                  speak
knowledge               know
```

---

# 2. Independent ↔ Dependent

The second distinction asks:

**Can the concept stand on its own, or must it be a feature of something
else?**

An **independent** concept can be conceived as a thing or happening in
its own right.

A **dependent** concept requires some object or action that bears it.

For objects:

```text
INDEPENDENT             DEPENDENT

dog                     height
rock                    mass
person                  age
apple                   color
water                   temperature
```

There can be a dog.

But there cannot simply be "a height" without something having that
height.

For actions:

```text
INDEPENDENT             DEPENDENT

run                     speed
wait                    duration
sing                    volume
move                    direction
burn                    intensity
```

There can be running.

But speed is the speed **of** some movement.

This produces an important four-way foundation:

```text
                        INDEPENDENT       DEPENDENT

OBJECT                  dog               height
ACTION                  run               speed
```

This is also where many concepts expressed as adjectives and adverbs
naturally enter the system.

```text
red       dependent on an object
tall      dependent on an object
old       dependent on an object

quickly   dependent on an action
slowly    dependent on an action
loudly    dependent on an action
```

The system therefore does not need **noun, verb, adjective, and adverb**
as fundamental conceptual categories.

Those are grammatical ways languages express deeper conceptual
distinctions.

---

# 3. Universal ↔ Particular

The third distinction asks:

**Is this a general concept that can have instances, or one specific
instance?**

A **universal** can apply to indefinitely many instances.

A **particular** identifies one specific instance.

For objects:

```text
UNIVERSAL               PARTICULAR

person                  Socrates
city                    Paris
mountain                Mount Shasta
planet                  Earth
dog                     this dog
river                   the Nile
```

For actions:

```text
UNIVERSAL               PARTICULAR

birth                   her birth
earthquake              the 1906 earthquake
landing                 the 1969 Moon landing
knock                   this knock
conversation            our conversation yesterday
```

Dependent concepts can make the same distinction:

```text
UNIVERSAL               PARTICULAR

height                  this tree's height
mass                    this rock's mass
speed                   this run's speed
duration                this meeting's duration
```

This gives proper names a natural place in the system.

```text
DOG                     universal
FIDO                    particular
"Fido"                  name referring to that particular

MOUNTAIN                universal
MOUNT SHASTA            particular
"Mount Shasta"          name referring to that particular
```

But **particular does not mean named**.

```text
this dog
that rock
the person over there
yesterday's storm
the first sound I heard
```

are all particulars even if they have no proper name.

Names are simply one important way of referring to particulars.

---

# 4. Individual ↔ Collection

The fourth distinction asks:

**Is the concept conceived as one member, or as multiple members taken
together?**

An **individual** is conceived as one unit.

A **collection** is conceived as multiple units forming a group,
plurality, sequence, or larger whole.

For objects:

```text
INDIVIDUAL              COLLECTION

tree                    forest
person                  crowd
soldier                 army
ship                    fleet
animal                  herd
star                    star cluster
```

For actions:

```text
INDIVIDUAL              COLLECTION

step                    walk
knock                   knocking
battle                  war
note                    melody
race                    tournament
transaction             trading activity
```

The distinction does not simply mean singular versus plural.

```text
three trees
```

can simply mean three individuals.

A:

```text
forest
```

conceptualizes multiple trees as a collection.

Likewise:

```text
three battles
```

need not constitute a collection concept.

A:

```text
war
```

can conceptualize many related battles and other actions as one
organized collection of actions.

So the distinction is approximately:

```text
INDIVIDUAL
one conceptual member or occurrence

COLLECTION
multiple members or occurrences considered together
```

---

# The four dimensions together

The complete system is:

```text
1. OBJECT       ↔ ACTION
2. INDEPENDENT  ↔ DEPENDENT
3. UNIVERSAL    ↔ PARTICULAR
4. INDIVIDUAL   ↔ COLLECTION
```

They answer four different questions:

```text
OBJECT / ACTION
What kind of existence does it have?
Something, or something happening?

INDEPENDENT / DEPENDENT
Can it stand on its own?
Or must it characterize something else?

UNIVERSAL / PARTICULAR
Is it a general kind?
Or one specific instance?

INDIVIDUAL / COLLECTION
Is it conceived as one?
Or as multiple members taken together?
```

---

# The sixteen categories

Four binary distinctions generate sixteen combinations:

```text
 0  object   independent   universal    individual
 1  object   independent   universal    collection
 2  object   independent   particular   individual
 3  object   independent   particular   collection

 4  object   dependent     universal    individual
 5  object   dependent     universal    collection
 6  object   dependent     particular   individual
 7  object   dependent     particular   collection

 8  action   independent   universal    individual
 9  action   independent   universal    collection
10  action   independent   particular   individual
11  action   independent   particular   collection

12  action   dependent     universal    individual
13  action   dependent     universal    collection
14  action   dependent     particular   individual
15  action   dependent     particular   collection
```

## The words themselves

**The numbering above is the four bits read in order**, most significant
first, and it is what the sixteen words are allocated from. The words are
reserved out of the low end of the space so the bits are legible in the
code itself:

```text
    bit 3   object 0   action 1
    bit 2   independent 0   dependent 1
    bit 1   universal 0   particular 1
    bit 0   individual 0   collection 1
```

**They are still one of the 4,096 and they are still ordinary words.**
Nothing about a category word makes it different in kind from `dog`. It
sits in a reserved block so the ordering is readable, and that is the only
concession.

**Four of the sixteen are worth naming as the ones actually said often**,
because they are the ones a speaker reaches for:

```text
object      independent universal individual   the default thing
action      independent universal individual   the default happening
feature     object dependent universal         a property
manner      action dependent universal         how something happens
```

The other twelve are said when the situation calls for them, which is
rarer, and are exactly as available.

---

# Examples of all sixteen

## 0. Object · Independent · Universal · Individual

A general kind of independently existing individual.

```text
dog
person
tree
house
star
word
```

---

## 1. Object · Independent · Universal · Collection

A general kind of collection.

```text
forest
crowd
army
fleet
herd
family
```

---

## 2. Object · Independent · Particular · Individual

One specific independent object.

```text
Socrates
Paris
Earth
Mount Shasta
this dog
that house
```

This is the primary category for named objects.

---

## 3. Object · Independent · Particular · Collection

One specific collection.

```text
this crowd
this forest
this family
that fleet
this herd
```

---

## 4. Object · Dependent · Universal · Individual

A general property of an individual object.

```text
height
mass
age
color
temperature
shape
```

---

## 5. Object · Dependent · Universal · Collection

A general property of a collection.

```text
population
composition
diversity
density
distribution
average age
```

---

## 6. Object · Dependent · Particular · Individual

One particular object's particular property.

```text
this person's height
this rock's mass
this dog's age
Earth's radius
this apple's color
```

---

## 7. Object · Dependent · Particular · Collection

One particular collection's particular property.

```text
this forest's density
this crowd's size
this population's average age
this fleet's composition
this herd's distribution
```

---

## 8. Action · Independent · Universal · Individual

A general kind of individual action or occurrence.

```text
run
jump
knock
arrive
explode
sneeze
die
```

This is the core **verb-like** category.

---

## 9. Action · Independent · Universal · Collection

A general kind of action composed of multiple actions.

```text
travel
war
conversation
campaign
performance
ceremony
tournament
```

---

## 10. Action · Independent · Particular · Individual

One specific action or occurrence.

```text
this jump
that knock
her birth
the 1906 earthquake
the 1969 Moon landing
```

---

## 11. Action · Independent · Particular · Collection

One particular collection of actions.

```text
this conversation
World War II
yesterday's journey
this performance
that campaign
```

---

## 12. Action · Dependent · Universal · Individual

A general property of an individual action.

```text
speed
duration
direction
intensity
tempo
manner
```

This is the core **adverb-like property-of-action** category.

---

## 13. Action · Dependent · Universal · Collection

A general property of a collection of actions.

```text
frequency
rhythm
repetition rate
sequence
coordination
synchrony
```

---

## 14. Action · Dependent · Particular · Individual

A property of one particular action.

```text
this run's speed
this meeting's duration
this explosion's intensity
this movement's direction
this song's tempo
```

---

## 15. Action · Dependent · Particular · Collection

A property of one particular collection of actions.

```text
this song's rhythm
this conversation's turn rate
this war's battle frequency
this performance's timing
this journey's average speed
```

---

# The basic semantic map

The first two dimensions give the system its most important foundation:

```text
                         INDEPENDENT       DEPENDENT

OBJECT                   dog               height
ACTION                   run               speed
```

The third dimension then separates kinds from instances:

```text
UNIVERSAL                            PARTICULAR

dog                                  Fido
height                               Fido's height

run                                  this run
speed                                this run's speed
```

And the fourth separates individual concepts from collections:

```text
INDIVIDUAL                           COLLECTION

tree                                 forest
person                               crowd

battle                               war
knock                                knocking sequence
```

All four can therefore be layered:

```text
DOG
object / independent / universal / individual

FOREST
object / independent / universal / collection

FIDO
object / independent / particular / individual

THIS FOREST
object / independent / particular / collection


HEIGHT
object / dependent / universal / individual

POPULATION DENSITY
object / dependent / universal / collection

FIDO'S HEIGHT
object / dependent / particular / individual

THIS FOREST'S DENSITY
object / dependent / particular / collection


RUN
action / independent / universal / individual

JOURNEY
action / independent / universal / collection

THIS RUN
action / independent / particular / individual

THIS JOURNEY
action / independent / particular / collection


SPEED
action / dependent / universal / individual

RHYTHM
action / dependent / universal / collection

THIS RUN'S SPEED
action / dependent / particular / individual

THIS PERFORMANCE'S RHYTHM
action / dependent / particular / collection
```

---

# Grammar is downstream

These categories are **not parts of speech**.

English may express them using nouns, verbs, adjectives, adverbs, names,
possessive constructions, or entire phrases.

For example:

```text
red
redness
be red

slow
slowness
slowly
be slow

speed
fast
quickly
move quickly
```

These surface forms can point toward closely related underlying
concepts.

The conceptual system instead asks what the concept **is**:

```text
object or action?
independent or dependent?
universal or particular?
individual or collection?
```

This lets grammatical realization be handled separately.

A language could express the same underlying concept as a noun where
another language expresses it as a verb, adjective, adverb, or
construction.

---

# The address space

With a sixteen-letter alphabet and three letters to a word:

```text
16³ = 4,096 words
```

**That is the whole vocabulary.** Not 4,096 stems times something. Four
thousand and ninety-six words, of which sixteen are the categories.

```text
4,096   words in total
   16   of them are categories
   16   are the digits
4,064   are left for everything else
```

The category is written as a second word:

```text
mdm        create
mdm tks    create-action
mdm mss    create-object, the thing made
```

The first word answers:

**What?**

The second answers:

**In what conceptual form?**

And the second is optional. A word on its own is the concept with no claim
made about its category, which is the normal case and the useful default.

## Nothing is mandatory

A word does not have sixteen forms waiting to be filled in. It has however
many forms anybody has had reason to say.

For one word, perhaps only:

```text
xyz            the bare concept
xyz mss        as an independent universal individual object
```

For another, the action forms dominate. For another, the dependent ones.

The sixteen categories are not sixteen derivations per word. They are a
**four-dimensional coordinate system**, and a coordinate is given when it
matters and left out when it does not.

## What it costs to lose the fourth letter

**The space is sixteen times smaller: 4,096 rather than 65,536.** That is
the real price and it should be stated plainly.

What buys it back is that the old space was mostly unusable. Of the 65,536
addresses, 61,440 were a stem in a category nobody had checked, which is
not vocabulary, it is combinatorics. The 4,096 are all real words.

**Length pays for it too.** Every word got shorter by a letter, and a two
word compound went from eight letters to seven including the space, or six
without:

```text
before     xyzc xyzc      8 letters
after      xyz xyz        6 letters
```

So saying the category explicitly costs three letters, and not saying it
saves one on every word in the language.

---

# In one table

```text
AXIS            0               1

form            object          action
dependence      independent     dependent
scope           universal       particular
multiplicity    individual      collection
```

Or simply:

```text
OBJECT       / ACTION
INDEPENDENT  / DEPENDENT
UNIVERSAL    / PARTICULAR
INDIVIDUAL   / COLLECTION
```

Four binary distinctions.

Sixteen conceptual categories.

Sixteen words, said after the word they apply to, and left out whenever
there is nothing to say.
