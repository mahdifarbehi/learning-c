# C Stories: Brief for an AI Agent

Read this whole file before doing anything. Follow it exactly. If something is unclear or missing, ask the owner. Do not guess and do not add things.

## 1. What this project is
A PWA (installable web app) that teaches how things work in C through short, story-like cards, similar to Instagram stories. The goal is **understanding**, not training programmers. The owner is the main reader and editor. It will later be shared with an audience.

## 2. Reader
A programmer who knows another language and is new to C. Do not explain general programming (loops, ifs, functions). Explain what is specific to C. When a term appears for the first time, explain it in one plain sentence.

## 3. Courses
Only two courses exist in v1. Do not create others.

1. **C Basics**: only the C concepts needed to follow the SQLite course.
2. **Build SQLite**: based on the db_tutorial (https://cstack.github.io/db_tutorial/).

The courses are separate. Each SQLite lesson declares which Basics lessons it needs, using a `requires:` line. The app shows "Take these first" with links before that lesson starts.

## 3a. Source material
- The db_tutorial is the source for both courses.
- Do **not** copy its text. Rewrite everything in your own words. Add one credit line to the course description.
- Fix anything that is not best practice. Examples: compile with `-Wall -Wextra`, include every needed header, check the result of `malloc`, call `free`, strip a trailing newline only if it exists, mention that `getline` is POSIX.
- Simplify wherever possible. Do **not** add "rough edges" or "simplified here" notes.

## 4. Writing rules
- One idea per card. Short cards, but with enough explanation to be understood.
- Keep code short and simple.
- Quizzes ask about behavior ("what prints?", "what happens?"). Never ask the reader to write code.
- Concepts come before the build steps that use them.

## 5. Lesson file format (Markdown)
One lesson is one `.md` file. This format is final. Do not change it.

- First line: `# Lesson title`
- Cards are separated by a line containing only `---`
- Each card may start with a tag line: `@concept`, `@build` or `@quiz` (default is `@concept`)
- Then an optional `## Card title`
- Then paragraphs and fenced code blocks
- Inline: `` `code` `` and `**bold**`
- Quiz: options are `- [ ] wrong` and `- [x] correct`; the explanation is a line starting with `> `
- Diagram (to be added to the app): a fenced block marked `diagram`. Plain text only, no boxes, no shapes. Example:

````
@concept
## A pointer
```diagram
p -> x
x = 5
```
````

Example of a quiz card:

````
@quiz
## What does malloc return when it fails?
- [ ] 0 bytes of valid memory
- [x] `NULL`
- [ ] It crashes the program
> `malloc` returns `NULL` on failure, so code should check for it.
````

Course layout on disk:

```
courses/
  c-basics/      01-....md  02-....md
  sqlite/        01-....md  (each with a requires: line)
```

The `requires:` line goes right after the lesson title, for example:
`requires: c-basics/pointers, c-basics/malloc`

## 6. App rules (v1)
- Static files only. No backend, no accounts, no framework, no build step if avoidable.
- PWA: web manifest and a service worker so it works offline and is installable.
- Cards: tap right side = next, tap left side = back, hold = pause, auto-advance on a timer, quiz cards never auto-advance.
- Progress is saved on the device with `localStorage`: last card seen and completed lessons.
- Keep the existing minimal visual style: dark background, serif headings, monospace code, purple for concept cards, green for build cards, amber for quiz cards.
- A working prototype, `c-stories.html` (a single file), is provided. Start from it and keep its behavior. Do not redesign it.

## 7. Not in v1. Do not build these
Accounts, backend, search, streaks, reminders, images, extra courses (Redis, shell, kernel), animations, any new feature not listed above.

## 8. Order of work. Stop at each checkpoint and wait for approval
1. Read all parts of the db_tutorial. Produce a list: for each part, the C concepts it uses. **Checkpoint: owner approves.**
2. Propose the C Basics lesson list, ordered by first use in SQLite. **Checkpoint: owner approves.**
3. Write the C Basics lessons in the format above. **Checkpoint.**
4. Write the SQLite lessons, with `requires:` lines. **Checkpoint.**
5. Turn the prototype into a PWA with a course list, the "Take these first" screen, and diagram cards. **Checkpoint.**

## 9. Rules for you
- Do not skip a checkpoint.
- Do not rename, reformat or restructure anything described in this file.
- Do not add features, dependencies or content that were not requested.
- If a request conflicts with this file, ask the owner which one wins.
- Keep your replies short and plain.
