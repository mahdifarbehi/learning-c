# Reject bad input
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Invalid input is expected
User input is not a fatal program error. Preparation should return a result that lets the REPL print a message and continue.

Allocation and file failures remain fatal because this small program does not recover from them.

---
@build
## Centralize bounded text copies
This helper returns false instead of overflowing the destination.

```c
bool copy_text(char *destination, size_t capacity, const char *source) {
  size_t length = strlen(source);
  if (length >= capacity) return false;
  memcpy(destination, source, length + 1);
  return true;
}
```

The call passes `sizeof statement->row.username` or `sizeof statement->row.email` as the capacity.

---
@build
## Reject every malformed id
The checked `strtoul` conversion rejects a negative sign, an empty token, trailing characters, overflow, and values above `UINT32_MAX`.

```c
if (id_text[0] == '-' || errno != 0 || *id_text == '\0' ||
    *end != '\0' || parsed > UINT32_MAX) {
  return PREPARE_INVALID_ID;
}
```

---
@build
## Reject incomplete inserts
All three values must exist, and there must be no fourth value.

```c
char *id_text = next_token(&position);
char *username = next_token(&position);
char *email = next_token(&position);
char *extra = next_token(&position);

if (id_text == NULL || username == NULL ||
    email == NULL || extra != NULL) {
  return PREPARE_SYNTAX_ERROR;
}
```

---
@concept
## Check behavior at boundaries
Useful cases are the smallest valid id, the largest valid id, a negative id, a non-number, exact-fit text, one-character-too-long text, missing fields, and extra fields.

Each case asks what the executable does, not how an internal helper is written.

---
@quiz
## What happens after an overlong username?
- [ ] The username is silently shortened
- [x] The REPL reports a preparation error and reads another command
- [ ] The database writes past the array
> The length check returns `PREPARE_TEXT_TOO_LONG` before any copy occurs.

---
@build
## Keep the loop alive
Handle every `PrepareResult` in one switch. Error cases print a short message and `continue`; only `PREPARE_OK` reaches execution.

A `switch` chooses the matching `case` for one value; `break` leaves the switch, while `continue` starts the next loop iteration.

```c
switch (prepare_statement(input->data, &statement)) {
  case PREPARE_OK: break;
  case PREPARE_SYNTAX_ERROR:
    printf("Syntax: insert ID USER EMAIL\n");
    continue;
  case PREPARE_INVALID_ID:
    printf("ID must be an unsigned 32-bit integer.\n");
    continue;
  case PREPARE_TEXT_TOO_LONG:
    printf("Text field is too long.\n");
    continue;
  case PREPARE_UNKNOWN:
    printf("Unrecognized statement.\n");
    continue;
}
```
