# Add a cursor
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## A cursor names a position
A **cursor** stores where an operation is currently reading or writing. It separates traversal from the table's physical layout.

```c
typedef struct {
  Table *table;
  uint32_t row_number;
  bool end_of_table;
} Cursor;
```

---
@build
## Start at the first row
An empty table starts at its end immediately.

```c
Cursor *table_start(Table *table) {
  Cursor *cursor = cursor_new(table);
  cursor->row_number = 0;
  cursor->end_of_table = (table->row_count == 0);
  return cursor;
}
```

`cursor_new` checks `malloc` and records the table pointer.

---
@build
## Append at the current end
The insertion cursor points one position past the last existing row.

```c
Cursor *table_end(Table *table) {
  Cursor *cursor = cursor_new(table);
  cursor->row_number = table->row_count;
  cursor->end_of_table = true;
  return cursor;
}
```

One-past-the-end is a position, not a row that may be read.

---
@build
## Resolve the position only when needed
The cursor asks the table for the bytes at its current row number.

```c
uint8_t *cursor_value(Cursor *cursor) {
  return row_slot(cursor->table, cursor->row_number);
}
```

Later, this function can change without changing insert and select.

---
@build
## Advance toward the end
Increment the position, then compare it with the table's row count.

```c
void cursor_advance(Cursor *cursor) {
  cursor->row_number++;
  cursor->end_of_table =
      (cursor->row_number >= cursor->table->row_count);
}
```

---
@build
## Execute through cursors
Insert uses `table_end`; select uses `table_start` and advances until the sentinel is true.

```c
Cursor *cursor = table_start(table);
while (!cursor->end_of_table) {
  Row row;
  deserialize_row(cursor_value(cursor), &row);
  print_row(&row);
  cursor_advance(cursor);
}
free(cursor);
```

Free each cursor on the normal path.

---
@quiz
## Can table_end be dereferenced before insertion?
- [ ] Yes, it is the final stored row
- [x] No, it is one position past the stored rows
- [ ] Only when the table is empty
> `table_end` represents the append position. It becomes a real row only after insert writes there.
