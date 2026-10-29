# Pointers, structs, and function arguments

@concept
## Every variable has an address
Memory is a long row of bytes, and each byte has a number: its **address**. Every variable sits at some address.

A **pointer** is a variable that holds an address.
---
@concept
## & and *
```c
int x = 5;
int *p = &x;  // p holds the address of x
*p = 7;       // write to what p points at
printf("%d\n", x);  // 7
```
`&x` is the address of `x`. `*p` is the value that `p` points at. In a declaration, `int *p` means "p is a pointer to an int".
```diagram
p -> x
x = 7
```
---
@concept
## Arguments are copies
C copies every argument into the function. Changing a parameter changes only the copy.
```c
void reset(int n) {
  n = 0;  // the caller's variable is untouched
}
```
---
@concept
## Pass an address to change a variable
To let a function change your variable, pass its address:
```c
void reset(int *n) {
  *n = 0;
}

int x = 5;
reset(&x);  // x is now 0
```
The pointer is still a copy, but the copy holds the same address.
---
@concept
## NULL points nowhere
`NULL` is a pointer value that means "no address". Functions often return `NULL` to say "nothing here" or "it failed".

Reading or writing through `NULL` is undefined behavior. Usually the program crashes.
---
@concept
## Structs group fields
```c
typedef struct {
  int id;
  int age;
} User;

User u = {.id = 1, .age = 30};
u.age = 31;
```
`typedef` gives the struct type a short name, `User`. `{.id = 1, .age = 30}` sets fields by name, and any field you leave out becomes 0.
---
@concept
## -> goes through a pointer
```c
void birthday(User *u) {
  u->age += 1;
}
```
`u->age` means "the `age` field of the struct that `u` points at". It is short for `(*u).age`.
---
@concept
## A pointer to a pointer
A pointer is a variable too, so it has its own address. A `char **` is the address of a `char *`.

You pass `&line` when a function needs to change where your `line` pointer points. You will see this soon with `getline`.
```diagram
&line -> line -> text
```
---
@concept
## const means read-only
```c
void print_user(const User *u);
```
With `const`, the function promises to read `*u` but never change it. The compiler rejects any write through `u`.
---
@concept
## Structs can be returned
A function can return a struct. The caller gets its own copy:
```c
User make_user(int id) {
  User u = {.id = id, .age = 0};
  return u;
}
```
For small structs this is simple and needs no extra memory management.
---
@quiz
## What does this print?
```c
void bump(int *p) {
  *p = *p + 1;
}

int x = 1;
bump(&x);
bump(&x);
printf("%d\n", x);
```
- [ ] 1
- [ ] 2
- [x] 3
> Each call adds 1 to `x` through its address.
---
@quiz
## What does this print?
```c
void reset(int n) {
  n = 0;
}

int x = 9;
reset(x);
printf("%d\n", x);
```
- [ ] 0
- [x] 9
- [ ] It does not compile
> `reset` changes its own copy of the value. `x` stays 9.
---
@quiz
## `u` is a `User *`. Which expression reads the same field as `u->age`?
- [ ] `u.age`
- [x] `(*u).age`
- [ ] `&u.age`
> `->` follows the pointer, then picks the field.
