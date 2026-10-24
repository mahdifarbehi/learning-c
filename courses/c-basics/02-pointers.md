# Pointers, structs, and function arguments

@concept
## Objects have addresses
An **object** is a region of memory that holds a value. Its address says where that region begins.

```c
int count = 5;
```

Here `count` is an object holding the integer `5`.

---
@concept
## A pointer stores an address
A **pointer** is an object whose value is another object's address. Its type says what kind of object it can point to.

```c
int count = 5;
int *pointer = &count;
```

`&count` means “the address of `count`.”

```diagram
pointer -> count
count = 5
```

The arrow is a picture of the relationship, not C syntax.

---
@concept
## NULL points nowhere
`NULL` is used when a pointer does not point to an object.

```c
int *pointer = NULL;
```

Check for `NULL` before following a pointer that might be empty.

---
@concept
## Dereferencing follows a pointer
Putting `*` before a pointer expression accesses the object at that address. This is called **dereferencing**.

```c
int count = 5;
int *pointer = &count;
printf("%d\n", *pointer);
```

The code prints `5`.

---
@concept
## A pointer can change its target
Dereferencing can also be used on the left side of an assignment.

```c
int count = 5;
int *pointer = &count;
*pointer = 9;
```

The assignment changes `count` because `pointer` points to it.

---
@quiz
## What does this print?
```c
int value = 3;
int *pointer = &value;
*pointer = 7;
printf("%d\n", value);
```
- [ ] 3
- [x] 7
- [ ] An address
> Writing through `pointer` changes the same object later read as `value`.

---
@concept
## C passes arguments by value
A function receives its own copy of each argument. Assigning to a parameter changes that copy, not the caller's object.

```c
void set_to_nine(int value) {
  value = 9;
}
```

Calling `set_to_nine(count)` does not change `count`.

---
@concept
## Pass an address to mutate a caller
A pointer parameter gives the function the address of the caller's object.

```c
void set_to_nine(int *value) {
  *value = 9;
}

int count = 5;
set_to_nine(&count);
```

After the call, `count` is `9`.

---
@concept
## A pointer-to-pointer can replace a pointer
To change where the caller's pointer points, a function needs the pointer's address. The parameter type therefore contains two `*` characters.

```c
void choose(int **result, int *choice) {
  *result = choice;
}

int value = 8;
int *selected = NULL;
choose(&selected, &value);
```

After the call, `selected` points to `value`.

---
@concept
## A struct groups fields
A **struct** is a C type that groups related objects. `typedef` gives the type a shorter name.

```c
#include <stddef.h>

typedef struct {
  char *buffer;
  size_t capacity;
} InputBuffer;
```

`size_t` is C's type for object sizes and buffer capacities. The struct's role is like a record or data class in other languages.

---
@concept
## Dot or arrow reaches a field
Use `.` when you have a struct object. Use `->` when you have a pointer to one.

```c
InputBuffer input;
InputBuffer *pointer = &input;

input.capacity = 0;
pointer->buffer = NULL;
```

`pointer->buffer` is shorthand for `(*pointer).buffer`.

---
@concept
## const protects reached data
Putting `const` before the pointed-to type prevents writes through that pointer.

```c
#include <stdio.h>

void show(const int *value) {
  printf("%d\n", *value);
}
```

`show` can read the integer but cannot assign to `*value`.

---
@concept
## Undefined behavior has no promised result
**Undefined behavior** means the C language places no requirements on what happens. The program may appear to work, print nonsense, crash, or change behavior after recompilation.

Reading outside an array, using memory after `free`, and reading an uninitialized value are all undefined behavior. `free` is the function that releases heap memory; the next lesson explains its use. The course avoids these operations rather than trying to predict their results.
