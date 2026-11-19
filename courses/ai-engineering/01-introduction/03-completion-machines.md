# Two kinds of language models

@concept
## Two ways to guess a token
Language models come in two main types. The difference is which tokens they may look at when they guess.

A **masked** model guesses a missing token from both sides.

An **autoregressive** model guesses the next token from the left side only.
---
@concept
## Masked language models
A masked model is trained to fill in the blank, anywhere in the text, using context before and after it.

Given "My favorite __ is blue", it should guess "color".

The best-known one is **BERT** (2018). Masked models are used for jobs that don't generate text: sentiment analysis, text classification, and tasks that need the whole context, like finding a bug in code from the lines before and after it.
---
@concept
## Autoregressive language models
An autoregressive model only looks back. It learns to guess the **next** token from what came earlier, as in "My favorite color is __".

It can keep going: predict a token, add it, predict the next one. That is how it writes whole answers.

They are also called **causal** language models. They are the standard choice for generating text, so they are far more popular.
```diagram
masked:
My favorite __ is blue

autoregressive:
My favorite color is __
```
---
@concept
## In this book
Unless it says otherwise, "language model" in this book means an autoregressive model.
---
@concept
## Generative AI
A model has a fixed, limited vocabulary, but it can combine tokens into endless different outputs.

A model whose output is open-ended like this is called **generative**. That is where the name **generative AI** comes from.
---
@concept
## A completion machine
You can think of a language model as a machine that completes text.

You give it a text, the **prompt**. It continues it, the **completion**.
```diagram
prompt:
To be or not to be

completion:
, that is the question.
```
Completions are guesses based on probabilities. They are not guaranteed to be correct. This is what makes these models both exciting and frustrating.
---
@concept
## Many tasks are completions
A lot of work can be written as "finish this text".

Translation: "How are you in French is ..." can complete to "Comment ça va".

Classification: "Is this email spam? Here's the email: ... Answer:" can complete to "Likely spam". Now the model is a spam filter.
---
@concept
## Completing is not chatting
A pure completion machine doesn't know it should answer you.

Ask it a question, and it may just continue with another question, because that is a likely continuation.

Making a model reply properly to requests is done in **post-training**, covered in chapter 2.
---
@quiz
## Which model type does ChatGPT-style text generation use?
- [ ] Masked
- [x] Autoregressive
- [ ] Neither, it looks up answers
> Autoregressive models predict the next token from the previous ones, again and again. That is how they generate text.
---
@quiz
## You need to find a bug using the code before AND after a line. Which type fits better?
- [x] Masked, because it uses context from both sides
- [ ] Autoregressive, because it only reads the left side
> Masked models see both sides of the gap, which helps with tasks that need the whole context.
---
@quiz
## You type a question into a raw completion model. What might it do?
- [ ] Always answer correctly
- [x] Continue with more text, maybe another question, instead of an answer
- [ ] Refuse to reply
> A raw model only continues text. Answering properly is taught later, in post-training.
