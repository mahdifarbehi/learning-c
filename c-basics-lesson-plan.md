# C Basics lesson plan

Checkpoint 2 proposal. The list is deliberately short: a topic gets its own lesson only when it is specific to C and cannot be safely guessed from experience in another language.

## 1. How C becomes a program

Slug: `c-basics/how-c-becomes-a-program`

First required: SQLite Part 1, before compiling the REPL.

Cards cover:

- The course's single platform sentence: "This course targets Linux and macOS; on Windows, use WSL."
- Source files, compilation, and running the resulting executable.
- Compiling with `gcc -Wall -Wextra main.c -o db`.
- Course code must compile with that command using Linux GCC and macOS Clang, without feature-test macros.
- Headers as declarations needed before a function or type is used.
- `main`, its return value, and process exit status.
- Function declarations, including the later need for a forward declaration.

Estimated card count: 10.

## 2. Pointers, structs, and function arguments

Slug: `c-basics/pointers`

First required: SQLite Part 1, when the input-buffer type is introduced.

Cards cover:

- An object, its value, and its address.
- Pointer types, `&`, `*`, and `NULL`.
- C passes arguments by value; a pointer lets a function reach the caller's object.
- A pointer-to-pointer lets a function replace the caller's pointer.
- The small amount of struct syntax needed by the project: `typedef struct`, `.`, and `->`.
- `const` on data reached through a pointer.
- Before any example that can invoke it, one card defines undefined behavior and uses out-of-bounds access, use after `free`, and reading uninitialized memory as examples.

Structs do not get a separate lesson because their role as records is familiar from other languages; only their C syntax and pointer interaction need explanation.

Estimated card count: 13.

## 3. Heap memory and ownership

Slug: `c-basics/heap-memory`

First required: SQLite Part 1, when the input buffer is allocated.

Cards cover:

- Automatic lifetime versus dynamically allocated lifetime.
- `malloc(sizeof *pointer)`, its uninitialized bytes, and its `NULL` failure result.
- Giving each allocation a clear owner.
- Freeing allocations on the normal exit path.
- Leaks, dangling pointers, and use-after-free as consequences of broken ownership.

Estimated card count: 10.

## 4. Arrays, strings, and buffers

Slug: `c-basics/arrays-strings-buffers`

First required: SQLite Part 1, when the REPL reads and compares a command.

Cards cover:

- Arrays are fixed-size contiguous storage, and array indexing has no bounds check.
- In most expressions, an array becomes a pointer to its first element.
- A C string is a `char` array ending in `\0`.
- String length and buffer capacity are different; the terminator needs space.
- Why strings use functions such as `strcmp` instead of `==`.
- `getline` can allocate or grow a buffer through a pointer-to-pointer.
- Remove a trailing newline only when the last character is actually `\n`.
- Bounded copying into fixed-size fields.

Estimated card count: 12.

## 5. Bytes, offsets, and data layout

Slug: `c-basics/bytes-and-layout`

First required: SQLite Part 3, before rows are serialized into pages.

Cards cover:

- `sizeof`, `size_t`, `ssize_t`, and fixed-width integers such as `uint32_t`.
- A `uint8_t *` as a pointer used to move through raw memory one byte at a time.
- Pointer arithmetic scales by the pointed-to type.
- Struct padding means `sizeof` a struct may be larger than the sum of its fields; this is why the database writes fields into raw bytes instead of saving a struct directly.
- Computing field sizes and byte offsets explicitly.
- Reading and writing layout fields through small accessor functions.
- Copying bytes with `memcpy`, and using `memmove` when source and destination can overlap.
- Serializing a row into bytes and reconstructing it later.

Estimated card count: 14.

## Topics that stay inside SQLite cards

These do not justify separate C Basics lessons:

- `enum`, `switch`, error-result values, macros, the conditional operator, and signed reverse loops: explain their C syntax in one sentence when first used.
- POSIX file descriptors and `open`, `read`, `write`, `lseek`, and `close`: explain their behavior at the persistence build step.
- Cursors, binary search, recursion, linked leaves, and B-trees: these are implementation or database ideas, not C-specific language concepts.

## SQLite prerequisite table

| SQLite part | Required C Basics lessons |
| --- | --- |
| 1 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers` |
| 2 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers` |
| 3 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 4 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 5 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 6 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 7 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 8 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 9 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 10 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 11 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 12 | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |
| 13+ | `c-basics/how-c-becomes-a-program`, `c-basics/pointers`, `c-basics/heap-memory`, `c-basics/arrays-strings-buffers`, `c-basics/bytes-and-layout` |

## Owner notes: planned differences from the tutorial

This section is for checkpoint review only and will not appear in the lessons.

- Our code will be a clean, cumulative implementation, not copied or reconstructed from the tutorial's diffs.
- Every translation unit will include the declarations it needs. Course code will be checked with `gcc -Wall -Wextra main.c -o db` on Linux GCC and macOS Clang, without feature-test macros.
- Allocations will not be cast in C. A failed allocation will print a message and exit; allocations will be freed on the normal exit path.
- Fatal errors, including failed file reads and writes, will print a message and exit without recovery code or error-path cleanup.
- Input handling will remove `\n` only when present and will handle end-of-file separately from a read error.
- Numeric and text input will use explicit bounds and conversion checks. If parsing needs a function absent from this plan, its SQLite card will explain it in one sentence rather than adding a Basics lesson.
- Raw page arithmetic will use `uint8_t *`, never arithmetic on `void *`.
- Fixed-width integers will be cast to `unsigned` and printed with `%u`; `size_t` values will use `%zu`.
- Serialized buffers and node metadata will be initialized explicitly so uninitialized bytes are not treated as stored data.
- Reads and writes will use one check that the result equals the expected size. Any mismatch is fatal; partial I/O will not have separate handling.
- Page numbers, cell indexes, string capacities, and cache limits will be checked before memory is accessed.
