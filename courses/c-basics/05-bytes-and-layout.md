# Bytes, offsets, and data layout

@concept
## sizeof counts bytes
`sizeof(x)` or `sizeof(Type)` is the number of bytes something takes. The compiler works it out, so it costs nothing at run time. The result has type `size_t`, an unsigned integer.

`sizeof(char)` is always 1.
---
@concept
## Exact-size integers
How big an `int` is depends on the machine. It is usually 4 bytes, but C only promises at least 2.

`<stdint.h>` has types with exact sizes: `uint8_t` is 1 byte (0 to 255), and `uint32_t` is 4 bytes (0 to 4294967295). Use them for anything you store in a file.
---
@concept
## Unsigned numbers wrap around
```c
uint32_t n = 0;
n = n - 1;  // 4294967295
```
Unsigned arithmetic never goes negative. It wraps around. Watch out for `n - 1` when `n` can be 0.
---
@concept
## Structs contain padding
```c
typedef struct {
  uint32_t id;
  char name[33];
} Row;
```
The fields add up to 37 bytes, but `sizeof(Row)` is 40. The compiler adds **padding** so that fields sit at addresses the CPU reads quickly.

You do not control padding. So to store a struct in a file, copy each field to an offset you choose.
---
@concept
## char * moves by bytes
A `char *` points at one byte. Adding `n` moves it `n` bytes:
```c
char *page = buffer;
char *field = page + 37;  // 37 bytes in
```
Pointer arithmetic counts in elements of the pointed-at type. A `uint32_t *` plus 1 moves 4 bytes. To move by bytes, use `char *`.
---
@concept
## memcpy copies bytes
```c
memcpy(destination, source, n);
```
`memcpy` copies `n` bytes from one address to another, whatever they hold. It comes from `<string.h>`.

The two areas must not overlap.
---
@concept
## memmove handles overlap
To shift bytes inside one buffer, use `memmove`. It copies correctly even when the source and destination overlap.
```c
char s[] = "abcd";
memmove(s + 1, s, 3);  // s is now "aabc"
```
```diagram
before: a b c d
after: a a b c
```
---
@concept
## Read numbers out of bytes with memcpy
To read a `uint32_t` at some byte offset, do not cast the `char *` to `uint32_t *` and read through it. The address may not be suitably aligned, and C's rules on mixing pointer types make that undefined behavior.

Copy the bytes into a real variable instead:
```c
uint32_t read_u32(const char *bytes) {
  uint32_t value;
  memcpy(&value, bytes, 4);
  return value;
}
```
Compilers turn this into a single load.
---
@quiz
## `uint32_t *p` holds address 100. Which address does `p + 2` hold?
- [ ] 102
- [x] 108
- [ ] 200
> Each step moves one `uint32_t`, which is 4 bytes.
---
@quiz
## What does this print?
```c
uint32_t n = 0;
n = n - 1;
printf("%u\n", n);
```
- [ ] -1
- [ ] 0
- [x] 4294967295
> Unsigned arithmetic wraps around to the largest value.
---
@quiz
## A struct has a `uint32_t` and a `char[33]`. Why can its sizeof be 40?
- [ ] The compiler adds a hidden length field
- [x] The compiler adds padding for alignment
- [ ] `sizeof` rounds up to a multiple of 10
> Padding keeps fields aligned. That is why we choose our own byte layout for files.
---
@quiz
## You need to shift bytes one place to the right inside the same buffer. Which call is safe?
- [ ] `memcpy`
- [x] `memmove`
- [ ] `strcpy`
> The source and destination overlap, and only `memmove` handles that.
