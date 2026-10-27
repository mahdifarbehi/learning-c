# Split full internal nodes
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## A parent can overflow too
Inserting a child into a full internal node divides that node into two siblings. The new sibling is then inserted into the parent above them.

If that parent is full, the same operation repeats upward.

---
@build
## Mark an absent right child explicitly
Zero is a valid root page number, so an empty internal node uses a different sentinel.

```c
#define INVALID_PAGE_NUMBER UINT32_MAX

void initialize_internal(uint8_t *node) {
  memset(node, 0, PAGE_SIZE);
  set_node_type(node, NODE_INTERNAL);
  set_internal_count(node, 0);
  set_internal_right_child(node, INVALID_PAGE_NUMBER);
}
```

`#define` creates a preprocessor constant. Child access treats the sentinel as a fatal corrupt-state error.

---
@build
## Find the real maximum recursively
An internal node's maximum is inside its rightmost descendant, not necessarily its last stored separator.

```c
uint32_t node_max_key(Pager *pager, const uint8_t *node) {
  if (node_type(node) == NODE_LEAF) {
    return leaf_key(node, leaf_count(node) - 1);
  }
  uint32_t right_number = internal_right_child(node);
  return node_max_key(pager, pager_get_page(pager, right_number));
}
```

---
@concept
## Save facts before moving children
Before a split, record the old page number, old maximum key, parent page number, and whether the node is the root.

Moving children changes the maximum. Splitting the root also changes which page contains the old node.

---
@build
## Create the sibling
For a non-root split, allocate and initialize a new internal page with the same parent.

For a root split, reuse the root-creation operation. It copies the old internal root into a left child and leaves page 0 as the parent of the two halves.

Every child copied into the left internal node has its parent field rewritten to that left page.

---
@build
## Move the upper half
Move the old right child first. Then move children from the high end until half the keys remain.

```c
uint32_t moved = internal_right_child(old_node);
internal_insert(table, new_page_number, moved);
set_node_parent(table, moved, new_page_number);
set_internal_right_child(old_node, INVALID_PAGE_NUMBER);

for (int index = (int)INTERNAL_MAX_KEYS - 1;
     index > (int)INTERNAL_MAX_KEYS / 2;
     index--) {
  moved = internal_child(old_node, (uint32_t)index);
  internal_insert(table, new_page_number, moved);
  set_node_parent(table, moved, new_page_number);
  set_internal_count(old_node, internal_count(old_node) - 1);
}
```

---
@build
## Promote the remaining boundary child
The child beside the middle separator becomes the old node's new right child. Decrease the visible key count once more.

```c
uint32_t count = internal_count(old_node);
uint32_t new_right = internal_child(old_node, count - 1);
set_internal_right_child(old_node, new_right);
set_internal_count(old_node, count - 1);
```

The unused bytes remain outside the node's live count.

---
@build
## Place the incoming child
Compare its maximum with the old node's new maximum to choose the old or new sibling.

```c
uint32_t old_new_max = node_max_key(table->pager, old_node);
uint32_t destination =
    child_max < old_new_max ? old_page_number : new_page_number;
internal_insert(table, destination, child_page_number);
set_node_parent(table, child_page_number, destination);
```

---
@build
## Repair the level above
Replace the old separator using the node's new maximum. If the split node was not the root, insert its new sibling into the existing parent.

That call may find another full node and split again, which is how growth cascades toward the root.

---
@quiz
## What happens when a full root splits?
- [ ] Every leaf moves down two levels
- [ ] The root page number changes
- [x] A new root level is created above the two halves
> A non-root split adds a sibling at the same depth. A root split creates a new root above both halves.

---
@build
## Exercise three levels
Insert shuffled ids until the small internal-node limit forces an internal split. Verify that `.btree` shows three levels, `select` prints sorted rows, and reopening the file produces the same results.

The database now supports persistent inserts, duplicate detection, ordered scans, leaf splits, and cascading internal splits.
