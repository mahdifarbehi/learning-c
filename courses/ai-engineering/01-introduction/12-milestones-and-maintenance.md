# Milestones and maintenance

@concept
## Start by testing what exists
Once your goals are measurable, plan how to reach them. That depends on where you start.

Evaluate existing models first. The better they already are, the less work for you.

If you want to automate 60% of support tickets and an off-the-shelf model already handles 30%, you have much less to do than if it handled none.
---
@concept
## Goals can change
Your goals may change after evaluation.

You may find that reaching the usefulness threshold costs more than the product would earn. Then the right move is to drop it.
---
@concept
## The last mile
Early success with foundation models can fool you. The base models are strong, so a fun demo takes little time.

But a good demo doesn't promise a good product. A demo can take a weekend. A product can take months, even years.

This is the **last mile** problem.
---
@concept
## 0 to 60 is easy, 60 to 100 is hard
The UltraChat paper (2023) said it plainly: going from 0 to 60 is easy, from 60 to 100 is extremely hard.

LinkedIn (2024) reached 80% of the experience they wanted in one month. That fooled them. It took four more months to pass 95%, much of it spent on rough edges and **hallucinations** (confident but made-up answers). Each extra 1% came slowly.
```diagram
0% → 80%: 1 month
80% → 95%: 4 more months
```
---
@concept
## Maintenance on a bullet train
Planning doesn't end when you hit your goals. You also have to maintain the product as things change.

AI has moved very fast for the past decade and will likely keep doing so. Building on foundation models means riding along at that speed.
---
@concept
## Many changes are good
Models' limits keep being fixed. **Context length**, how much input a model can take, keeps growing. Outputs keep getting better.

**Inference**, computing an output from an input, keeps getting faster and cheaper. A **benchmark** is a standard test for models, and **MMLU** is a popular one. From 2022 to 2024, the cost of getting a given MMLU score dropped sharply.
---
@concept
## Even good changes cause trouble
You must keep weighing the cost and benefit of every technology choice. The best option today can be the worst tomorrow.

You host a model yourself because it's cheaper, then three months later providers cut prices in half.

You build around a vendor's tool, then the vendor shuts down.
---
@concept
## Swapping models isn't free
Providers' APIs are becoming alike, so switching from one model API to another is getting easier.

But every model has its own quirks, strengths and weaknesses. Moving to a new one means adjusting prompts, workflows and data.

Without good **versioning** and **evaluation** in place, a switch can be painful.
---
@concept
## Rules can change overnight
Some changes are harder, especially laws. Many countries treat AI as a national security issue, so compute, talent and data are tightly regulated.

Meeting Europe's privacy law, **GDPR**, was estimated to cost businesses $9 billion.

New rules, like a 2023 US executive order, can limit who may buy or sell compute overnight. Imagine your country is suddenly cut off from your GPU supplier.
---
@concept
## Who owns what?
Some changes could even be fatal. Rules on **intellectual property** (IP) and AI are still unsettled.

If your product is built on a model trained on other people's data, can you be sure your product's IP stays yours?

Many IP-heavy companies, like game studios, hold back on AI for this reason.
---
@quiz
## Your demo hit 80% quality in a month. What should you expect next?
- [ ] 100% in about another month
- [x] Each further gain gets slower; the last stretch can take many months
- [ ] Quality will fall
> This is the last mile problem: 0 to 60 is easy, 60 to 100 is very hard.
---
@quiz
## Model APIs are becoming alike. Is switching models now effortless?
- [ ] Yes, just change the API key
- [x] No, prompts, workflows and data still need adjusting for the new model
> Each model has quirks. Versioning and evaluation make switching manageable.
---
@quiz
## What should you do first when planning milestones?
- [x] Evaluate existing models to see what they can already do
- [ ] Train your own model
- [ ] Launch to all customers
> The stronger the off-the-shelf models, the less work you need, and your goals may change after evaluation.
