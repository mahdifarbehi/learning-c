# Scan multiple leaf pages
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Start at the leftmost leaf
Cell 0 of an internal root is not a row. Searching for key 0 returns the position of the smallest possible key in the tree.

Replace the earlier `table_start` definition with this version.

```c
Cursor *table_start(Table *table) {
  Cursor *cursor = table_find(table, 0);
  uint8_t *leaf = pager_get_page(table->pager, cursor->page_number);
  cursor->end_of_table = (leaf_count(leaf) == 0);
  return cursor;
}
```

---
@concept
## Leaves need a forward link
When a cursor reaches the end of one leaf, it must know the next leaf page. Add that page number to the leaf header.

Replace the earlier `LEAF_HEADER_SIZE` definition when adding this field.

```c
enum {
  LEAF_NEXT_OFFSET = LEAF_COUNT_OFFSET + sizeof(uint32_t),
  LEAF_HEADER_SIZE = LEAF_NEXT_OFFSET + sizeof(uint32_t)
};
```

Page number 0 means there is no next leaf because page 0 is reserved for the root.

---
@build
## Initialize the link
Every new leaf begins as the end of its chain.

Replace the earlier `initialize_leaf` definition with this version.

```c
void initialize_leaf(uint8_t *node) {
  memset(node, 0, PAGE_SIZE);
  set_node_type(node, NODE_LEAF);
  set_leaf_count(node, 0);
  write_u32(node, LEAF_NEXT_OFFSET, 0);
}
```

Use a fresh database after changing the leaf header size.

---
@build
## Splice a split into the chain
The new right leaf inherits the old successor, then the old leaf points to the new page.

```c
uint32_t old_next = read_u32(left, LEAF_NEXT_OFFSET);
write_u32(right, LEAF_NEXT_OFFSET, old_next);
write_u32(left, LEAF_NEXT_OFFSET, right_page_number);
```

This works whether the split leaf was last or had a successor.

---
@build
## Advance across a boundary
After the final cell, either follow the link or mark the cursor finished.

```c
cursor->cell_number++;
if (cursor->cell_number >= leaf_count(leaf)) {
  uint32_t next = read_u32(leaf, LEAF_NEXT_OFFSET);
  if (next == 0) cursor->end_of_table = true;
  else {
    cursor->page_number = next;
    cursor->cell_number = 0;
  }
}
```

---
@concept
## Keep key and value destinations distinct
A leaf cell begins with its key. Serializing a row into the cell start would overwrite that key and shift every row field.

The split code always calls `set_leaf_key` for the key and `leaf_value` for the row bytes.

---
@quiz
## What happens when a cursor reaches a leaf whose next value is 0?
- [ ] It continues scanning at the root
- [x] It marks the scan as finished
- [ ] It clears the current leaf
> Page 0 is the root and is reserved as the end-of-chain sentinel in leaf links.
