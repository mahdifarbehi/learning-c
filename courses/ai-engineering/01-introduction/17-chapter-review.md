# Chapter 1 review

@concept
## The whole chapter in one card
Self-supervision let language models grow into LLMs. Adding images and other data made them foundation models. Offering them as a service made AI engineering possible.

People use them for coding, images, writing, education, bots, gathering information, organizing data and automation.

Before building, ask why, what role AI and humans play, how you'll measure success, and how you'll keep up.

The stack has three layers, and AI engineering is mostly about adapting and evaluating models.
---
@quiz
## Which of these is a token?
- [ ] Only a whole word
- [x] A character, a word or part of a word, depending on the model
- [ ] Only a single letter
> Each model's tokenizer decides how text splits into tokens.
---
@quiz
## Which sentence describes self-supervision?
- [ ] People label every example
- [x] The labels come from the data itself
- [ ] There are no labels at all
> In language modeling, the next token in real text is the label. "No labels at all" is unsupervised learning.
---
@quiz
## Why does the book prefer the name "foundation model" over "LLM"?
- [ ] Foundation models always have more parameters
- [x] The models now handle more than text, and many apps are built on top of them
- [ ] Foundation models are open source
> "Foundation" covers both LLMs and multimodal models, and says they are the base you build on.
---
@quiz
## Which adaptation technique changes the model's weights?
- [ ] Prompt engineering
- [ ] RAG
- [x] Finetuning
> Prompting and RAG change only the input. Finetuning changes the model itself.
---
@quiz
## Which is NOT one of the three factors behind AI engineering's growth?
- [ ] General-purpose abilities
- [ ] More investment
- [ ] A low barrier to entry
- [x] Cheaper labeled data
> The three factors are abilities, investment and a low barrier. Self-supervision avoided labels; labels didn't get cheap.
---
@quiz
## Gmail works fine without Smart Compose. So Smart Compose is...
- [x] Complementary
- [ ] Critical
> If the app works without AI, the AI is complementary, and mistakes are more forgivable.
---
@quiz
## Traffic alerts in Google Maps that appear without you asking are...
- [ ] Reactive
- [x] Proactive
> Proactive features appear on their own, so they need a higher quality bar.
---
@quiz
## Which advantage is usually hardest for a startup to win against big companies?
- [ ] Data
- [x] Distribution
> Big companies already have the users. A startup's better chance is data from being first.
---
@quiz
## What does TPOT measure?
- [ ] Time until the answer starts
- [x] Time for each following output token
- [ ] Total cost of a request
> TTFT is time to first token, TPOT is time per output token.
---
@quiz
## A team spent a weekend on a great demo. What does the chapter warn about?
- [ ] Demos are always worse than products
- [x] The last mile: turning it into a good product can take months
- [ ] They should ship it to customers right away
> 0 to 60 is easy, 60 to 100 is hard.
---
@quiz
## Which layer handles model serving and monitoring?
- [ ] Application development
- [ ] Model development
- [x] Infrastructure
> Infrastructure is the bottom layer: serving, data and compute management, monitoring.
---
@quiz
## Someone feeds a chatbot examples in the chat and says they "trained" it. Technically, what is it?
- [x] Prompt engineering
- [ ] Finetuning
- [ ] Pre-training
> Teaching through the input doesn't change the weights, so it is prompt engineering.
---
@quiz
## Why is inference speed a bigger challenge for foundation models?
- [ ] They run only on phones
- [x] They are big and generate tokens one by one
- [ ] They can't be run on GPUs
> Each token takes time, and answers have many tokens.
---
@quiz
## In AI engineering, which job became MORE important than in traditional ML?
- [ ] Feature engineering on tables
- [x] Evaluation
- [ ] Designing new model architectures
> Open-ended outputs and many adaptation methods make evaluation harder and more important.
