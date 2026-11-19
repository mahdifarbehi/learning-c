# Moats and success metrics

@concept
## Easy for you, easy for rivals
If you sell an AI app as a product, ask how you will defend it.

The low barrier to entry cuts both ways: if it's easy for you to build, it's easy for competitors too. What is your **moat**, the thing that protects you?
---
@concept
## The model can swallow your layer
Building on a foundation model means adding a layer on top of it. If the model gets better, your layer may become pointless.

Say you build a PDF parser because ChatGPT is bad at PDFs. Once ChatGPT gets good at PDFs, you have little left.

It can still make sense if you build on open source models, for customers who want to host models themselves.
---
@concept
## A feature, not a product?
An investor at a big venture firm said many startups she sees could be a feature in Google Docs or Microsoft Office.

If such a product takes off, what stops Google or Microsoft from putting three engineers on it and copying it in two weeks?
---
@concept
## Three kinds of advantage
In AI, competitive advantage usually comes from three places:

**Technology**: with foundation models, most companies' core tech looks similar.

**Distribution**: getting your product in front of users. Big companies usually win here.

**Data**: the most interesting one. The next card explains why.
---
@concept
## Data as a moat
Big companies have more data to start with. But a startup that reaches the market first can collect usage data and keep improving. That data becomes its moat.

Even when user data can't train models directly, usage shows how people behave and where the product falls short.

People call this loop the **data flywheel**: more users, more data, a better product, more users.
---
@concept
## Small features can win
Many successful companies started as something that could have been a feature: Calendly in Google Calendar, Mailchimp in Gmail, Photoroom in Google Photos.

Many startups beat bigger rivals by starting with a feature those rivals ignored.
---
@concept
## What does success look like?
Before building, decide how you'll measure success. The most important measure is the effect on the business.

For a support chatbot, you might ask:

What share of messages should it handle on its own?

How many more messages can you handle?

How much faster can you reply?

How much human work does it save?
---
@concept
## More answers isn't more happiness
A chatbot may answer more messages and still annoy customers.

So also track customer satisfaction and feedback. Chapter 10 covers designing user feedback.
---
@concept
## The usefulness threshold
Don't show customers a product before it's ready. Decide its **usefulness threshold**: how good it must be to be useful. That covers:

**Quality**: how good the answers are.

**Latency**: how fast it responds.

**Cost**: how much each request (each **inference**) costs.

**Other**: things like interpretability and fairness.
---
@concept
## Latency metrics
Three latency numbers matter for AI apps:

**TTFT**, time to first token: how long until the answer starts appearing.

**TPOT**, time per output token: how fast it continues once started.

**Total latency**: how long the whole answer takes.

What is fast enough depends on the case. If humans now reply in a median of one hour, anything faster may be good enough.
---
@quiz
## Your app adds a layer on top of a model. What is the main risk?
- [ ] The model gets slower
- [x] The model improves and makes your layer unnecessary
- [ ] Users can't reach the model
> If the base model gains your feature, your layer may stop mattering.
---
@quiz
## Where can a startup most realistically build a moat?
- [ ] Technology, since its models are unique
- [ ] Distribution, since it has more users
- [x] Data, by reaching the market first and learning from usage
> Tech is similar for everyone and big companies win distribution. Early usage data can be a startup's edge.
---
@quiz
## Users wait a long time before the first word of the answer appears. Which metric is bad?
- [x] TTFT, time to first token
- [ ] TPOT, time per output token
- [ ] Cost per request
> TTFT measures the wait before the first token arrives.
