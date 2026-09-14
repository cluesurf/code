# Why sixteen and four

## Why sixteen letters

**Because sixteen is one hex digit**, and four hex digits is two bytes. A
base fits in a `uint16`, an array index, a bitfield, a database column. No
other alphabet size gives that for free.

**Consonants only**, for two reasons that both matter.

A base can never accidentally spell a word in a language that uses vowels, so
no concept arrives carrying a meaning nobody gave it. Any alphabet including
vowels will eventually produce something obscene or absurd in some language,
and then that slot is unusable.

And the vowels stay free. That is what lets Tune take a base and add grammar
to it without touching the base. A base is a skeleton, and the vowels are
where the flesh goes.

## Which sixteen

Tune has twenty-two consonants. Code keeps sixteen and drops six.

```
kept     m n d b t k h s f v z x c w l r
dropped  q g p j C y
```

The six that go are the ones hardest to tell apart across accents, or hardest
to type: `q` is the `-ng` and cannot start a word, `C` is the voiced `th`
against `c` for the voiceless one, `j` is the `s` of measure, and `p`, `g`
and `y` are the least distinct of what is left.

**This has a cost worth writing down.** The dropped six carry meaning in the
sound-meaning scheme: `g` is generate, `p` is pluck, `q` is oneness, `j` is
smooth, `C` is relation, `y` is will. If Code ever makes its letters carry
meaning, those six senses have to be rehomed or given up. See
[`sound.md`](sound.md).

## Why four letters

**Because `16^4` is 65,536, and that is the right order of magnitude.**

```
16^2      256   too few, not a language
16^3    4,096   the low end of a working vocabulary, with no room
16^4   65,536   a full vocabulary and room for four times more
16^5  1,048,576 more slots than there are concepts worth naming
```

A working vocabulary is 4,000 to 16,000 bases. Three letters would fit that
and leave nothing over. Five would leave so much over that the ceiling stops
exerting any pressure.

## Why a ceiling at all

**The ceiling is the feature.**

A notation that can always grow one more letter never has to decide what
belongs in it. It ends up holding everything, which is the same as holding
nothing, and every consumer has to handle unbounded names.

With 65,536 slots, giving one to a concept is a real decision. Nothing else
in the project forces that decision to be made, and it is the decision the
whole thing depends on.

## What a fixed width buys

- **Every concept is the same size.** No concept is longer than another, so
  none is quietly more important.
- **It sorts.** Alphabetical order and numeric order are the same order.
- **It parses trivially.** Four letters, no delimiter, no escaping, no
  ambiguity about where one base ends and the next begins. A string of
  twelve letters is three bases and can only be three bases.
- **It is checkable.** Wrong length, or a letter outside the alphabet, and
  the value is not a base. Most malformed input is caught by counting.
