# AI engineering versus ML engineering

@concept
## Difference 1: adapt, don't train
Without foundation models, you train your own model for each app.

In AI engineering, someone else trained the model. Your work is less about modeling and training, and more about **model adaptation**: getting an existing model to do your task.
---
@concept
## Difference 2: bigger models
Foundation models are bigger, use more compute and respond more slowly than traditional ML models.

So there is more pressure to train and run them efficiently. Many companies now need more GPUs and bigger clusters than before, and engineers who can work with them.

One AI leader at a Fortune 500 company put it this way: his team knew how to use 10 GPUs, but not 1,000.
---
@concept
## Difference 3: open-ended outputs
Foundation models give open-ended answers. That makes them useful for more tasks, but much harder to evaluate.

So **evaluation** becomes a much bigger problem in AI engineering.

In short: AI engineering is less about building models and more about **adapting and evaluating** them.
---
@concept
## Two ways to adapt a model
Adaptation methods split by one question: do they change the model's weights?
```diagram
prompt-based: weights stay the same
finetuning: weights change
```
---
@concept
## Prompt-based techniques
You adapt the model by giving it instructions and context, not by changing it. **Prompt engineering** is the main example.

It's easy to start and needs little data. Many successful apps use only prompts. And because it's cheap, you can try more models and may find one that is surprisingly good for you.

But it may not be enough for complex tasks or strict performance needs.
---
@concept
## Finetuning
You adapt the model by changing the model itself: its weights.

It is more complex and needs more data, but it can greatly improve quality, latency and cost.

Some things are impossible without changing weights, such as teaching the model a new task it never saw in training.
---
@concept
## Model development: three jobs
The model development layer is what traditional ML engineering is best known for. It has three main jobs:

**Modeling and training**

**Dataset engineering**

**Inference optimization**

Evaluation is needed here too, but you meet it first at the application layer, so it's covered there.
---
@concept
## Modeling and training
This means designing a model architecture, training it and finetuning it. Common tools: TensorFlow, Hugging Face Transformers and PyTorch.

It takes real ML knowledge: algorithms (clustering, logistic regression, decision trees), network types (feedforward, recurrent, convolutional, transformer), and how models learn (gradient descent, loss functions, regularization).
---
@concept
## Is ML knowledge required now?
Today you can build AI apps on foundation models without knowing ML. Plenty of successful builders have no interest in gradient descent.

But it is still very valuable. It gives you more tools, and it helps you debug when a model doesn't behave. (Many people argue it's still a must.)
---
@concept
## Pre-training
**Training** always changes the model's weights.

**Pre-training** means training a model from scratch, starting from random weights. For LLMs, it is usually training on text completion.

It's by far the most expensive step. For InstructGPT, pre-training took up to 98% of all compute and data. It takes a long time, and one small mistake can cost a lot of money. Only a few people do it, and they are paid very well.
---
@concept
## Finetuning and post-training
**Finetuning** means continuing to train a model that was already trained. It already knows a lot, so it needs fewer resources, like data and compute.

**Post-training** is the same idea. The difference is usually who does it. Model developers post-train, for example OpenAI teaching a model to follow instructions before release. App developers finetune, for example you adapting that model to your needs.
```diagram
pre-training: model developer
↓
post-training: model developer
↓
finetuning: you, the app developer
```
Pre-training and post-training are really two ends of one range. They use very similar methods and tools.
---
@concept
## Changing weights isn't always training
**Quantization** lowers the precision of a model's weights, to make it smaller and faster. It changes the weight values, but it isn't training.
---
@concept
## Prompting is not training
A journalist wrote that she "trained" ChatGPT to imitate her younger self by feeding it her childhood diary.

In everyday language, fine. Technically, teaching a model through its input is **prompt engineering**, not training. People also say "finetuning" when they really mean prompt engineering.
---
@quiz
## You paste examples into the prompt so the model writes in your style. What is this?
- [ ] Finetuning
- [ ] Pre-training
- [x] Prompt engineering
> The weights don't change. Teaching through the input is prompt engineering.
---
@quiz
## Which training step uses the most resources?
- [x] Pre-training
- [ ] Post-training
- [ ] Finetuning
> Pre-training starts from random weights. For InstructGPT it used up to 98% of all compute and data.
---
@quiz
## You need the model to learn a task it never saw in training, and prompts aren't working. What do you need?
- [ ] More prompt engineering
- [x] Finetuning, which changes the weights
- [ ] Quantization
> Some abilities need changes to the weights. Quantization only makes the model smaller and faster.
---
@quiz
## Why is evaluation a bigger problem in AI engineering?
- [ ] Foundation models are always wrong
- [x] Outputs are open-ended, so there's no simple right answer to compare against
- [ ] Evaluation tools don't exist
> Open-ended outputs make foundation models flexible, and harder to check.
