# The application layer

@concept
## Where the difference is now
In traditional ML, each team built its own model, so a better model set you apart.

With foundation models, many teams use the same model. So you stand out through how you build the application.

The application layer has three jobs: **evaluation**, **prompt engineering** and the **AI interface**.
---
@concept
## Evaluation
Evaluation is about lowering risk and finding opportunities. You need it at every step:

To choose a model.

To measure progress.

To decide whether the app is ready to ship.

To find problems and ideas for improvement in production.
---
@concept
## Why evaluation is harder now
In a close-ended task like fraud detection, there is a known right answer. If the model's output differs, it's wrong.

A chatbot can give countless good answers to one prompt. You can't list every right answer to compare against.

Foundation models also do so many more things that there is more to test. Chapter 3 covers this.
---
@concept
## Same model, different score
With so many adaptation techniques, a system that looks weak with one can look strong with another.

When Google launched Gemini (December 2023), it said Gemini Ultra beat ChatGPT on the MMLU benchmark. But Gemini's top score used a heavier prompting technique called **CoT@32**, while GPT-4's reported score used a plain prompt with 5 examples.

When both got the same 5-example prompt, GPT-4 scored higher.
```diagram
Gemini Ultra, CoT@32: 90.04%
Gemini Ultra, 5 examples: 83.7%
GPT-4, 5 examples: 86.4%
```
---
@concept
## Prompt engineering
Prompt engineering means getting the behavior you want from the input alone, without changing the weights.

The Gemini story shows how much it matters: a different prompting technique moved Gemini Ultra from 83.7% to 90.04%.

The right instructions can get a model to do your task, in your format.
---
@concept
## Context construction
Prompt engineering is not just telling the model what to do. It also means giving it the **context** and **tools** it needs.

Long, complex tasks may also need memory: a way to store the history so the model doesn't lose track. Chapter 5 covers prompts, and chapter 6 covers context.
---
@concept
## AI interface
This means building the way end users interact with your AI app.

Before foundation models, only companies that could build models could build AI apps, and the AI was usually hidden inside their products: fraud detection inside Stripe and PayPal, recommendations inside Netflix and Spotify.
---
@concept
## Standalone or built in
Now anyone can build an AI app, either as its own product or inside other products, even someone else's.

ChatGPT and Perplexity are standalone. GitHub Copilot usually runs as a plug-in in VS Code. Grammarly usually runs as a browser extension. Midjourney works as its own web app and inside Discord.
---
@concept
## Popular AI interfaces
Standalone web, desktop and mobile apps. Tools like Streamlit, Gradio and Plotly Dash make AI web apps quick to build.

Browser extensions for asking AI while you browse.

Chatbots inside chat apps: Slack, Discord, WeChat, WhatsApp.

Plug-ins and add-ons through product APIs, like VS Code, Shopify and Microsoft 365. Agents can use these APIs too.

Chat is the most common, but interfaces can also be voice, or embodied, as in AR and VR.
---
@concept
## Feedback in plain language
New interfaces also bring new ways to collect user feedback.

In a chat, users can easily say what they think in their own words. But that kind of feedback is harder to pull out and use. Chapter 10 covers feedback design.
---
@concept
## Application development, then and now
```diagram
AI interface
before: less important
now: important

prompt engineering
before: not applicable
now: important

evaluation
before: important
now: more important
```
---
@concept
## Closer to full-stack
With interfaces mattering more, AI engineering moves closer to **full-stack** development. One engineer put it as "software engineering with AI models thrown in the stack".

ML used to be built around Python, and most ML frameworks offered mainly Python APIs. Python is still popular, but JavaScript support is growing: LangChain.js, Transformers.js, OpenAI's Node library, and Vercel's AI SDK.
---
@concept
## Product first, model later
More AI engineers now come from web and full-stack work. Their strength: turning ideas into demos fast, getting feedback, and iterating.

In traditional ML, you collect data and train a model first, and build the product last. Now you can build the product first, and invest in data and models only once it shows promise.
```diagram
traditional ML: data → model → product
AI engineering: product → data → model
```
AI engineers are also much more involved in product decisions than ML engineers used to be.
---
@quiz
## Many teams use the same foundation model. Where do they compete?
- [ ] On owning a better model
- [x] On the application: evaluation, prompts and interface
- [ ] On having more GPUs
> When the model is shared, the application is where products differ.
---
@quiz
## Why couldn't Gemini's 90.04% be directly compared with GPT-4's 86.4%?
- [x] They were tested with different prompting techniques and numbers of examples
- [ ] They used different benchmarks
- [ ] GPT-4 was tested on easier questions
> Gemini used CoT@32 while GPT-4's number came from a 5-example prompt. With 5 examples each, GPT-4 scored higher.
---
@quiz
## How does the AI engineering workflow differ from traditional ML?
- [ ] It skips data entirely
- [x] It can start with the product and invest in data and models later
- [ ] It always starts by training a model
> With ready-made models, you can test a product idea first, then improve data and models once it works.
