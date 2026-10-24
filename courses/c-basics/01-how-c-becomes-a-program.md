# How C becomes a program

@concept
## The platform for this course
This course targets Linux and macOS; on Windows, use WSL.

We will write source code in plain text files and use a compiler already available for that platform.

---
@concept
## Source is not the program
A `.c` file is source code. A **compiler** translates that source into an executable file that the operating system can run.

Changing the source does not change the executable. Compile again after every change.

---
@build
## Compile, then run
This command compiles `main.c` and names the executable `db`:

```sh
gcc -Wall -Wextra main.c -o db
```

Run the new executable with `./db`.

---
@concept
## Ask for warnings
`-Wall` and `-Wextra` make the compiler report many suspicious constructs that it would otherwise accept.

A warning is not proof that the program is broken, but it should be understood and fixed before continuing.

---
@concept
## Headers provide declarations
A **declaration** tells the compiler the name and type of something before it is used. Standard headers provide declarations for library functions and types.

```c
#include <stdio.h>

printf("hello\n");
```

Here `<stdio.h>` declares `printf`.

---
@concept
## Execution starts at main
The operating system starts a C program by calling `main`. Writing `void` between the parentheses says this version takes no arguments.

```c
int main(void) {
  return 0;
}
```

The returned integer becomes the program's exit status. Zero means success.

---
@quiz
## What exit status does this program report?
```c
int main(void) {
  return 2;
}
```
- [ ] Success
- [x] Failure with status 2
- [ ] The program does not compile
> `main` returns the process exit status. Any nonzero value reports failure.

---
@concept
## A definition supplies the body
A function declaration gives its type. A **definition** also supplies the function body.

```c
void print_prompt(void);          // declaration

void print_prompt(void) {         // definition
  printf("db > ");
}
```

A declaration lets C check a call even when the definition appears later in the file.

---
@quiz
## What does the early declaration allow?
```c
void print_prompt(void);

int main(void) {
  print_prompt();
  return 0;
}
```
- [ ] It runs `print_prompt` before `main`
- [x] It lets the compiler check the call before seeing the function body
- [ ] It prints the prompt during compilation
> C processes declarations in source order. The declaration provides the function's type before the call.

---
@build
## A complete first program
This program declares a helper, calls it, and defines it afterward.

```c
#include <stdio.h>

void print_prompt(void);

int main(void) {
  print_prompt();
  return 0;
}

void print_prompt(void) {
  printf("db > ");
}
```

Compile it with the command from earlier. Running it prints `db > `.
