# Heap memory and ownership

@concept
## Local objects have automatic lifetime
An object declared inside a function normally exists until execution leaves its block. C calls this **automatic storage duration**.

```c
void example(void) {
  int count = 5;
}
```

`count` stops existing when `example` returns.

---
@concept
## Allocated memory lasts until free
The **heap** is memory a program requests while it runs. An allocated block remains available across function calls until the program releases it with `free`.

C does not release individual heap allocations automatically.

---
@concept
## Size the object, not its spelling
The `sizeof` operator reports how many bytes its operand's type needs. `sizeof *number` therefore asks for the size of the object that `number` points to.

```c
#include <stdio.h>

int *number = NULL;
printf("%zu\n", sizeof *number);
```

`sizeof` uses the pointed-to type without following the null pointer. If the pointer's type changes later, this expression still produces the matching size.

---
@concept
## malloc requests a block
`malloc` requests a number of bytes and returns a pointer to the new block.

```c
#include <stdio.h>
#include <stdlib.h>

int *number = malloc(sizeof *number);
```

C converts the returned pointer to the target pointer type without a cast. The next card checks the result before it is used.

---
@concept
## Allocation can fail
When `malloc` cannot provide the requested block, it returns `NULL`. Check before dereferencing the result.

```c
if (number == NULL) {
  fprintf(stderr, "Could not allocate memory.\n");
  exit(EXIT_FAILURE);
}
```

`fprintf` writes formatted text to a chosen stream; `stderr` is C's standard error stream. `exit` ends the program, and `EXIT_FAILURE` supplies its standard failure status. A failed allocation is fatal in this course.

---
@concept
## New bytes are uninitialized
`malloc` does not clear the block. Its bytes have indeterminate values until the program writes them.

After a successful allocation, reading `*number` before assigning it a value is undefined behavior.

---
@concept
## Every allocation needs an owner
The **owner** of an allocation is the part of the program responsible for eventually freeing it.

Passing a pointer to a function does not transfer ownership by itself. The program must decide and document who frees the block.

---
@concept
## free releases the block
Pass the original allocation pointer to `free` when the owner is finished with the block.

```c
free(number);
```

On the normal exit path, the database will free every allocation it still owns.

---
@quiz
## What is true after free?
```c
free(number);
```
- [ ] `number` automatically becomes `NULL`
- [x] `number` holds an old address that must not be dereferenced
- [ ] The block remains valid until the function returns
> `free` releases the block but does not change the pointer variable. Using that old address is undefined behavior.

---
@build
## Allocate, use, and free
This complete program gives the allocation one clear owner: `main`.

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
  int id;
} Row;

int main(void) {
  Row *row = malloc(sizeof *row);
  if (row == NULL) {
    fprintf(stderr, "Could not allocate a row.\n");
    exit(EXIT_FAILURE);
  }

  row->id = 42;
  printf("%d\n", row->id);

  free(row);
  return 0;
}
```

The program initializes the field before reading it and frees the row on normal exit.
