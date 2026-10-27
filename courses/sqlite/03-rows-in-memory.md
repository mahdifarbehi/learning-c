# Store rows in memory
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Pages are fixed-size byte arrays
The table will store serialized rows in 4096-byte pages. A page number selects a page; a byte offset selects a row inside it.

```c
enum { PAGE_SIZE = 4096, TABLE_MAX_PAGES = 100 };
```

---
@build
## Define the row layout
The stored format contains only the three fields, not any padding from `Row`.

```c
enum {
  ID_OFFSET = 0,
  USERNAME_OFFSET = sizeof(uint32_t),
  EMAIL_OFFSET = sizeof(uint32_t) + USERNAME_CAPACITY,
  ROW_SIZE = sizeof(uint32_t) + USERNAME_CAPACITY + EMAIL_CAPACITY
};
```

---
@build
## Serialize fields explicitly
Each destination is computed with `uint8_t *` byte arithmetic.

```c
void serialize_row(const Row *row, uint8_t *destination) {
  memcpy(destination + ID_OFFSET, &row->id, sizeof row->id);
  memcpy(destination + USERNAME_OFFSET,
         row->username, sizeof row->username);
  memcpy(destination + EMAIL_OFFSET,
         row->email, sizeof row->email);
}
```

---
@build
## Deserialize in the same order
Reversing the three copies reconstructs a `Row`.

```c
void deserialize_row(const uint8_t *source, Row *row) {
  memcpy(&row->id, source + ID_OFFSET, sizeof row->id);
  memcpy(row->username,
         source + USERNAME_OFFSET, sizeof row->username);
  memcpy(row->email,
         source + EMAIL_OFFSET, sizeof row->email);
}
```

---
@build
## Allocate pages when first used
`calloc` allocates and clears the page. It takes an object count and the size of each object.

```c
typedef struct {
  uint8_t *pages[TABLE_MAX_PAGES];
  uint32_t row_count;
} Table;

uint8_t *table_page(Table *table, uint32_t page_number) {
  if (page_number >= TABLE_MAX_PAGES) {
    fprintf(stderr, "Page number is out of range.\n");
    exit(EXIT_FAILURE);
  }
  if (table->pages[page_number] == NULL) {
    table->pages[page_number] = calloc(PAGE_SIZE, 1);
    if (table->pages[page_number] == NULL) {
      fprintf(stderr, "Could not allocate page.\n");
      exit(EXIT_FAILURE);
    }
  }
  return table->pages[page_number];
}
```

---
@build
## Map a row number to bytes
Integer division chooses the page. The remainder chooses the slot within that page.

```c
uint8_t *row_slot(Table *table, uint32_t row_number) {
  size_t rows_per_page = PAGE_SIZE / ROW_SIZE;
  uint32_t page_number = (uint32_t)(row_number / rows_per_page);
  size_t row_in_page = row_number % rows_per_page;
  return table_page(table, page_number) + row_in_page * ROW_SIZE;
}
```

---
@build
## Insert and select
Insert writes at `row_count`, then increments it. Select reads slots from zero up to that count.

```c
serialize_row(&statement->row, row_slot(table, table->row_count));
table->row_count++;

for (uint32_t index = 0; index < table->row_count; index++) {
  Row row;
  deserialize_row(row_slot(table, index), &row);
  print_row(&row);
}
```

Free every allocated page when the REPL exits normally.

---
@quiz
## What happens when row number 15 is stored with 14 rows per page?
- [ ] Page 0, slot 15
- [x] Page 1, slot 1
- [ ] Page 15, slot 1
> `15 / 14` selects page 1, and `15 % 14` selects slot 1.
