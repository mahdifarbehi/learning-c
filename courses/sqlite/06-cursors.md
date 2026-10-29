# Add a cursor
requires: c-basics/pointers

@concept
## A cursor is a position
Right now, `execute_insert` and `execute_select` know that rows live in pages. A **cursor** hides that: it points at one row, gives you that row's bytes, and moves to the next.

Later, when rows move into a tree, only the cursor code changes.
---
@build
## The Cursor struct
Add it after `Table`:
```c
typedef struct {
  Table *table;
  uint32_t row_num;
  bool end_of_table;  // one past the last row
} Cursor;
```
---
@build
## Start and end
These replace `row_slot`:
```c
Cursor table_start(Table *table) {
  Cursor cursor = {
      .table = table,
      .row_num = 0,
      .end_of_table = (table->num_rows == 0),
  };
  return cursor;
}

Cursor table_end(Table *table) {
  Cursor cursor = {
      .table = table,
      .row_num = table->num_rows,
      .end_of_table = true,
  };
  return cursor;
}
```
A cursor is small, so we return it by value: no `malloc` and no `free`.
---
@build
## Read and move
```c
char *cursor_value(Cursor *cursor) {
  uint32_t row_num = cursor->row_num;
  uint32_t page_num = row_num / ROWS_PER_PAGE;
  char *page = get_page(&cursor->table->pager, page_num);
  uint32_t row_offset = row_num % ROWS_PER_PAGE;
  return page + row_offset * ROW_SIZE;
}

void cursor_advance(Cursor *cursor) {
  cursor->row_num += 1;
  if (cursor->row_num >= cursor->table->num_rows) {
    cursor->end_of_table = true;
  }
}
```
These take a `Cursor *` because they read or change the caller's cursor.
---
@build
## Insert at the end
```c
  Cursor cursor = table_end(table);
  serialize_row(&statement->row_to_insert, cursor_value(&cursor));
```
These two lines replace the `row_slot` call in `execute_insert`.
---
@build
## Select from the start
```c
const char *execute_select(Table *table) {
  Cursor cursor = table_start(table);
  Row row;
  while (!cursor.end_of_table) {
    deserialize_row(cursor_value(&cursor), &row);
    print_row(&row);
    cursor_advance(&cursor);
  }
  return NULL;
}
```
---
@build
## Run it
The program behaves as before. Only the inside changed.
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ ./db test.db
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
## The table has 3 rows. After how many `cursor_advance` calls from `table_start` is `end_of_table` true?
- [ ] 2
- [x] 3
- [ ] 4
> After rows 0, 1 and 2, `row_num` reaches 3, which equals `num_rows`.
---
@quiz
## The table is empty. What does `select` print?
- [ ] One empty row
- [x] Just `Executed.`
- [ ] An error
> `table_start` sets `end_of_table` to true, so the loop never runs.
---
@quiz
## `execute_select` gets a cursor from `table_start`, then calls `cursor_advance(&cursor)`. Whose cursor changes?
- [ ] One stored inside the table
- [x] The local `cursor` in `execute_select`
- [ ] A copy inside `cursor_advance`
> `table_start` returned a copy, and we passed its address to `cursor_advance`.
