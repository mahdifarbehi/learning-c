# Store rows in pages
requires: c-basics/pointers, c-basics/heap-memory, c-basics/bytes-and-layout

@concept
## A row becomes bytes
To save rows in a file later, each row becomes a block of bytes with a fixed layout that we choose. Each field gets its full size, so every row is 293 bytes.
```diagram
bytes 0-3: id
bytes 4-36: username
bytes 37-292: email
```
---
@build
## Layout constants
Add these after the `Statement` struct:
```c
#define ID_SIZE 4
#define USERNAME_SIZE (COLUMN_USERNAME_SIZE + 1)
#define EMAIL_SIZE (COLUMN_EMAIL_SIZE + 1)
#define ID_OFFSET 0
#define USERNAME_OFFSET (ID_OFFSET + ID_SIZE)
#define EMAIL_OFFSET (USERNAME_OFFSET + USERNAME_SIZE)
#define ROW_SIZE (EMAIL_OFFSET + EMAIL_SIZE)
```
A `uint32_t` is always 4 bytes, so `ID_SIZE` is 4.
---
@build
## Serialize and deserialize
```c
void serialize_row(const Row *source, char *destination) {
  memcpy(destination + ID_OFFSET, &source->id, ID_SIZE);
  memcpy(destination + USERNAME_OFFSET, source->username, USERNAME_SIZE);
  memcpy(destination + EMAIL_OFFSET, source->email, EMAIL_SIZE);
}

void deserialize_row(const char *source, Row *destination) {
  memcpy(&destination->id, source + ID_OFFSET, ID_SIZE);
  memcpy(destination->username, source + USERNAME_OFFSET, USERNAME_SIZE);
  memcpy(destination->email, source + EMAIL_OFFSET, EMAIL_SIZE);
}
```
**Serialize** means turning a struct into bytes. **Deserialize** turns the bytes back into a struct. The `char *` lets us count offsets in bytes.
---
@concept
## Why not copy the whole struct?
`sizeof(Row)` includes padding the compiler chose. Copying each field to an offset we picked keeps the layout compact and under our control.
---
@concept
## Pages
Databases move data in fixed blocks called **pages**. Ours are 4096 bytes, the same size the operating system uses for memory.

A page holds 4096 / 293 = 13 rows. The last 287 bytes stay unused, so no row is split across two pages.
```diagram
row 0 to 12: page 0
row 13 to 25: page 1
row n: page n / 13, slot n % 13
```
---
@build
## The table
```c
#define PAGE_SIZE 4096
#define TABLE_MAX_PAGES 100
#define ROWS_PER_PAGE (PAGE_SIZE / ROW_SIZE)
#define TABLE_MAX_ROWS (ROWS_PER_PAGE * TABLE_MAX_PAGES)

typedef struct {
  uint32_t num_rows;
  char *pages[TABLE_MAX_PAGES];
} Table;
```
`pages` is an array of 100 pointers. Each one is `NULL` until that page is needed.
---
@build
## A helper for fatal errors
```c
// Prints what failed and why, then stops the program.
void die(const char *what) {
  perror(what);
  exit(EXIT_FAILURE);
}
```
We call this when an allocation or a system call fails.
---
@build
## Create and free a table
```c
Table *new_table(void) {
  Table *table = malloc(sizeof(Table));
  if (table == NULL) {
    die("malloc");
  }
  table->num_rows = 0;
  for (uint32_t i = 0; i < TABLE_MAX_PAGES; i++) {
    table->pages[i] = NULL;
  }
  return table;
}

void free_table(Table *table) {
  for (uint32_t i = 0; i < TABLE_MAX_PAGES; i++) {
    free(table->pages[i]);
  }
  free(table);
}
```
Unused pages are `NULL`, and `free(NULL)` is safe.
---
@build
## Find a row's bytes
```c
char *row_slot(Table *table, uint32_t row_num) {
  uint32_t page_num = row_num / ROWS_PER_PAGE;
  if (table->pages[page_num] == NULL) {
    table->pages[page_num] = malloc(PAGE_SIZE);
    if (table->pages[page_num] == NULL) {
      die("malloc");
    }
  }
  uint32_t row_offset = row_num % ROWS_PER_PAGE;
  return table->pages[page_num] + row_offset * ROW_SIZE;
}
```
A page is allocated the first time a row lands on it.
---
@build
## Insert and select
```c
const char *execute_insert(const Statement *statement, Table *table) {
  if (table->num_rows >= TABLE_MAX_ROWS) {
    return "Error: Table full.";
  }
  char *slot = row_slot(table, table->num_rows);
  serialize_row(&statement->row_to_insert, slot);
  table->num_rows += 1;
  return NULL;
}

const char *execute_select(Table *table) {
  Row row;
  for (uint32_t i = 0; i < table->num_rows; i++) {
    deserialize_row(row_slot(table, i), &row);
    print_row(&row);
  }
  return NULL;
}
```
Like `prepare_statement`, both return `NULL` or an error message.
---
@build
## execute_statement
Replace the old version:
```c
// Returns NULL on success, or an error message.
const char *execute_statement(const Statement *statement, Table *table) {
  if (statement->type == STATEMENT_INSERT) {
    return execute_insert(statement, table);
  }
  return execute_select(table);
}
```
---
@build
## Update main
Create the table at the start of `main`:
```c
  Table *table = new_table();
```
Run both steps and report one result:
```c
    const char *error = prepare_statement(line, &statement);
    if (error == NULL) {
      error = execute_statement(&statement, table);
    }
    if (error == NULL) {
      printf("Executed.\n");
    } else {
      printf("%s\n", error);
    }
```
Before `return 0;`, add `free_table(table);`.
---
@build
## Run it
```console
$ cc -Wall -Wextra -o db db.c
$ ./db
db > insert 1 alice alice@example.com
Executed.
db > insert 2 bob bob@example.com
Executed.
db > select
(1, alice, alice@example.com)
(2, bob, bob@example.com)
Executed.
db > .exit
```
---
@quiz
## Where does row 30 go?
- [ ] Page 1, slot 17
- [x] Page 2, slot 4
- [ ] Page 3, slot 0
> 30 / 13 is 2, and 30 % 13 is 4.
---
@quiz
## You insert two rows, type `.exit`, start the program again and type `select`. What prints?
- [ ] The two rows
- [x] Only `Executed.`
- [ ] An error
> The rows lived only in memory. Saving them to a file is the next lesson.
---
@quiz
## How many rows fit before `Error: Table full.`?
- [ ] 100
- [x] 1300
- [ ] 4096
> 13 rows per page times 100 pages.
