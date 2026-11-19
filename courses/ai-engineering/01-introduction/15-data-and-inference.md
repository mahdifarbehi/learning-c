# Data and inference

@concept
## Dataset engineering
**Dataset engineering** means collecting, generating and labeling (**annotating**) the data needed to train and adapt AI models.
---
@concept
## Labeling open-ended answers is hard
Traditional ML tasks are mostly **close-ended**: the output is one of a few fixed values. A spam filter outputs "spam" or "not spam".

Foundation models are **open-ended**. Labeling open-ended data is much harder: deciding whether an email is spam is easy; writing a model essay is not.

So data labeling is a much bigger challenge in AI engineering.
---
@concept
## Tables versus messy data
Traditional ML works mostly with **tabular** data, rows and columns. Its data work is mostly **feature engineering**: choosing and building the input columns.

Foundation models work with unstructured data like text and images. Data work becomes: removing duplicates, tokenization, fetching the right context, and quality control, including removing private and toxic content. Chapter 8 covers this.
---
@concept
## Data as the edge
Many argue that models are now a commodity, so data will be the main difference between products. That makes dataset engineering more important than ever.

How much data you need depends on the technique:
```diagram
training from scratch: most data
finetuning: less
prompt engineering: least
```
---
@concept
## Data tells you about a model
Even if you need little data yourself, knowing data helps.

A model's training data gives strong clues about what it's good and bad at.
---
@concept
## Inference optimization
**Inference optimization** means making models faster and cheaper to run.

It always mattered: users never complain that a model is too fast, and cheaper inference always helps. But foundation models are so big and slow that it matters even more now.
---
@concept
## One token at a time
Foundation models are usually autoregressive, so they produce tokens one after another.

If one token takes 10 ms, a 100-token answer takes a full second, and longer answers take more.
```diagram
10 ms × 100 tokens = 1 second
```
A typical web app is expected to respond in about 100 ms. Getting AI apps close to that is a big challenge, and an active research area.
---
@concept
## Tools for speed
Common inference optimization techniques include **quantization** (lower-precision weights), **distillation** (training a small model to imitate a big one) and **parallelism** (splitting work across many chips). Chapters 7 to 9 cover them.
---
@concept
## Model development, then and now
```diagram
modeling and training
before: ML knowledge required
now: nice to have

dataset engineering
before: feature engineering on tables
now: dedup, tokens, context, quality

inference optimization
before: important
now: even more important
```
---
@quiz
## Why is labeling harder for foundation models than for a spam filter?
- [ ] Spam filters need more labels
- [x] Writing a good open-ended answer is much harder than choosing from fixed options
- [ ] Foundation models can't use labels
> Close-ended labels are a choice. Open-ended labels are whole answers someone must write.
---
@quiz
## A model needs 20 ms per token. About how long does a 50-token answer take?
- [ ] 0.1 seconds
- [x] 1 second
- [ ] 20 seconds
> Tokens come one by one: 50 × 20 ms = 1,000 ms.
---
@quiz
## Which technique usually needs the least data?
- [ ] Training from scratch
- [ ] Finetuning
- [x] Prompt engineering
> Training from scratch needs the most data, finetuning less, and prompting the least.
