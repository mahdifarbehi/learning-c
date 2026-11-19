# Language models and tokens

@concept
## What a language model is
A **language model** holds statistics about a language: how likely each word is to appear in a given context.

Given "My favorite color is __", an English language model should guess "blue" far more often than "car".

Early language models knew one language. Today one model can know many.
---
@concept
## An old idea
Using language statistics is centuries old.

In a 1905 Sherlock Holmes story, Holmes cracks a code of stick figures. E is the most common letter in English, so the most common figure must be E.

In 1951 Claude Shannon published a famous paper on predicting English text, building on his wartime code-breaking work. Ideas from it, like **entropy**, are still used in language modeling.
---
@concept
## Tokens
A model doesn't read words or letters. It reads **tokens**.

A token can be a character, a whole word, or a piece of a word like "-tion". Each model decides how to split.

GPT-4 splits "I can't wait to build AI applications" into 9 tokens. "can't" becomes two: `can` and `'t`.
---
@concept
## Tokenization
Splitting text into tokens is called **tokenization**.

For GPT-4, an average token is about ¾ of a word. So 100 tokens is roughly 75 words.

This matters because APIs charge, and limit input size, by tokens, not words.
```diagram
100 tokens ≈ 75 words
```
---
@concept
## Vocabulary
The set of all tokens a model knows is its **vocabulary**.

A small set of tokens can build a huge number of words, the same way 26 letters build every English word.

Mixtral 8x7B has 32,000 tokens. GPT-4 has 100,256. The model's developers choose the tokenizer and the vocabulary size.
---
@concept
## Why tokens, not characters?
Tokens keep meaning that single characters lose.

"cooking" can split into `cook` and `ing`. Each piece carries part of the meaning. The single letters `c`, `o`, `o`... carry almost none.
---
@concept
## Why tokens, not words?
There are far fewer unique tokens than unique words. A smaller vocabulary makes the model more efficient.

Tokens also handle words the model has never seen. A made-up word like "chatgpting" can split into `chatgpt` and `ing`, so the model still gets the idea.

Tokens sit in the middle: fewer units than words, more meaning than characters.
---
@concept
## Other languages cost more
Tokenizers are usually best at English. In other languages, such as Persian, one character can take several tokens.

So the same sentence can cost more tokens, more money and more time outside English.
---
@quiz
## About how many words fit in 300 GPT-4 tokens?
- [ ] 100
- [x] About 225
- [ ] 400
> One token is about ¾ of a word, so 300 tokens is roughly 225 words.
---
@quiz
## A model meets a word it has never seen. What usually happens?
- [ ] It fails with an error
- [ ] It skips the word
- [x] The tokenizer splits it into smaller known pieces
> Splitting unknown words into known pieces, like `chatgpt` + `ing`, is one of the main reasons models use tokens.
---
@quiz
## What is a model's vocabulary?
- [ ] Every word in the training data
- [x] The fixed set of tokens the model can work with
- [ ] The words a user is allowed to type
> The vocabulary is the model's set of tokens, chosen by its developers. GPT-4's has 100,256.
