# Build the REPL
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers

@concept
## The first vertical slice
We will begin with a **REPL**: a read, evaluate, print loop. It prints `db > `, reads one line, handles it, and repeats.

For now, `.exit` ends the program and every other line is rejected.

---
@build
## Keep the input state together
`getline` needs a pointer and its current capacity. A struct keeps those values with the length returned by the last read.

```c
typedef struct {
  char *data;
  size_t capacity;
  ssize_t length;
} InputBuffer;
```

---
@build
## Create and destroy the buffer
The constructor checks its allocation. The matching function owns both allocations that may exist later.

```c
InputBuffer *input_buffer_new(void) {
  InputBuffer *input = malloc(sizeof *input);
  if (input == NULL) {
    fprintf(stderr, "Could not allocate input buffer.\n");
    exit(EXIT_FAILURE);
  }
  input->data = NULL;
  input->capacity = 0;
  input->length = 0;
  return input;
}

void input_buffer_free(InputBuffer *input) {
  free(input->data);
  free(input);
}
```

---
@build
## Read one complete line
End-of-file is a normal way to leave the REPL. Any other read failure is fatal.

```c
bool read_input(InputBuffer *input) {
  ssize_t length = getline(&input->data, &input->capacity, stdin);
  if (length < 0) {
    if (feof(stdin)) return false;
    fprintf(stderr, "Could not read input.\n");
    exit(EXIT_FAILURE);
  }

  if (length > 0 && input->data[length - 1] == '\n') {
    input->data[--length] = '\0';
  }
  input->length = length;
  return true;
}
```

---
@build
## Print the prompt now
The prompt has no newline, so flush the output stream to make it visible before waiting for input.

```c
void print_prompt(void) {
  printf("db > ");
  if (fflush(stdout) == EOF) {
    fprintf(stderr, "Could not print prompt.\n");
    exit(EXIT_FAILURE);
  }
}
```

---
@build
## The loop owns the buffer
`main` creates the buffer once and frees it on both normal ways out.

```c
InputBuffer *input = input_buffer_new();
for (;;) {
  print_prompt();
  if (!read_input(input)) break;

  if (strcmp(input->data, ".exit") == 0) break;
  printf("Unrecognized command '%s'.\n", input->data);
}
input_buffer_free(input);
```

---
@quiz
## What happens when the last line has no newline?
- [ ] Its last real character is deleted
- [x] The line stays unchanged
- [ ] `getline` always adds a newline
> The code removes the final byte only when that byte is actually `\n`.

---
@build
## Compile and try it
Include `<stdbool.h>`, `<stdio.h>`, `<stdlib.h>`, `<string.h>`, and `<sys/types.h>`, then compile with:

```sh
gcc -Wall -Wextra main.c -o db
```

Try an unknown command, `.exit`, and end-of-file. Each path should finish without leaking the input buffer.
