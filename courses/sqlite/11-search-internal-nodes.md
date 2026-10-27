# Search through internal nodes
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Search asks separators a question
An internal separator is the maximum key in its left child. Search needs the first separator that is greater than or equal to the target.

If no separator qualifies, search takes the separate right child.

---
@build
## Binary-search the separators
The returned child index can equal the number of keys because an internal node has one more child than key.

```c
uint32_t internal_child_index(const uint8_t *node, uint32_t key) {
  uint32_t lower = 0;
  uint32_t upper = internal_count(node);
  while (lower < upper) {
    uint32_t middle = lower + (upper - lower) / 2;
    if (internal_key(node, middle) >= key) upper = middle;
    else lower = middle + 1;
  }
  return lower;
}
```

---
@build
## Resolve the chosen child
Indexes below the key count use body cells. The final index uses the right-child header field.

```c
uint32_t internal_child(const uint8_t *node, uint32_t index) {
  uint32_t count = internal_count(node);
  if (index > count) {
    fprintf(stderr, "Internal child index is out of range.\n");
    exit(EXIT_FAILURE);
  }
  if (index == count) return internal_right_child(node);
  return read_u32(node,
      INTERNAL_HEADER_SIZE + index * INTERNAL_CELL_SIZE);
}
```

---
@build
## Descend until a leaf
The same function handles any future number of internal levels.

```c
Cursor *internal_find(Table *table, uint32_t page_number, uint32_t key) {
  uint8_t *node = pager_get_page(table->pager, page_number);
  uint32_t child_number =
      internal_child(node, internal_child_index(node, key));
  uint8_t *child = pager_get_page(table->pager, child_number);

  if (node_type(child) == NODE_LEAF) {
    return leaf_find(table, child_number, key);
  }
  return internal_find(table, child_number, key);
}
```

---
@build
## Make table_find dispatch once
Replace the earlier `table_find` definition with this dispatch. Callers no longer care which node type the root currently has.

```c
Cursor *table_find(Table *table, uint32_t key) {
  uint32_t root_number = table->root_page_number;
  uint8_t *root = pager_get_page(table->pager, root_number);
  if (node_type(root) == NODE_LEAF) {
    return leaf_find(table, root_number, key);
  }
  return internal_find(table, root_number, key);
}
```

---
@quiz
## Separators are 7 and 15. Which child gets key 12?
- [ ] The child left of 7
- [x] The child left of 15
- [ ] The separate right child
> Fifteen is the first separator greater than or equal to 12.

---
@concept
## Search is now depth-independent
Insert can find the correct leaf through the internal root, and later through more levels. The search interface does not change when the tree becomes taller.

A full non-root leaf still needs its parent updated; that comes after multi-leaf scanning.
