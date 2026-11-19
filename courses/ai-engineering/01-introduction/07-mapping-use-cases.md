# Mapping the use cases

@concept
## There's probably an AI for that
Whatever task you think of, someone has probably built an AI for it. In September 2024, one directory site listed over 16,000 AIs covering about 14,700 tasks.

Listing every use case is impossible. Even grouping them is hard, because every survey groups them differently.
---
@concept
## Many ways to group them
AWS uses three groups: customer experience, employee productivity, and process optimization.

A 2024 O'Reilly survey used eight, from programming and data analysis to customer support, research, web design and art.

Deloitte groups by the value they bring: lower cost, efficiency, growth, faster innovation.
---
@concept
## Adopt or go under
Gartner adds one more group: **business continuity**. Some companies may not survive if they don't adopt generative AI.

Of 2,500 executives Gartner surveyed in 2023, 7% named this as their reason for adopting it.
---
@concept
## Which jobs are exposed?
A 2023 study by Eloundou and others measured how exposed each job is to AI.

A task is **exposed** if AI can cut the time it takes by at least half. A job with 80% exposure has 80% of its tasks exposed.

Close to 100%: interpreters and translators, tax preparers, web designers, writers.

No exposure: cooks, stonemasons, athletes.
---
@concept
## Eight groups used in this book
To build this list, the author interviewed 50 companies, read over 100 case studies and studied 205 popular open source AI apps.
```diagram
coding
image and video production
writing
education
conversational bots
information aggregation
data organization
workflow automation
```
Each group has both consumer and company (**enterprise**) examples.
---
@concept
## One app, many groups
Foundation models are general, so one app can fit several groups.

A bot can keep you company and also gather information. An app can pull structured data from a PDF and also answer questions about it.
---
@concept
## Open source is not the full picture
Among the 205 open source apps, education, data organization and writing were rare.

That doesn't mean those uses are unpopular. Their builders just tend to keep them closed, often to sell to companies.
---
@concept
## Companies start with low risk
Enterprises prefer applications with less risk.

A 2024 a16z report found companies ship **internal** tools (like searching their own documents) faster than **external** ones (like customer support chatbots).

Internal tools let a company build skill while limiting risks around privacy, compliance and public failures.
---
@concept
## Open model, closed task
Foundation models can do open-ended work, yet many apps built on them do **close-ended** tasks like classification, where the answer comes from a fixed list.

Close-ended tasks are easier to evaluate, so their risks are easier to estimate.
---
@concept
## Expect surprises
In the early internet, few people guessed social media would become its main use.

The use of AI that wins in the end may also surprise us.
---
@quiz
## In the exposure study, when is a task "exposed" to AI?
- [ ] When AI can do it perfectly
- [x] When AI can cut the time it takes by at least 50%
- [ ] When a company has replaced workers with AI
> Exposure means AI can at least halve the time a task takes.
---
@quiz
## A company wants its first AI project. Which is the typical lower-risk choice?
- [x] An internal tool to search company documents
- [ ] A public chatbot that answers customers directly
> Internal tools build skill with less risk to privacy, compliance and reputation.
---
@quiz
## Why do many companies use foundation models for classification tasks?
- [ ] Foundation models can't do anything else
- [x] Close-ended answers are easier to evaluate, so the risk is easier to judge
- [ ] Classification is the most profitable task
> When the answer comes from a fixed list, you can check it, so you know how risky the app is.
