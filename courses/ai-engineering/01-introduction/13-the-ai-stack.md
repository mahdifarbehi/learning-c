# The AI engineering stack

@concept
## Fundamentals over hype
AI engineering's growth brought huge hype and **FOMO** (fear of missing out). New tools, models and techniques appear every day.

Instead of chasing all of them, it's better to learn the basic building blocks, which change much more slowly.
---
@concept
## Born from ML engineering
AI engineering grew out of ML engineering. When a company starts with foundation models, its existing ML team usually leads.

Some companies treat the two as the same job. Others have separate job titles for AI engineers.

Either way, the roles overlap a lot. ML engineers can add AI engineering to their skills, and many AI engineers have no ML background at all.
---
@concept
## Three layers
Every AI application stack has three layers. You usually start at the top and go down only when needed.
```diagram
application development
↓
model development
↓
infrastructure
```
---
@concept
## Layer 1: application development
With models ready to use, anyone can build apps. This layer has seen the most activity in recent years, and it still changes fast.

The work: giving a model good prompts and the context it needs, evaluating carefully, and building good interfaces.
---
@concept
## Layer 2: model development
Tools for building models: frameworks for modeling, training, finetuning and **inference optimization** (making models faster and cheaper to run).

Data is central to models, so this layer also includes **dataset engineering**. It needs careful evaluation too.
---
@concept
## Layer 3: infrastructure
At the bottom: tools for **model serving** (running models so apps can call them), managing data and compute, and monitoring.
---
@concept
## What GitHub shows
In March 2024 the author collected every AI-related GitHub repository with at least 500 stars: 920 in total.

In 2023, after Stable Diffusion and ChatGPT, AI tooling jumped. Applications and application development grew the most. Infrastructure grew much less.

That makes sense: models and apps changed, but the basic infrastructure needs (resources, serving, monitoring) stayed the same.
---
@concept
## What stays the same
Many principles from ML engineering still hold:

Business apps must solve business problems, so you still map business metrics to ML metrics and back.

You still experiment systematically. Before: hyperparameters. Now: models, prompts, retrieval methods and **sampling** settings (chapter 2).

You still want models faster and cheaper.

You still need a feedback loop to improve with real production data.
---
@concept
## Old lessons still count
So most of what ML engineers learned over the last decade still applies. That makes it easier for everyone to start building AI apps.

On top of those lasting principles, AI engineering adds many new ideas, which the rest of the book explores.
---
@quiz
## You start a new AI app. Which layer do you usually begin with?
- [x] Application development
- [ ] Model development
- [ ] Infrastructure
> Start at the top with ready-made models, and go down only when you need to.
---
@quiz
## Why did infrastructure tools grow the least in 2023?
- [ ] Nobody uses infrastructure anymore
- [x] Core needs like serving, resources and monitoring stayed the same
- [ ] Infrastructure is illegal in many countries
> Models and apps changed a lot, but what infrastructure must do did not.
---
@quiz
## In traditional ML you tuned hyperparameters. What do you experiment with now?
- [ ] Nothing, foundation models need no experiments
- [x] Models, prompts, retrieval methods and sampling settings
- [ ] Only the hardware
> Systematic experiments remain. What you vary has changed.
