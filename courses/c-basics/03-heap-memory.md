# Heap memory and ownership

@concept
## Stack and heap
Local variables live on the **stack**. They appear when the function starts and are gone when it returns.

The **heap** is memory you ask for and give back yourself. It stays until you free it. C has no garbage collector.
---
@concept
## A local dies with its function
```c
int *broken(void) {
  int x = 5;
  return &x;  // x is gone after return
}
```
The returned address points at memory that no longer belongs to `x`. Using it is undefined behavior. `-Wall` warns about this.
---
@concept
## malloc asks for bytes
```c
User *u = malloc(sizeof(User));
```
`malloc(n)` reserves `n` bytes on the heap and returns their address. `sizeof(User)` is the number of bytes a `User` needs. `malloc` comes from `<stdlib.h>`.

`malloc` returns a `void *`, a pointer with no type. C converts it to `User *` for you.
---
@concept
## malloc can fail
When there is no memory left, `malloc` returns `NULL`. Check every time:
```c
if (u == NULL) {
  perror("malloc");
  exit(EXIT_FAILURE);
}
```
`perror` prints your text and the reason for the last failure, for example `malloc: Cannot allocate memory`.
---
@concept
## New memory holds garbage
`malloc` does not clear memory. The bytes are whatever was there before. The same goes for a local variable you do not initialize.

`calloc(count, size)` returns memory filled with zeros. `memset(p, 0, n)` sets `n` bytes at `p` to zero.
---
@concept
## free gives it back
```c
free(u);
```
Free every block you allocate, exactly once. A block you never free is a **memory leak**. `free(NULL)` does nothing, so it is always safe.
---
@concept
## After free, hands off
Once you free a block, you must not read it, write it, or free it again. All three are undefined behavior. They often seem to work, and then fail somewhere far away.
---
@concept
## Ownership
C does not track who should free a block. You decide, and you stick to the rule: the **owner** frees it.

Make it visible in names. If `db_open` allocates, `db_close` frees. When a library function gives you memory, its documentation says who frees it.
---
@quiz
## What does malloc return when it fails?
- [ ] 0 bytes of valid memory
- [x] `NULL`
- [ ] It crashes the program
> `malloc` returns `NULL` on failure, so code should check for it.
---
@quiz
## What happens here?
```c
char *p = malloc(10);
free(p);
free(p);
```
- [ ] The second free is ignored
- [x] Undefined behavior: it may crash or corrupt memory
- [ ] The memory is freed twice as fast
> Only `free(NULL)` is a safe no-op. Freeing the same block twice is a bug.
---
@quiz
## What do you get from `int *p = malloc(4 * sizeof(int));` before you write anything?
- [ ] Four zeros
- [x] Four ints with unknown values
- [ ] `NULL`, until you write to it
> `malloc` does not clear memory. Use `calloc` when you need zeros.
