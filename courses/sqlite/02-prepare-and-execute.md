# Prepare and execute statements
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers

@concept
## Split the front end from execution
The REPL will turn text into a typed statement before it touches stored data.

```diagram
input -> prepare -> Statement -> execute -> result
```

Preparation can reject malformed text. Execution can report database errors.

---
@build
## Name the possible results
An `enum` creates named integer values. Separate enums keep preparation errors distinct from execution errors.

```c
typedef enum { STATEMENT_INSERT, STATEMENT_SELECT } StatementType;

typedef enum {
  PREPARE_OK,
  PREPARE_SYNTAX_ERROR,
  PREPARE_INVALID_ID,
  PREPARE_TEXT_TOO_LONG,
  PREPARE_UNKNOWN
} PrepareResult;

typedef enum { EXECUTE_OK, EXECUTE_DUPLICATE_KEY } ExecuteResult;
```

---
@build
## Give a statement storage
An insert carries a row; a select needs only its type.

```c
enum { USERNAME_CAPACITY = 33, EMAIL_CAPACITY = 256 };

typedef struct {
  uint32_t id;
  char username[USERNAME_CAPACITY];
  char email[EMAIL_CAPACITY];
} Row;

typedef struct {
  StatementType type;
  Row row;
} Statement;
```

The capacities include the terminating zero byte.

---
@build
## Take one token at a time
This helper replaces a separating space with `\0` and advances the caller's pointer.

```c
char *next_token(char **position) {
  while (**position == ' ') (*position)++;
  if (**position == '\0') return NULL;

  char *token = *position;
  while (**position != '\0' && **position != ' ') (*position)++;
  if (**position == ' ') {
    **position = '\0';
    (*position)++;
  }
  return token;
}
```

The input buffer is intentionally changed into separate strings.

---
@build
## Convert the id with checks
`strtoul` converts text to an unsigned long and reports where conversion stopped.

```c
char *end = NULL;
errno = 0;
unsigned long parsed = strtoul(id_text, &end, 10);
if (errno != 0 || *id_text == '\0' || *end != '\0' ||
    parsed > UINT32_MAX) {
  return PREPARE_INVALID_ID;
}
statement->row.id = (uint32_t)parsed;
```

Include `<errno.h>` and `<stdint.h>` for the error value and limit.

---
@build
## Copy only text that fits
Check the lengths before copying the strings, including their terminators.

```c
size_t username_length = strlen(username);
size_t email_length = strlen(email);
if (username_length >= sizeof statement->row.username ||
    email_length >= sizeof statement->row.email) {
  return PREPARE_TEXT_TOO_LONG;
}

memcpy(statement->row.username, username, username_length + 1);
memcpy(statement->row.email, email, email_length + 1);
```

---
@build
## Recognize the two statements
`prepare_statement` accepts exactly `select` or `insert ID USER EMAIL`. It rejects missing and extra tokens.

```c
Statement statement = {0};
PrepareResult result = prepare_statement(input->data, &statement);
if (result == PREPARE_OK) {
  ExecuteResult executed = execute_statement(&statement);
  if (executed == EXECUTE_OK) printf("Executed.\n");
}
```

The zero initializer gives every byte of the statement a known value.

---
@quiz
## What happens with `insert 12x ada a@b`?
- [ ] The id becomes 12
- [x] Preparation returns `PREPARE_INVALID_ID`
- [ ] The program stores the text `12x` as the id
> `strtoul` stops at `x`, and the check requires the conversion to consume the whole token.
