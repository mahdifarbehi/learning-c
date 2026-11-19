# Self-supervision: how models got large

@concept
## Why language models?
There are ML models for many things: finding objects in photos, recommendations, weather, stock prices.

So why did language models become the ones that scaled up into ChatGPT?

Because they can learn with **self-supervision**. Most other models need **supervision**.
---
@concept
## Supervision
**Supervision** means training on **labeled** data: examples where a person wrote down the right answer.

A fraud detector, for example, learns from past payments that someone has marked as fraud or not fraud. Then it can judge new payments.

AI's big wins in the 2010s were supervised. **AlexNet** (2012), which started the deep learning boom, learned to sort over a million **ImageNet** photos into 1,000 categories like "car" or "monkey".
---
@concept
## Labels are expensive
Say one label costs 5 cents per image. A million images is $50,000.

Want two people per image to check quality? Twice that.

Want 1 million categories instead of 1,000? About $50 million.

And that is for easy labels. English-to-Latin translations cost more. Labeling cancer on CT scans needs doctors, so it costs far more.
---
@concept
## Self-supervision
In **self-supervision**, the model gets its labels from the data itself. No one has to write them.

Language modeling works this way. Every piece of text is both the question (the tokens so far) and the answer (the next token).
---
@concept
## One sentence, six lessons
The sentence "I love street food." gives six training examples. `<BOS>` is a start marker and `<EOS>` an end marker.
```diagram
<BOS> → I
<BOS> I → love
<BOS> I love → street
<BOS> I love street → food
<BOS> I love street food → .
<BOS> I love street food . → <EOS>
```
Each marker counts as one special token.
---
@concept
## Knowing when to stop
The end marker matters a lot. Learning to predict `<EOS>` is how a model knows when its answer is finished.

Without it, the model would just keep talking.
---
@concept
## Self-supervised is not unsupervised
These sound alike but differ.

**Self-supervised**: there are labels, but they come from the input itself.

**Unsupervised**: there are no labels at all.
---
@concept
## Text is everywhere
Self-supervision means a model can learn from any text with no labeling: books, blog posts, articles, Reddit comments.

That gives an enormous amount of training data. This is what let language models grow into **large** language models.
---
@concept
## Parameters
A model's size is usually counted in **parameters**. A parameter is a number inside the model that training adjusts.

In general, though not always, more parameters means more capacity to learn.

People say **weights** for all parameters today.
---
@concept
## "Large" keeps moving
There is no fixed size that makes a model "large".

In June 2018, 117 million parameters counted as large: that was the size of OpenAI's first GPT. GPT-2 (February 2019) had 1.5 billion, and 117 million suddenly looked small.

When the book was written (2024), about 100 billion parameters counted as large. That too will look small one day.
---
@concept
## Bigger models need more data
It sounds backwards: shouldn't a stronger model need fewer examples?

The goal isn't to match a small model with the same data. It is to get the best performance possible. A bigger model can learn more, so it needs more data to reach its best.

Training a big model on a small dataset wastes compute. A smaller model would do as well or better.
---
@quiz
## Why could language models scale so much bigger than most other models?
- [ ] They are simpler to program
- [x] Text provides its own labels, so no one has to label training data
- [ ] They need less compute
> Self-supervision removes the labeling bottleneck, so huge amounts of text can be used.
---
@quiz
## How many training examples come from "I love street food." with `<BOS>` and `<EOS>`?
- [ ] 4
- [ ] 5
- [x] 6
> One for each next token: I, love, street, food, the period, and `<EOS>`.
---
@quiz
## What do you get if you train a huge model on a small dataset?
- [ ] Much better results than a small model
- [x] Wasted compute: a smaller model would do about as well
- [ ] The model refuses to train
> Bigger models need more data to reach their potential. With little data, a small model is the better deal.
