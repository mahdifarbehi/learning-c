# Search a leaf with binary search
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## One position serves two outcomes
Leaf search returns the matching cell when the key exists. Otherwise it returns the position where that key should be inserted.

This keeps lookup and sorted insertion on the same path.

---
@build
## Search a half-open range
The range includes `lower` and excludes `upper`. When both meet, that index is the result.

```c
uint32_t lower = 0;
uint32_t upper = leaf_count(node);

while (lower < upper) {
  uint32_t middle = lower + (upper - lower) / 2;
  uint32_t middle_key = leaf_key(node, middle);
  if (key == middle_key) {
    lower = middle;
    break;
  }
  if (key < middle_key) upper = middle;
  else lower = middle + 1;
}
cursor->cell_number = lower;
```

---
@build
## Let table_find choose the root
The tree has only one leaf so far, but this function becomes the stable search entry point.

```c
Cursor *table_find(Table *table, uint32_t key) {
  return leaf_find(table, table->root_page_number, key);
}
```

`leaf_find` checks its cursor allocation and records the page number.

---
@build
## Reject an existing key
Search first, then compare the key at the returned position when that position is occupied.

```c
Cursor *cursor = table_find(table, row->id);
uint8_t *node = pager_get_page(table->pager, cursor->page_number);

if (cursor->cell_number < leaf_count(node) &&
    leaf_key(node, cursor->cell_number) == row->id) {
  free(cursor);
  return EXECUTE_DUPLICATE_KEY;
}
```

---
@build
## Shift cells before inserting
`memmove` is safe when the source and destination ranges overlap.

```c
uint32_t index = cursor->cell_number;
uint32_t count = leaf_count(node);
if (index < count) {
  memmove(leaf_cell(node, index + 1),
          leaf_cell(node, index),
          (count - index) * LEAF_CELL_SIZE);
}
set_leaf_key(node, index, row->id);
serialize_row(row, leaf_value(node, index));
set_leaf_count(node, count + 1);
```

---
@quiz
## Keys 2, 5, and 9 exist. Where does key 7 go?
- [ ] Cell 0
- [ ] Cell 1
- [x] Cell 2
> Binary search returns the first position whose key is not less than 7, between 5 and 9.

---
@build
## Select now returns sorted rows
Start the cursor at cell 0 and advance through the root leaf. Rows print in key order even when inserts arrived out of order.

After execution, free the cursor before returning `EXECUTE_OK`.
