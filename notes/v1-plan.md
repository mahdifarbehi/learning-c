# v1 plan notes (for the owner only)

These are the outputs of the brief's checkpoints. They are not shown in the app.

## 1. C concepts per db_tutorial part

| Part | Topic | C concepts used |
|---|---|---|
| 1 | REPL | `#include`, `main`, `typedef struct`, pointers, `->`, `malloc`/`free`, `getline` (POSIX), `ssize_t`, `size_t`, `strcmp`, `printf`, `exit`, `bool` |
| 2 | SQL compiler and VM | `typedef enum`, `switch`, `strncmp`, structs passed by pointer, `continue` |
| 3 | In-memory table | `#define`, `uint32_t`, fixed `char` arrays, `sizeof` on a member through a cast null pointer, `memcpy`, `void *` arithmetic, `sscanf`, page/offset math with `/` and `%` |
| 4 | Tests and bugs | null terminator (`+ 1`), buffer overflow from `sscanf %s`, `strtok`, `atoi`, `strlen`, `strcpy` |
| 5 | Persistence | `open` flags and modes, `lseek`, `read`, `write`, `close`, `errno`, `off_t`, `argc`/`argv`, page cache |
| 6 | Cursor | struct holding a pointer, heap-allocated cursor, `bool` flag |
| 7 | B-tree theory | none |
| 8 | Leaf node format | `uint8_t`, constants from `sizeof`, offsets, pointer returns into a byte buffer, casts, `enum NodeType` |
| 9 | Binary search, duplicates | binary search loop, unsigned midpoint |
| 10 | Splitting a leaf | recursion (`print_tree`), copying whole pages with `memcpy`, node flags |
| 11 | Searching internal nodes | recursion, binary search over keys |
| 12 | Scanning multiple leaves | sentinel page number 0 |
| 13 | Updating the parent | parent pointer, shifting cells with `memcpy` |
| 14 | Splitting internal nodes | `UINT32_MAX` sentinel, mutual recursion |

## 2. C Basics lesson list

Rule applied: a concept gets its own lesson only if it is specific to C and could not be guessed from another language. Order is by first use in the SQLite course.

1. How C becomes a program: compiling, the preprocessor, `#include`, `#define`, prototypes, exit status, `printf` formats, output buffering, undefined behavior. First used in SQLite 1.
2. Pointers, structs, and function arguments: `&`, `*`, pass-by-copy, `NULL`, `typedef struct`, `->`, `char **`, `const`, returning structs. SQLite 1.
3. Heap memory and ownership: stack vs heap, `malloc`/`calloc`/`free`, checking for `NULL`, `perror`, garbage memory, ownership. SQLite 1.
4. Strings and buffers: `'\0'`, fixed arrays, no bounds checks, `strlen`, `strcmp`, `strcpy`, string literals, `getline`. SQLite 1.
5. Bytes, offsets, and data layout: `sizeof`, `uint32_t`, unsigned wraparound, padding, `char *` arithmetic, `memcpy`, `memmove`, reading numbers from bytes. SQLite 3.
6. Files and file descriptors: `open`, `errno`, file position, `lseek`, `read`, `write`, `close`. SQLite 5.

Covered in one sentence inside a card instead: `enum`, `bool`, `typedef`, `strtok`, `strtoll`, `argc`/`argv`, designated initializers, octal literals, recursion.

SQLite lessons map to tutorial parts as follows: 1–2 are parts 1–2, 3–4 are parts 3–4 rearranged (parse first, then storage), and 5–14 are parts 5–14.

## 3. Where our code differs from the tutorial

- No arithmetic on `void *`. Pages are `char *`.
- Header fields are read and written with `memcpy` (`read_u32`/`write_u32`) instead of casting to `uint32_t *`, which is unaligned and breaks aliasing rules.
- Constants are `#define`s. The tutorial's file-scope `const uint32_t X = Y + Z;` is not a constant expression in C.
- No `size_of_attribute` macro. `ID_SIZE` is just 4.
- No `InputBuffer` struct. `main` calls `getline` directly and frees the buffer.
- The newline is stripped only if it is there. End of input (Ctrl-D) closes the database cleanly instead of exiting with an error, so data is saved.
- `fflush(stdout)` after the prompt.
- No `sscanf`. `strtok` plus `strtoll`, with checks for non-numbers, negatives, and values above `UINT32_MAX` (the tutorial uses `atoi`).
- The row is zeroed before filling, so no uninitialized bytes reach the file. Pages are allocated with `calloc` for the same reason.
- Every `malloc`/`calloc` is checked. System calls go through `perror` via `die()`.
- `get_page` bounds check uses `>=` (the tutorial's `>` lets page 100 through).
- Part 5: the row count from the file length is computed as full pages × 13 plus leftover rows. The tutorial's `file_length / ROW_SIZE` is wrong after two full pages.
- `write` results are compared with the requested size.
- `prepare` and `execute` return `NULL` or an error message string instead of result enums and `switch` statements. `MetaCommandResult` is gone. `.exit` and `.btree` are handled in `main`.
- Cursors are returned by value. No `malloc`/`free` for cursors.
- `.constants` is dropped. `.btree` uses the final tree format from part 8 on.
- `printf` uses `%u` for `uint32_t`.
- Binary search returns the first key that is greater than or equal to the target (the same loop for leaves and internal nodes).
- Leaf split lines up all 14 cells in a stack buffer and copies the two halves out. The tutorial uses a backwards loop with `%` indexing.
- `table_start` walks down child 0 to the leftmost leaf instead of calling `table_find(0)`.
- `internal_node_find` is a loop inside `table_find`, not recursion.
- Parent updates use one routine: collect the parent's children in an array, insert the new page after the old one, and rewrite the node with `set_internal_node_children`, which also recomputes keys and parent pointers. Splitting an internal node splits that array in two. This replaces `update_internal_node_key`, the special right-child cases, `internal_node_split_and_insert`, and `INVALID_PAGE_NUM`.
- The stubs for unfinished features in lessons 10–11 ("searching an internal node", "scanning a tree") return an error to the REPL instead of exiting, so no data is lost. The deeper stubs in lessons 10–13 still exit, as in the tutorial.
- Pager is stored inside Table, not allocated separately.
- The `file_length` field disappears from Pager once pages are whole (lesson 8).

## Maintenance

- To add or rename a lesson, update the `COURSES` list in `index.html` and the `ASSETS` list in `sw.js`, then bump `CACHE` in `sw.js`.
- The service worker serves cached files first and refreshes them in the background, so an edited lesson appears on the second load.
