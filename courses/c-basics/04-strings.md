# Strings and buffers

@concept
## A string ends with a zero byte
C has no string type. A string is a row of `char` values ending with the byte `'\0'`, which has the value 0. This byte is called the **null terminator**.

So `"hi"` takes three bytes.
```diagram
"hi"
'h' 'i' '\0'
```
---
@concept
## Arrays have a fixed size
```c
char name[8];  // 7 characters plus '\0'
```
An array's size is fixed when you write the code. It cannot grow. Indexes start at 0, so `name[7]` is the last element.
---
@concept
## C never checks indexes
`name[8] = 'x';` compiles. It writes into whatever memory comes after the array.

This is a **buffer overflow**: undefined behavior, and a classic security hole. Checking sizes is your job.
---
@concept
## An array passed is a pointer
When you pass an array to a function, C passes the address of its first element. That is why functions take strings as `char *`.

The function cannot tell how big the array is. It relies on the `'\0'` or on a size you pass.
---
@concept
## strlen counts to the zero
`strlen("hi")` is 2. It counts characters until the first `'\0'`, which it does not count. An array must have room for `strlen(s) + 1` bytes.

`strlen` and the other string functions here come from `<string.h>`.
---
@concept
## Compare with strcmp, not ==
`a == b` on two strings compares their addresses, not their text. Use `strcmp(a, b)`. It returns **0 when they are equal**.
```c
if (strcmp(line, ".exit") == 0) {
  // the user typed .exit
}
```
`strncmp(a, b, n)` compares at most the first `n` characters. It is handy for "starts with".
---
@concept
## strcpy trusts you
`strcpy(dest, src)` copies `src` and its `'\0'` into `dest`. It never checks whether `dest` is big enough.

So check first: copy only when `strlen(src)` is less than the size of `dest`.
---
@concept
## String literals live forever
Text in quotes, like `"Executed."`, is stored for the whole run of the program. A function can safely return a pointer to one.

You must not change a literal, so point at it with `const char *`.
---
@concept
## Reading a line with getline
```c
char *line = NULL;
size_t capacity = 0;
ssize_t length = getline(&line, &capacity, stdin);
```
`getline` is POSIX, not standard C. It allocates a buffer, or grows it when needed, and stores the address in `line`. It returns the number of characters read, or -1 at the end of input.

`ssize_t` is a signed size type. You must `free(line)` when you are done.
---
@concept
## The newline stays in
`getline` keeps the `'\n'` at the end of the line, when there is one. The last line of a file may not have one. Strip the newline only if it is there:
```c
if (line[length - 1] == '\n') {
  line[length - 1] = '\0';
}
```
On success, `length` is at least 1, so `line[length - 1]` is safe.
---
@quiz
## What does this print?
```c
char word[] = "cat";
printf("%zu %zu\n", strlen(word), sizeof(word));
```
- [ ] 3 3
- [x] 3 4
- [ ] 4 4
> `strlen` stops before `'\0'`. `sizeof` counts the whole array, including `'\0'`.
---
@quiz
## What does this print?
```c
if (strcmp("abc", "abc")) {
  printf("same\n");
} else {
  printf("different\n");
}
```
- [ ] same
- [x] different
- [ ] Nothing
> `strcmp` returns 0 for equal strings, and 0 counts as false. Always write `strcmp(a, b) == 0`.
---
@quiz
## What happens here?
```c
char buf[4];
strcpy(buf, "hello");
```
- [ ] `buf` holds "hell"
- [ ] The compiler grows `buf`
- [x] It writes past the end of `buf`: undefined behavior
> "hello" needs 6 bytes. `strcpy` writes all 6 into a 4-byte array.
