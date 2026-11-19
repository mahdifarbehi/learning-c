# Foundation models

@concept
## Beyond text
People understand the world through sight, sound and touch, not just words. For AI to work in the real world, it has to handle more than text.

So language models were extended to other kinds of data, called **modalities**. GPT-4V and Claude 3 understand images as well as text. Some models handle video, 3D objects, even protein structures.
---
@concept
## Why "foundation"?
These models are still often called LLMs, but a better name is **foundation models**.

"Foundation" says two things: they are central to AI applications, and you can build many different things on top of them.

In this book, foundation models means both large language models and large multimodal models.
---
@concept
## AI used to be split by data type
For a long time, AI research was divided by modality.

**NLP** (natural language processing) worked only with text: translation, spam detection.

**Computer vision** worked only with images: finding and classifying objects.

Audio models handled speech-to-text (**STT**) and text-to-speech (**TTS**).

Foundation models broke these walls down.
---
@concept
## Multimodal models
A model that works with more than one modality is **multimodal**. A generative multimodal model is a **large multimodal model**, or **LMM**.

A language model picks the next token based on text tokens. A multimodal model picks it based on text and image tokens, or whatever modalities it supports.
---
@concept
## Self-supervision for images too
Multimodal models need huge data too, and self-supervision works for them as well.

For its model **CLIP** (2021), OpenAI didn't label images. It collected 400 million (image, text) pairs that already appeared together on the internet, like a photo and its caption. That is about 400 times the size of ImageNet, at no labeling cost.

This variant is called **natural language supervision**. CLIP became the first model to handle many image classification tasks without extra training.
---
@concept
## Embeddings
CLIP is not generative. It is an **embedding model**: it turns text and images into **embeddings** in one shared space.

For now, think of an embedding as a list of numbers (a vector) that tries to capture the meaning of the data.

Generative multimodal models such as Flamingo, LLaVA and Gemini are built on top of embedding models like CLIP.
---
@concept
## From one task to many
Before, each model was built for one task. A sentiment model couldn't translate, and a translation model couldn't judge sentiment.

Foundation models are **general-purpose**. Because of their scale and how they are trained, one LLM can do both, and many other tasks, out of the box.

You can still tune a general model to do its best on one specific task.
---
@concept
## Example: product descriptions
You build an app that writes product descriptions for a shop.

An off-the-shelf model may write accurate text that misses the brand's voice, or is full of marketing clichés.

There are three common ways to fix that. The next card lists them.
---
@concept
## Three ways to adapt a model
**Prompt engineering**: write detailed instructions, with examples of good descriptions.

**RAG** (retrieval-augmented generation): connect the model to a database, such as customer reviews, and add what it finds to the instructions.

**Finetuning**: train the model further on a dataset of high-quality descriptions.

The rest of the book covers all three in detail.
---
@concept
## Adapting beats building
Adapting a strong existing model is usually far easier than building one for your task.

Think ten examples and a weekend, against a million examples and six months.

So foundation models make AI apps cheaper and faster to ship.
---
@concept
## Task-specific models still have a place
Small task-specific models can still win: they may be much smaller, so faster and cheaper to run.

Whether to build your own model or use an existing one is the classic **buy or build** question. Each team has to answer it for itself.
---
@quiz
## What makes a model "multimodal"?
- [ ] It runs on many GPUs
- [x] It works with more than one kind of data, like text and images
- [ ] It speaks many languages
> Modalities are kinds of data: text, images, audio, video and so on.
---
@quiz
## How did OpenAI get training data for CLIP without paying for labels?
- [ ] It generated fake images
- [x] It collected image and text pairs that already appeared together online
- [ ] It reused ImageNet's labels
> The text next to an image online, like a caption, works as a free label. This is natural language supervision.
---
@quiz
## You give the model a database of customer reviews to use when writing. Which technique is that?
- [ ] Prompt engineering only
- [x] RAG (retrieval-augmented generation)
- [ ] Finetuning
> RAG adds information fetched from a database to the model's input. Finetuning would change the model itself.
