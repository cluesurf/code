# Why sixteen and three

## Why sixteen letters

**Because sixteen is one hex digit.** A word is three hex digits, so it fits
in twelve bits and therefore in a `uint16`, an array index, a bitfield, a
database column. No other alphabet size gives that for free.

Three digits wastes four bits of the sixteen, where four digits used all of
them exactly. That is the one thing the old width did better, and twelve
bits for a word is still a better fit than any non-power-of-two alphabet
manages.

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

## Why three letters

**Because `16^3` is 4,096, and a vocabulary that size can be finished.**

```
16^2      256   too few, not a language
16^3    4,096   a working vocabulary, with nothing to spare
16^4   65,536   room for four times more than anybody will name
16^5  1,048,576 more slots than there are concepts worth naming
```

**This was four letters and 65,536 until the category stopped being a
suffix.** The fourth letter existed to carry the category, and now the
category is a word of its own, so there is nothing for a fourth letter to
do. See `category.md`.

**The tighter number is the better one and the argument was there all
along.** A working vocabulary is 4,000 to 16,000 words. 65,536 sits above
the top of that range, so the ceiling never pressed on anything. 4,096 sits
at the bottom of it, so every slot is contested, which is what forces the
decisions the whole project is about: is this a word, or is it two words?

Chinese basic literacy is 3,500 characters. Arabic and Hebrew run on 2,000
to 3,500 three-consonant roots. 4,096 is where languages that already work
this way have settled, independently, more than once.

## Why a ceiling at all

**The ceiling is the feature.**

A notation that can always grow one more letter never has to decide what
belongs in it. It ends up holding everything, which is the same as holding
nothing, and every consumer has to handle unbounded names.

With 4,096 slots, giving one to a concept is a real decision, and often the
answer is no. Nothing else in the project forces that decision to be made,
and it is the decision the whole thing depends on.

**A list of 4,096 also has an end.** Somebody can decide to learn it and one
day be done, which is not true of 65,536.

## What a fixed width buys

- **Every concept is the same size.** No concept is longer than another, so
  none is quietly more important.
- **It sorts.** Alphabetical order and numeric order are the same order.
- **It parses trivially.** Three letters, no delimiter, no escaping, no
  ambiguity about where one word ends and the next begins. A string of nine
  letters is three words and can only be three words.
- **It is checkable.** Wrong length, or a letter outside the alphabet, and
  the value is not a word. Most malformed input is caught by counting.
