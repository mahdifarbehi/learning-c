# Parse an insert
requires: c-basics/pointers, c-basics/heap-memory, c-basics/strings, c-basics/bytes-and-layout

@concept
## Our table
The database has one fixed table. Each row has an `id` (an unsigned 32-bit number), a `username` of up to 32 characters, and an `email` of up to 255.
```console
db > insert 1 alice alice@example.com
```
---
@build
## The Row struct
Add `#include <stdint.h>` to the headers, then:
```c
#define COLUMN_USERNAME_SIZE 32
#define COLUMN_EMAIL_SIZE 255

typedef struct {
  uint32_t id;
  char username[COLUMN_USERNAME_SIZE + 1];
  char email[COLUMN_EMAIL_SIZE + 1];
} Row;
```
The `+ 1` leaves room for the `'\0'`.
---
@build
## A statement carries a row
```c
typedef struct {
  StatementType type;
  Row row_to_insert;
} Statement;
```
---
@concept
## strtok splits in place
`strtok(input, " ")` returns the first word. It writes `'\0'` over the space after it, so the word becomes its own string. Each later call with `NULL` continues where the last one stopped. When no words are left, it returns `NULL`.
```diagram
insert 1 alice a@b.c
insert\0 1\0 alice\0 a@b.c
```
`strtok` changes the string it splits.
---
@build
## Split the words
```c
const char *prepare_insert(char *input, Statement *statement) {
  statement->type = STATEMENT_INSERT;

  char *keyword = strtok(input, " ");
  char *id_text = strtok(NULL, " ");
  char *username = strtok(NULL, " ");
  char *email = strtok(NULL, " ");
  char *extra = strtok(NULL, " ");
  if (strcmp(keyword, "insert") != 0) {
    return "Unrecognized statement.";
  }
  if (id_text == NULL || username == NULL || email == NULL ||
      extra != NULL) {
    return "Syntax error. Could not parse statement.";
  }
```
The first word must be exactly `insert`, so `insertxyz` is rejected. Exactly three values must follow: a missing one or a fourth one is a syntax error.
---
@concept
## strtoll reports where it stopped
`strtoll(text, &end, 10)` reads a base-10 number and sets `end` to the first character it could not use. If `*end` is not `'\0'`, the text had junk in it, like `12abc`.

It returns a `long long`, which is at least 64 bits. Negative numbers and numbers too big for 32 bits fit in it, so we can check for both.
---
@build
## Check the id
```c
  char *end;
  long long id = strtoll(id_text, &end, 10);
  if (*end != '\0') {
    return "ID must be a number.";
  }
  if (id < 0) {
    return "ID must not be negative.";
  }
  if (id > UINT32_MAX) {
    return "ID is too large.";
  }
```
`UINT32_MAX` comes from `<stdint.h>`.
---
@build
## Check lengths and copy
```c
  if (strlen(username) > COLUMN_USERNAME_SIZE ||
      strlen(email) > COLUMN_EMAIL_SIZE) {
    return "String is too long.";
  }

  Row *row = &statement->row_to_insert;
  memset(row, 0, sizeof(Row));
  row->id = (uint32_t)id;
  strcpy(row->username, username);
  strcpy(row->email, email);
  return NULL;
}
```
`strcpy` is safe here because we checked the lengths first. `(uint32_t)id` converts the value, which we know fits.
---
@concept
## Why memset first
`statement` is a local variable, so its bytes start as garbage. `strcpy` writes only up to the `'\0'`. `memset` sets every byte to zero first, so the unused end of each field is zero. That matters soon, when rows are saved to a file.
---
@build
## Wire it in
`prepare_statement` now hands inserts to `prepare_insert`. Its `input` is no longer `const`, because `strtok` writes into it:
```c
const char *prepare_statement(char *input, Statement *statement) {
  if (strncmp(input, "insert", 6) == 0) {
    return prepare_insert(input, statement);
  }
```
Put `prepare_insert` above `prepare_statement`, so it is declared before it is used.
---
@build
## Show the parsed row
```c
void print_row(const Row *row) {
  printf("(%u, %s, %s)\n", row->id, row->username, row->email);
}
```
In `execute_statement`, replace the insert message:
```c
    printf("Would insert ");
    print_row(&statement->row_to_insert);
```
`%u` prints an unsigned number.
---
@build
## Run it
```console
$ cc -Wall -Wextra -o db db.c
$ ./db
db > insert 1 alice alice@example.com
Would insert (1, alice, alice@example.com)
Executed.
db > insert -1 bob bob@example.com
ID must not be negative.
db > insert x bob bob@example.com
ID must be a number.
db > insert 2 bob
Syntax error. Could not parse statement.
db > insert 2 bob bob@example.com extra
Syntax error. Could not parse statement.
db > .exit
```
---
@quiz
## The username has 33 characters. What prints?
- [ ] The first 32 characters are stored
- [x] `String is too long.`
- [ ] The program writes past the end of `username`
> We reject the input before copying, so nothing overflows.
---
@quiz
## You type `insert 5000000000 a a@b.c`. What prints?
- [ ] `ID must be a number.`
- [x] `ID is too large.`
- [ ] The id wraps around to a small number
> 5000000000 fits in a `long long` but is larger than `UINT32_MAX`.
---
@quiz
## You type `insertxyz 1 alice a@b.c`. What prints?
- [ ] `Would insert (1, alice, a@b.c)`
- [x] `Unrecognized statement.`
- [ ] `Syntax error. Could not parse statement.`
> The line starts with "insert", so it reaches `prepare_insert`, but the first word is not exactly "insert".
---
@quiz
## What does `strtok(NULL, " ")` return after the last word?
- [ ] An empty string
- [x] `NULL`
- [ ] The first word again
> That is how we detect a missing value.
