# Split a full leaf
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Full no longer means finished
When a leaf fills, allocate another page and divide the existing cells plus the new cell between the two leaves.

```c
enum {
  LEAF_RIGHT_SPLIT = (LEAF_MAX_CELLS + 1) / 2,
  LEAF_LEFT_SPLIT =
      (LEAF_MAX_CELLS + 1) - LEAF_RIGHT_SPLIT
};
```

---
@build
## Allocate the right leaf
New pages are appended because this version does not recycle page numbers.

```c
uint32_t pager_unused_page(const Pager *pager) {
  return pager->page_count;
}

uint32_t right_page_number = pager_unused_page(table->pager);
uint8_t *right = pager_get_page(table->pager, right_page_number);
initialize_leaf(right);
```

The pager rejects a page number at or beyond `TABLE_MAX_PAGES`.

---
@build
## Redistribute from right to left
Walking backward prevents an unread old cell from being overwritten.

The loop counter is signed so decrementing past zero ends the loop instead of wrapping to a huge unsigned value. The conditional expression chooses the destination leaf and the source index.

```c
for (int32_t i = (int32_t)LEAF_MAX_CELLS; i >= 0; i--) {
  uint8_t *destination_node =
      i >= (int32_t)LEAF_LEFT_SPLIT ? right : left;
  uint32_t destination_index = (uint32_t)i % LEAF_LEFT_SPLIT;

  if ((uint32_t)i == cursor->cell_number) {
    set_leaf_key(destination_node, destination_index, row->id);
    serialize_row(row, leaf_value(destination_node, destination_index));
  } else {
    uint32_t source_index =
        (uint32_t)i > cursor->cell_number ? (uint32_t)i - 1 : (uint32_t)i;
    memmove(leaf_cell(destination_node, destination_index),
            leaf_cell(left, source_index), LEAF_CELL_SIZE);
  }
}
```

---
@build
## Record both new counts
The bytes past each count are ignored until a later insertion overwrites them.

```c
set_leaf_count(left, LEAF_LEFT_SPLIT);
set_leaf_count(right, LEAF_RIGHT_SPLIT);
```

---
@concept
## The root must change shape
The root has a fixed page number so callers can always begin at page 0. Copy the old root leaf to a new left-child page, then reinitialize page 0 as an internal node.

```diagram
before: page 0 = leaf
after:  page 0 = internal -> left leaf, right leaf
```

---
@build
## Lay out an internal node
Its header stores a key count and a separate right-child page number. Each body cell stores one child page number followed by that child's maximum key.

```c
enum {
  INTERNAL_COUNT_OFFSET = COMMON_HEADER_SIZE,
  INTERNAL_RIGHT_OFFSET = INTERNAL_COUNT_OFFSET + sizeof(uint32_t),
  INTERNAL_HEADER_SIZE = INTERNAL_RIGHT_OFFSET + sizeof(uint32_t),
  INTERNAL_CELL_SIZE = 2 * sizeof(uint32_t),
  INTERNAL_MAX_KEYS = 3
};
```

All accessors use `read_u32` and `write_u32`.

---
@build
## Build the new root
After copying the old page into the left child, connect both children and their parent fields.

```c
left[IS_ROOT_OFFSET] = 0;
initialize_internal(root);
root[IS_ROOT_OFFSET] = 1;
set_internal_count(root, 1);
set_internal_child(root, 0, left_page_number);
set_internal_key(root, 0,
                 leaf_key(left, leaf_count(left) - 1));
set_internal_right_child(root, right_page_number);
write_u32(left, PARENT_OFFSET, table->root_page_number);
write_u32(right, PARENT_OFFSET, table->root_page_number);
```

---
@build
## Inspect the result
Add `.btree` as a meta-command. A recursive printer shows the internal root, each child leaf, and their sorted keys.

This is a diagnostic view of the stored structure, not a new database operation.

---
@quiz
## What happens to the root page number after a split?
- [ ] It changes to the new left page
- [x] It stays at page 0
- [ ] It becomes the right leaf's page
> Reusing page 0 for the new internal root keeps the table's entry point unchanged.
