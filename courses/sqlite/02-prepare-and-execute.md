# Prepare and execute statements
requires: c-basics/pointers, c-basics/strings

@concept
## Two steps
SQLite first compiles the SQL text into a program, then runs that program. We do the same on a small scale: **prepare** turns text into a `Statement` struct, and **execute** acts on it.
```diagram
text -> prepare -> Statement
Statement -> execute -> result
```
Parsing stays out of the storage code, and storage stays out of the parser.
---
@concept
## enum names numbers
```c
typedef enum { STATEMENT_INSERT, STATEMENT_SELECT } StatementType;
```
An `enum` gives names to integer constants: here 0 and 1. It makes code readable, but C does not stop you from storing other numbers in it.
---
@build
## The Statement type
Add this after the headers:
```c
typedef enum { STATEMENT_INSERT, STATEMENT_SELECT } StatementType;

typedef struct {
  StatementType type;
} Statement;
```
---
@build
## prepare_statement
```c
// Returns NULL on success, or an error message.
const char *prepare_statement(const char *input, Statement *statement) {
  if (strncmp(input, "insert", 6) == 0) {
    statement->type = STATEMENT_INSERT;
    return NULL;
  }
  if (strcmp(input, "select") == 0) {
    statement->type = STATEMENT_SELECT;
    return NULL;
  }
  return "Unrecognized statement.";
}
```
`insert` uses `strncmp` because it will be followed by values. `select` must match exactly.
---
@concept
## Returning an error message
`prepare_statement` returns `NULL` when all is well, or a message when it is not. The messages are string literals, so they stay valid after the function returns. The return type is `const char *` because nobody may change them.
---
@build
## execute_statement
```c
void execute_statement(const Statement *statement) {
  if (statement->type == STATEMENT_INSERT) {
    printf("This is where we would do an insert.\n");
  } else {
    printf("This is where we would do a select.\n");
  }
}
```
For now it only says what it would do.
---
@build
## Commands and statements
In `main`, replace the line that prints "Unrecognized command" with:
```c
    if (line[0] == '.') {
      printf("Unrecognized command '%s'.\n", line);
      continue;
    }

    Statement statement;
    const char *error = prepare_statement(line, &statement);
    if (error != NULL) {
      printf("%s\n", error);
      continue;
    }
    execute_statement(&statement);
    printf("Executed.\n");
```
Lines starting with `.` are commands for the program. Everything else is a statement.
---
@build
## Run it
```console
$ cc -Wall -Wextra -o db db.c
$ ./db
db > insert foo bar
This is where we would do an insert.
Executed.
db > select
This is where we would do a select.
Executed.
db > delete
Unrecognized statement.
db > .tables
Unrecognized command '.tables'.
db > .exit
```
---
@quiz
## You type `insertxyz`. What prints?
- [ ] `Unrecognized statement.`
- [x] `This is where we would do an insert.` and then `Executed.`
- [ ] `Unrecognized command 'insertxyz'.`
> `strncmp` checks only the first 6 characters, and they are "insert".
---
@quiz
## You type `select *`. What prints?
- [ ] `This is where we would do a select.`
- [x] `Unrecognized statement.`
- [ ] `Unrecognized command 'select *'.`
> `strcmp` needs the whole line to be exactly "select".
