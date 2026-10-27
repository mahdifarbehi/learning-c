# Update a parent after a leaf split
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## A non-root split has a parent
Splitting a leaf creates a new right sibling, but the existing parent still describes only the old child.

We must update the old separator and insert a child entry for the new leaf.

---
@build
## Preserve the old maximum
Read the leaf's maximum before redistribution, then compare it with the maximum afterward.

```c
uint32_t old_max = leaf_key(left, leaf_count(left) - 1);
/* redistribute cells */
uint32_t new_max = leaf_key(left, leaf_count(left) - 1);
uint32_t parent_number = read_u32(left, PARENT_OFFSET);
uint8_t *parent = pager_get_page(table->pager, parent_number);
```

Set the new leaf's parent field to the same page number.

---
@build
## Replace the old separator
Find the separator that used to represent the left child and replace it with the child's new maximum.

```c
void update_internal_key(uint8_t *node,
                         uint32_t old_key,
                         uint32_t new_key) {
  uint32_t index = internal_child_index(node, old_key);
  if (index < internal_count(node)) {
    set_internal_key(node, index, new_key);
  }
}
```

The separate right child has no separator to replace; `internal_insert` handles it when the new sibling is added.

---
@concept
## The right child is special
An internal node with `n` keys has `n + 1` children. Its final child has no separator to its right, so it lives in the header.

Inserting the new largest child moves the old right child into a normal cell and makes the new child the right child.

---
@build
## Insert a non-largest child
For any other position, move later cells right and write the new child and its maximum key.

```c
size_t offset = INTERNAL_HEADER_SIZE + index * INTERNAL_CELL_SIZE;
size_t later_bytes = (count - index) * INTERNAL_CELL_SIZE;
memmove(parent + offset + INTERNAL_CELL_SIZE,
        parent + offset,
        later_bytes);
set_internal_child(parent, index, child_page_number);
set_internal_key(parent, index, child_max);
set_internal_count(parent, count + 1);
```

`uint8_t *` makes every offset a byte offset.

---
@build
## Finish a non-root leaf split
After relinking the leaves and setting their counts, repair the parent in this order:

```c
write_u32(right, PARENT_OFFSET, parent_number);
update_internal_key(parent, old_max, new_max);
internal_insert(table, parent_number, right_page_number);
```

The parent then routes searches to both leaves.

---
@concept
## Stop before overflowing the parent
For visible tests, internal nodes hold only three keys. At this checkpoint, inserting into a full internal node is still a fatal “not implemented” condition.

The next lesson replaces that temporary stop with recursive internal-node splitting.

---
@quiz
## What happens to a separator after its left leaf's maximum changes?
- [ ] It keeps the leaf's old maximum
- [x] It is replaced with the leaf's new maximum
- [ ] It becomes the leaf's row count
> A separator must always equal the maximum key reachable through the child to its left.

---
@build
## Verify an out-of-order workload
Insert enough shuffled ids to split a non-root leaf. `.btree` should show correct separators, and `select` should still print every row once in ascending id order.
