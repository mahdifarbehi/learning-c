# Bytes, offsets, and data layout

@concept
## A database page is raw storage
The database stores rows inside page-sized byte arrays. It decides which bytes hold each field instead of asking C to save a struct directly.

This makes the page layout explicit: the code computes every field's size and offset.

---
@concept
## Fixed-width integers state their size
`<stdint.h>` provides integer types with exact widths. `uint32_t` is an unsigned integer containing 32 bits.

```c
#include <stdint.h>
#include <stdio.h>

uint32_t id = 42;
printf("%u\n", (unsigned)id);
```

The cast gives `printf` the `unsigned int` expected by `%u`.

---
@concept
## Sizes use size_t
`size_t` is the unsigned type used for object sizes and array capacities. Print it with `%zu`.

`ssize_t` is its signed counterpart in the interfaces used here, allowing `-1` to report failure.

```c
#include <stdio.h>
#include <sys/types.h>

size_t page_size = 4096;
printf("%zu\n", page_size);
```

---
@concept
## sizeof measures storage
`sizeof` reports how many bytes a type or object occupies. Its result has type `size_t`.

```c
size_t id_size = sizeof(uint32_t);
size_t row_size = sizeof row;
```

The operand in `sizeof row` is not evaluated.

---
@concept
## Structs may contain padding
**Alignment** is a requirement that some values begin at particular address boundaries. The compiler may leave unused padding bytes between struct fields to meet it, so `sizeof` a struct may exceed the sum of its field sizes.

```c
typedef struct {
  char tag;
  uint32_t id;
} TaggedId;
```

That is why the database writes individual fields into a raw byte layout instead of copying the struct as its file format.

---
@concept
## uint8_t pointers move by bytes
`uint8_t` is an unsigned 8-bit integer type. A `uint8_t *` gives the database a typed way to address individual bytes.

```c
uint8_t *bytes = page;
uint8_t *fifth_byte = bytes + 4;
```

Adding `4` moves from byte offset 0 to byte offset 4.

---
@concept
## Pointer arithmetic scales by type
Adding one to a pointer moves by the size of the pointed-to type.

```diagram
uint8_t pointer + 1  -> next byte
uint32_t pointer + 1 -> next uint32_t
```

Use a `uint8_t *` when an offset is measured in bytes.

---
@concept
## Derive offsets from earlier fields
An **offset** is a field's distance in bytes from the start of a record. Derive each offset from the field before it.

```c
static const size_t ID_OFFSET = 0;
static const size_t USERNAME_OFFSET = ID_OFFSET + sizeof(uint32_t);
```

At file scope, `static` keeps these names inside this source file. Changing the first field's size updates the next field's offset from the same calculation.

---
@concept
## Write an integer with memcpy
`memcpy` copies a stated number of bytes between regions that do not overlap.

```c
#include <stdint.h>
#include <stddef.h>
#include <string.h>

void write_u32(uint8_t *page, size_t offset, uint32_t value) {
  memcpy(page + offset, &value, sizeof value);
}
```

`page + offset` is byte arithmetic because `page` points to `uint8_t`.

---
@concept
## Read an integer with memcpy
Copy bytes into a real `uint32_t` object before returning the value.

```c
uint32_t read_u32(const uint8_t *page, size_t offset) {
  uint32_t value;
  memcpy(&value, page + offset, sizeof value);
  return value;
}
```

The copy initializes every byte of `value` before it is read.

---
@build
## Serialize one row
**Serialization** turns a value into the bytes chosen for storage.

```c
typedef struct {
  uint32_t id;
  char username[32];
} Row;

void serialize_row(const Row *row, uint8_t *destination) {
  memcpy(destination + ID_OFFSET, &row->id, sizeof row->id);
  memcpy(destination + USERNAME_OFFSET,
         row->username,
         sizeof row->username);
}
```

This continues with the offsets from the earlier card. The caller provides enough destination space and an initialized `Row`.

---
@build
## Deserialize one row
**Deserialization** reconstructs a value from stored bytes.

```c
void deserialize_row(const uint8_t *source, Row *row) {
  memcpy(&row->id, source + ID_OFFSET, sizeof row->id);
  memcpy(row->username,
         source + USERNAME_OFFSET,
         sizeof row->username);
}
```

Using the same offsets in both directions makes the layout reversible.

---
@concept
## Overlap requires memmove
`memcpy` requires separate source and destination regions. `memmove` is the byte-copying function to use when the regions might overlap.

```c
memmove(cells + cell_size, cells, used_bytes);
```

This can shift existing cells right within one page without reading bytes after they have been overwritten.

---
@quiz
## How far does each expression move?
```c
uint8_t *byte_pointer = page;
uint32_t *integer_pointer = values;
```
- [ ] Both `byte_pointer + 1` and `integer_pointer + 1` move one byte
- [x] The first moves one byte; the second moves by `sizeof(uint32_t)`
- [ ] Both move by `sizeof(uint32_t)`
> Pointer arithmetic is scaled by the pointed-to type, which is why byte offsets use `uint8_t *`.
