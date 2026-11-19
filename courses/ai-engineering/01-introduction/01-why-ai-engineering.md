# Why AI engineering took off

@concept
## One word: scale
If you had to describe AI after 2020 in one word, it would be **scale**.

The models behind ChatGPT, Gemini and Midjourney are so big that they use a real share of the world's electricity. And we may soon run out of public internet text to train them on.

This growth has two big effects. The next two cards cover them.
---
@concept
## Effect 1: models can do more
Bigger models are more capable. They handle more kinds of tasks, which means more kinds of applications.

So more people and companies use AI to work faster, make money and make life better.
---
@concept
## Effect 2: only a few can build them
Training a large language model (an **LLM**) needs huge amounts of data, compute and rare experts. Only a handful of organizations can afford that.

So those few rent their models out. You send a request to their API and get the model's answer back. This is called **model as a service**.
---
@concept
## Demand up, barrier down
Put both effects together:

More people want AI applications.

Building one got much easier, because you don't have to train a model first.

That is why **AI engineering** became one of the fastest-growing kinds of engineering. In this book, AI engineering means building applications on top of models that already exist.
---
@concept
## Not new, but different
Companies used machine learning (ML) long before LLMs: product recommendations, fraud detection, and predicting which customers will leave (**churn prediction**).

Many lessons from that time still apply. But big ready-made models bring new possibilities and new problems. Those are what this book is about.
---
@concept
## "Traditional ML"
The book uses **traditional ML** for all machine learning that came before foundation models. You will see this term often.
---
@concept
## The road to AI engineering
Chapter 1 follows a chain of steps. Each lesson covers one link.
```diagram
language models
↓ self-supervision
large language models
↓ more kinds of data
foundation models
↓ model as a service
AI engineering
```
It looks sudden, but ChatGPT and GitHub Copilot sit on top of decades of work. The first language models appeared in the 1950s.
---
@quiz
## Why can most teams build AI apps today without training a model?
- [ ] Training a big model became cheap
- [x] A few companies offer their trained models as a service, through an API
- [ ] Modern models don't need data
> Training big models is still very expensive. Most teams use a model someone else trained, through an API.
---
@quiz
## In this book, what is AI engineering?
- [ ] Designing new neural network architectures
- [ ] Training models from scratch
- [x] Building applications on top of models that already exist
> AI engineering is about using and adapting ready-made models, not about building them.
