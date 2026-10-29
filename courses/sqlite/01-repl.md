# Build the REPL
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/strings

@concept
## What we are building
A tiny database modeled on SQLite. It has one table of users, each with an id, a username and an email. It supports `insert` and `select`, saves to a file, and stores rows in a B+ tree.

All the code goes in one file, `db.c`, and it grows one step at a time.
---
@concept
## A REPL
Like the SQLite shell, our program is a **REPL**: it reads a line, runs it, prints the result, and loops.
```diagram
prompt -> read -> run -> print
then prompt again
```
---
@build
## The headers
Create `db.c` with these headers:
```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
```
`stdbool.h` gives us `bool`, `true` and `false`. `stdio.h` has `printf` and `getline`. `stdlib.h` has `free`. `string.h` has `strcmp`.
---
@build
## The loop
```c
int main(void) {
  char *line = NULL;
  size_t capacity = 0;

  while (true) {
    printf("db > ");
    fflush(stdout);
```
`line` and `capacity` start empty. `getline` will allocate the buffer. `fflush` shows the prompt now, even though it has no newline.
---
@build
## Read one line
```c
    ssize_t length = getline(&line, &capacity, stdin);
    if (length == -1) {
      break;
    }
    if (line[length - 1] == '\n') {
      line[length - 1] = '\0';
    }
```
We pass `&line` and `&capacity` so `getline` can replace the buffer with a bigger one. At the end of input it returns -1, and we leave the loop.
---
@build
## Handle the line
```c
    if (strcmp(line, ".exit") == 0) {
      break;
    }
    printf("Unrecognized command '%s'.\n", line);
  }

  free(line);
  return 0;
}
```
`.exit` leaves the loop. Anything else is unknown for now. After the loop, we free the buffer that `getline` allocated, because it is ours to free.
---
@build
## Compile and run
```console
$ cc -Wall -Wextra -o db db.c
$ ./db
db > hello
Unrecognized command 'hello'.
db > .exit
```
---
@concept
## Two ways out
Typing `.exit` and pressing Ctrl-D (end of input) both leave the loop. Either way the code after the loop runs, so cleanup always happens.
---
@quiz
## You type `.EXIT`. What does the program print?
- [ ] Nothing, it exits
- [x] `Unrecognized command '.EXIT'.`
- [ ] An error from `getline`
> `strcmp` compares bytes exactly, so case matters.
---
@quiz
## Why do we pass `&line` instead of `line` to getline?
- [ ] To make the call faster
- [x] So getline can store the address of a new or bigger buffer in `line`
- [ ] Because `line` starts as `NULL` and `NULL` cannot be passed
> C passes copies. To change our pointer, getline needs its address.
---
@quiz
## The input ends with a line that has no newline. What does the strip code do with it?
- [x] Leaves it unchanged
- [ ] Removes its last character
- [ ] Crashes
> We replace the last character only when it is `'\n'`.
