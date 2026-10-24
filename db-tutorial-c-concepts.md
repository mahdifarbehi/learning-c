# C concepts used by the db_tutorial

Scope: all 15 parts currently linked from the official [db_tutorial table of contents](https://cstack.github.io/db_tutorial/), checked on 2026-10-24. The lists capture concepts introduced or materially exercised in each part rather than repeating every inherited construct that appears in a cumulative diff.

## [Part 1 - Introduction and Setting up the REPL](https://cstack.github.io/db_tutorial/parts/part1.html)

- Translation units and standard-library headers with `#include`.
- `main(int argc, char *argv[])`, function definitions, return values, and process exit status.
- `typedef struct`, struct fields, pointers to structs, `->`, address-of (`&`), and pointer-to-pointer parameters.
- C strings as null-terminated `char` arrays; `strcmp`; indexing a character buffer; writing the terminating zero byte.
- `size_t`, POSIX `ssize_t`, `FILE *`, and `stdin`.
- Dynamic allocation and ownership with `malloc`, `sizeof`, `NULL`, and `free`.
- POSIX `getline`, including its ability to allocate/update a caller's buffer.
- `printf`, conditionals, an infinite `while` loop, `bool`/`true`, and `exit(EXIT_SUCCESS/EXIT_FAILURE)`.

## [Part 2 - World's Simplest SQL Compiler and Virtual Machine](https://cstack.github.io/db_tutorial/parts/part2.html)

- `typedef enum` for statement kinds and explicit success/error result codes (C has no exceptions).
- `switch`/`case`, `break`, and `continue` for exhaustive-looking result dispatch.
- Structs containing enum state.
- Output parameters: passing `&statement` so a function can mutate the caller's struct.
- String prefix versus whole-string comparison with `strncmp` and `strcmp`.
- Character-array indexing (`buffer[0]`) and decomposition into small typed functions.

## [Part 3 - An In-Memory, Append-Only, Single-Table Database](https://cstack.github.io/db_tutorial/parts/part3.html)

- Object-like and function-like `#define` macros.
- Fixed-width integers from `<stdint.h>` (`uint32_t`) and fixed-size `char` arrays inside structs.
- Nested structs and fixed-size arrays of page pointers.
- `sizeof`-based field sizing, including the `((Struct *)0)->field` idiom used only as an unevaluated `sizeof` operand.
- Manual byte layouts: field sizes, offsets, row size, and serialization/deserialization with `memcpy`.
- Generic `void *` page buffers and raw-address arithmetic.
- Lazy page allocation with `malloc`, `NULL` checks, and explicit cleanup with `free`.
- Integer division, remainder (`%`), and multiplication for page/row/byte addressing.
- Formatted parsing with `sscanf`, counted `for` loops, and enum-based execution errors.

## [Part 4 - Our First Tests (and Bugs)](https://cstack.github.io/db_tutorial/parts/part4.html)

- The null terminator's storage cost: a maximum-length C string needs an extra byte.
- Buffer-overflow risk when formatted input or copying exceeds a fixed array.
- Destructive tokenization with `strtok`, including subsequent calls with `NULL`.
- Missing-token checks via null pointers.
- `strlen`, `strcpy`, and `atoi`; validating lengths before copying.
- Parsing into signed `int` before rejecting a negative value and assigning to unsigned row storage.
- Adding enum result values and handling them in a `switch`.
- The test harness is Ruby/RSpec; it tests the C executable but does not add C-language concepts.

## [Part 5 - Persistence to Disk](https://cstack.github.io/db_tutorial/parts/part5.html)

- Command-line arguments (`argc`, `argv`) and `const char *` filenames.
- POSIX file descriptors and `open`, `read`, `write`, `lseek`, and `close`.
- Combining open/permission flags with bitwise OR (`|`).
- System-facing types and errors: `off_t`, `ssize_t`, `errno`, and `-1` failure checks.
- A pager/page cache represented with nested structs and an array of `void *` page buffers.
- Cache-miss allocation, full versus partial page I/O, and explicit ownership/cleanup of cached pages.
- File offsets calculated from page number and page size.
- Host object representation: little- versus big-endian byte order, null-terminated stored fields, and uninitialized bytes copied from memory.
- `memcpy` versus `strncpy` when serializing fixed-size text fields.

## [Part 6 - The Cursor Abstraction](https://cstack.github.io/db_tutorial/parts/part6.html)

- A cursor struct holding a table pointer, numeric position, and `bool` end sentinel.
- Heap-allocated constructor functions that return struct pointers.
- Pointer-returning accessors and mutation of traversal state through a pointer.
- One-past-the-end representation and `while`-based iteration.
- Matching each cursor allocation with `free`.
- A C function interface used to hide the underlying storage representation.

## [Part 7 - Introduction to the B-Tree](https://cstack.github.io/db_tutorial/parts/part7.html)

- No C syntax or code is introduced; the page explicitly says it contains no code.
- It supplies implementation prerequisites rather than C concepts: B-tree/B+ tree invariants, internal versus leaf nodes, sorted keys, balancing, child page numbers, and search/insert complexity.

## [Part 8 - B-Tree Leaf Node Format](https://cstack.github.io/db_tutorial/parts/part8.html)

- A `NodeType` enum plus `uint8_t` and `uint32_t` fields for a compact on-disk layout.
- Encoding struct-like records manually in raw page memory using field sizes and byte offsets.
- `void *` buffers, pointer arithmetic, casts/typed pointer returns, and dereferencing field-accessor results for both reads and writes.
- Derived layout/capacity constants computed with `sizeof` and integer arithmetic.
- Initializing raw storage and tracking page counts.
- Moving overlapping logical cells rightward with a reverse loop and `memcpy`.
- Refactoring cursor, pager, and table structs as their stored state changes.

## [Part 9 - Binary Search and Duplicate Keys](https://cstack.github.io/db_tutorial/parts/part9.html)

- Half-open-range binary search implemented with integer indexes and a `while` loop.
- Returning either an exact-match position or an insertion position in a heap-allocated cursor.
- Reading/writing a one-byte serialized enum through `uint8_t *` casts.
- Converting between `uint8_t` and `NodeType`.
- Detecting equality before insertion and extending enum-based execution errors for duplicate keys.

## [Part 10 - Splitting a Leaf Node](https://cstack.github.io/db_tutorial/parts/part10.html)

- Reverse iteration with signed `int32_t` so the loop can pass through zero safely.
- Redistributing raw cells with `%`, pointer-based accessors, and `memcpy`.
- Page-sized copying and initialization of newly allocated logical nodes.
- Encoding internal-node headers and child/key cells as byte offsets in raw memory.
- Root flags stored as bytes, including casts between `bool` and `uint8_t`.
- Pointer-returning accessors with bounds checks and a separately stored rightmost child.
- Recursive tree printing with enum-based `switch` dispatch.
- Integer capacity and split-count calculations.

## [Part 11 - Recursively Searching the B-Tree](https://cstack.github.io/db_tutorial/parts/part11.html)

- Recursive functions that return a `Cursor *` from deeper tree levels.
- Enum-based `switch` dispatch between leaf and internal child nodes.
- Binary search over serialized internal-node keys.
- Dereferencing pointer-returning child accessors to obtain page numbers.

## [Part 12 - Scanning a Multi-Level B-Tree](https://cstack.github.io/db_tutorial/parts/part12.html)

- Extending a serialized header and recalculating all dependent offsets/sizes.
- A leaf-sibling link stored as a `uint32_t` page number, with page `0` as a sentinel.
- A pointer-returning accessor for the new header field and mutation through dereferencing.
- Cursor state transitions across pages while scanning linked leaves.
- Debugging a raw-memory destination error: writing the row value at the value offset and the key at the key offset.

## [Part 13 - Updating Parent Node After a Split](https://cstack.github.io/db_tutorial/parts/part13.html)

- Parent references represented as `uint32_t` page numbers and exposed through pointer-returning metadata accessors.
- Extracting a reusable binary-search helper for child-index selection.
- In-place mutation of parent separator keys.
- Ordered insertion by shifting serialized cells with `memcpy`.
- Special handling for an internal node's separately stored rightmost child.
- Pointer-arithmetic scaling: adding to `uint32_t *` advances in units of `uint32_t`, so the code casts before adding a byte offset.
- The tutorial's byte-offset calculations use arithmetic directly on `void *`; our code will instead use `char *` or `uint8_t *`.

## [Part 14 - Splitting Internal Nodes](https://cstack.github.io/db_tutorial/parts/part14.html)

- A function forward declaration to allow mutually dependent call order.
- `#define INVALID_PAGE_NUM UINT32_MAX` as an explicit sentinel.
- Initializing raw memory rather than relying on indeterminate bytes, plus guards before invalid child/page access.
- Mutable aliases such as `uint32_t *old_num_keys` and in-place increment/decrement through dereferencing.
- Signed reverse loops for moving children out of an internal node.
- The conditional (`?:`) operator for choosing the split destination.
- Recursive maximum-key lookup and cascading insert/split calls.
- Maintaining parent pointers while copying/moving serialized children and carefully ordering metadata updates.

## [Part 15 - Where to go next](https://cstack.github.io/db_tutorial/parts/part15.html)

- No C code or C concept is introduced. This is an archival closing page linking to further learning material.

## Inventory conventions

- This is a raw inventory of language constructs, C/POSIX interfaces, memory/layout concerns, and C implementation techniques used by the tutorial. The later C Basics proposal will give a concept its own lesson only when it is specific to C and cannot be guessed from another language.
- The tutorial's later pages contain cumulative diffs. Repeated fundamentals are listed again only when a part materially exercises or changes them.
- Parts 7 and 15 are included for completeness even though they introduce no C code.
- The inventory records what the tutorial uses. Course code will be written independently and corrected according to the project brief.
- Part 2's title follows its page heading (`World's`) rather than the table of contents/browser title (`World’s`).
