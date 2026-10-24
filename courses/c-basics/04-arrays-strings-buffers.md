# Arrays, strings, and buffers

@concept
## An array is contiguous storage
An **array** holds a fixed number of same-type objects next to one another in memory.

```c
int values[3] = {10, 20, 30};
```

The length is part of this array's declaration and cannot grow later.

---
@concept
## Indexes are unchecked
`values[0]` is the first element and `values[2]` is the last. C does not check an index before accessing memory.

For `int values[3]`, reading or writing `values[3]` is out of bounds and has undefined behavior.

---
@concept
## An array usually becomes a pointer
In most expressions, an array name becomes a pointer to its first element.

```c
int values[3] = {10, 20, 30};
int *first = values;
```

Both `values[0]` and `*first` access the same integer.

---
@concept
## sizeof sees arrays and pointers differently
When an array is still an array, `sizeof` reports all its storage. Applied to a pointer, it reports only the pointer object's size.

```c
int values[3];
int *pointer = values;

sizeof values;   // space for three ints
sizeof pointer;  // space for one pointer
```

A pointer does not remember the array's length.

---
@concept
## A C string ends with zero
C has no separate string type. A **C string** is a `char` array whose final character is the zero byte `\0`.

```c
char word[] = "cat";
```

The array has four bytes: three letters and the terminator.

---
@concept
## The terminator marks the end
String functions keep reading characters until they reach `\0`.

```diagram
word -> 'c' 'a' 't' '\0'
```

A character array without a reachable terminator is not a valid C string.

---
@concept
## Length and capacity differ
**Length** counts characters before `\0`. **Capacity** is the total number of bytes available in the buffer.

A buffer with capacity 8 can hold a string of at most 7 characters because one byte is reserved for the terminator.

---
@concept
## Compare contents with strcmp
For pointers, `==` compares addresses. `strcmp` compares the characters in two strings.

```c
#include <string.h>

if (strcmp(command, ".exit") == 0) {
  /* The contents are equal. */
}
```

`strcmp` returns zero when the strings match.

---
@concept
## Check before copying
Measure the input before copying it into a fixed-size array.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char name[8];
const char *input = "Ada";
size_t length = strlen(input);

if (length >= sizeof name) {
  fprintf(stderr, "Name is too long.\n");
  exit(EXIT_FAILURE);
}
memcpy(name, input, length + 1);
```

`strlen` counts characters before the terminator. `memcpy` copies exactly the requested number of bytes; the extra byte copied by `length + 1` is the terminator.

---
@concept
## getline can grow its buffer
`getline` reads a line from a stream. When given a null pointer and zero capacity, it allocates a suitable buffer and updates both through their addresses.

```c
char *line = NULL;
size_t capacity = 0;
ssize_t length = getline(&line, &capacity, stdin);
```

`stdin` is the program's standard input stream. `ssize_t` is a signed size type, allowing `getline` to return `-1`. The caller owns the resulting buffer and must eventually free it.

---
@build
## Read and trim safely
`getline` returns `-1` at end-of-file or on an error. `feof` tells us whether the input simply ended.

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>

int main(void) {
  char *line = NULL;
  size_t capacity = 0;
  ssize_t length = getline(&line, &capacity, stdin);

  if (length < 0) {
    if (feof(stdin)) {
      free(line);
      return 0;
    }
    fprintf(stderr, "Could not read input.\n");
    exit(EXIT_FAILURE);
  }

  if (length > 0 && line[length - 1] == '\n') {
    line[length - 1] = '\0';
  }

  printf("%s\n", line);
  free(line);
  return 0;
}
```

The final-character check keeps a line without `\n` intact.

---
@quiz
## What does this print?
```c
char text[4] = {'d', 'b', '\0', 'x'};
printf("%s\n", text);
```
- [x] `db`
- [ ] `dbx`
- [ ] Four characters, including the zero byte
> String output stops at the first `\0`, so the later `x` is not part of the string.
