# Scan across leaves
requires: c-basics/bytes-and-layout

@concept
## Visit every leaf in order
`select` must read every row in key order. We could walk the tree to reach each leaf, but there is a simpler way: each leaf stores the page number of the leaf to its right.
```diagram
leaf 1-7 -> leaf 8-14 -> leaf 15-21
the last leaf points to 0: none
```
---
@concept
## The next_leaf field
The leaf header grows by 4 bytes. Cells now start at byte 14, and a leaf still holds 13 cells.
```diagram
bytes 6-9: number of cells
bytes 10-13: next leaf page
bytes 14 and up: cells
```
0 means "no next leaf". That is safe because page 0 is always the root, never the leaf to someone's right.
---
@build
## Header constants
```c
// A leaf node adds: num_cells (4), next_leaf (4).
#define LEAF_NUM_CELLS_OFFSET 6
#define LEAF_NEXT_LEAF_OFFSET 10
#define LEAF_HEADER_SIZE 14
```
---
@build
## Accessors
```c
// 0 means there is no next leaf. Page 0 is always the root.
uint32_t leaf_node_next_leaf(char *node) {
  return read_u32(node + LEAF_NEXT_LEAF_OFFSET);
}

void set_leaf_node_next_leaf(char *node, uint32_t page_num) {
  write_u32(node + LEAF_NEXT_LEAF_OFFSET, page_num);
}
```
In `initialize_leaf_node`, add `set_leaf_node_next_leaf(node, 0);`.
---
@build
## Link the halves
In `leaf_node_split_and_insert`, after setting the cell counts:
```c
  // Link the leaves: old -> new -> old's former next.
  set_leaf_node_next_leaf(new_node, leaf_node_next_leaf(old_node));
  set_leaf_node_next_leaf(old_node, new_page_num);
```
The new leaf goes into the chain right after the old one.
---
@build
## Start at the leftmost leaf
```c
// Starts at the leftmost leaf.
Cursor table_start(Table *table) {
  uint32_t page_num = table->root_page_num;
  char *node = get_page(&table->pager, page_num);
  while (get_node_type(node) == NODE_INTERNAL) {
    page_num = internal_node_child(node, 0);
    node = get_page(&table->pager, page_num);
  }
  Cursor cursor = {
      .table = table,
      .page_num = page_num,
      .cell_num = 0,
      .end_of_table = (leaf_node_num_cells(node) == 0),
  };
  return cursor;
}
```
Child 0 always holds the smallest keys.
---
@build
## Follow the chain
In `cursor_advance`, replace the end check:
```c
  cursor->cell_num += 1;
  if (cursor->cell_num >= leaf_node_num_cells(node)) {
    uint32_t next = leaf_node_next_leaf(node);
    if (next == 0) {
      cursor->end_of_table = true;
    } else {
      cursor->page_num = next;
      cursor->cell_num = 0;
    }
  }
```
In `execute_select`, delete the "Need to implement scanning a tree." check.
---
@build
## Run it
The header changed, so delete the old file.
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ for i in $(seq 15 -1 1); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > select
(1, user1, u1@example.com)
(2, user2, u2@example.com)
(3, user3, u3@example.com)
(4, user4, u4@example.com)
(5, user5, u5@example.com)
(6, user6, u6@example.com)
(7, user7, u7@example.com)
(8, user8, u8@example.com)
(9, user9, u9@example.com)
(10, user10, u10@example.com)
(11, user11, u11@example.com)
(12, user12, u12@example.com)
(13, user13, u13@example.com)
(14, user14, u14@example.com)
(15, user15, u15@example.com)
Executed.
db > .exit
```
We inserted from 15 down to 1, and `select` prints them in order across both leaves.
---
@quiz
## Which leaf does table_start begin with?
- [ ] The root
- [x] The leftmost leaf, reached by always taking child 0
- [ ] The most recently split leaf
> The leftmost leaf holds the smallest keys.
---
@quiz
## Leaf A points to leaf C. A splits into A and a new leaf B. What is the chain now?
- [ ] A -> C -> B
- [x] A -> B -> C
- [ ] B -> A -> C
> B takes A's old next (C), then A points to B.
