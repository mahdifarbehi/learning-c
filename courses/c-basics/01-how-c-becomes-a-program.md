# How C becomes a program

@concept
## Compiled ahead of time
A C program is a text file that a **compiler** turns into an executable: a file of machine code your computer runs directly. There is no interpreter and no virtual machine at run time.

This course targets Linux and macOS; on Windows, use WSL.
---
@concept
## The smallest program
```c
#include <stdio.h>

int main(void) {
  printf("hello\n");
  return 0;
}
```
The program starts in `main`. The number `main` returns is the exit status: 0 means success.
---
@concept
## #include pastes a header
Lines that start with `#` are handled by the **preprocessor**, a step that edits the text before the compiler sees it.

`#include <stdio.h>` pastes in a **header**: a file that declares functions, here `printf`. Without the right header, the compiler does not know the function exists.
---
@build
## Compile and run
Save the program as `hello.c`, then:
```console
$ cc -Wall -Wextra -o hello hello.c
$ ./hello
hello
```
`cc` is your system's C compiler (gcc or clang). `-o hello` names the output file. `-Wall -Wextra` turn on warnings. Treat every warning as a bug to fix.

Editing `hello.c` does not change `hello`. Compile again after every change.
---
@concept
## #define replaces text
```c
#define PAGE_SIZE 4096
```
Before compiling, the preprocessor replaces every `PAGE_SIZE` in the file with `4096`. A `#define` has no type and uses no memory. It is plain text substitution.
---
@concept
## Wrap macros in parentheses
Because `#define` pastes text, operator precedence can surprise you:
```c
#define SIZE 2 + 3
int x = SIZE * 10;  // 2 + 3 * 10 = 32
```
With `#define SIZE (2 + 3)`, `x` is 50. Put parentheses around any `#define` that is an expression.
---
@concept
## Declare before use
The compiler reads the file from top to bottom. A function must be declared before the line that calls it.

Either define the function higher up, or write a **prototype**: its first line, ending in a semicolon.
```c
int add(int a, int b);  // prototype
```
A header is mostly a list of prototypes.
---
@concept
## Exit status and exit()
`return 0;` at the end of `main` reports success. From anywhere in the program, `exit(EXIT_FAILURE)` stops it at once and reports failure. `exit`, `EXIT_SUCCESS` and `EXIT_FAILURE` come from `<stdlib.h>`.
---
@concept
## printf formats
`printf` fills placeholders from its other arguments: `%d` for `int`, `%u` for `unsigned int`, `%s` for a string, `%zu` for `size_t`. `\n` is a newline.

The placeholder must match the argument's type. `-Wall` warns when it does not.
---
@concept
## Output waits in a buffer
`printf` does not send text to the screen right away. It collects it in a **buffer**, and on a terminal it sends the buffer at each newline.

To show text that has no newline, such as a prompt, call `fflush(stdout)`.
---
@concept
## Errors go to stderr
A program has two output streams: `stdout` for normal output and `stderr` for errors. Both appear in the terminal, but when you send normal output to a file, error messages still reach the screen.
```c
fprintf(stderr, "Something went wrong.\n");
```
`fprintf` works like `printf`, with the stream as its first argument.
---
@concept
## Undefined behavior
Some mistakes have no defined result in C: reading past the end of an array, using memory after freeing it, and more. This is **undefined behavior**. The program may crash, print garbage, or seem to work until one day it does not.

The compiler does not stop you, so you have to avoid these mistakes yourself.
---
@quiz
## What does this print?
```c
#define DOUBLE(x) x * 2
printf("%d\n", DOUBLE(1 + 1));
```
- [ ] 4
- [x] 3
- [ ] 2
> The text becomes `1 + 1 * 2`, which is 3. Written as `((x) * 2)`, it would print 4.
---
@quiz
## You call a function that is defined lower in the file, with no prototype. What happens?
- [ ] The compiler looks ahead and finds it
- [x] The compiler complains that it has not seen the function
- [ ] The program crashes when it reaches the call
> The compiler reads top to bottom. Define the function higher up, or add a prototype.
---
@quiz
## The code has a likely bug, and you compile with -Wall -Wextra. What happens?
- [x] The compiler prints a warning and still builds the program
- [ ] The compiler fixes the bug
- [ ] The program refuses to run
> Warnings do not stop the build. Read them and fix them.
