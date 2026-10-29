# Split a full leaf
requires: c-basics/pointers, c-basics/bytes-and-layout

@concept
## When the leaf is full
A full leaf has 13 cells. With the new one, that makes 14. We split them: the lower 7 stay in the old page, the upper 7 move to a new page, and a new root sits above both.
```diagram
full root leaf: 1 to 13, insert 14
root: key 7
left leaf: 1 to 7
right leaf: 8 to 14
```
---
@concept
## The internal node layout
An internal node shares the first six header bytes with a leaf, then stores its own fields.
```diagram
bytes 0-5: common header
bytes 6-9: number of keys
bytes 10-13: right child page
bytes 14 and up: cells
cell: child page (4), key (4)
```
Each key is the largest key in its child. The rightmost child has no key, so its page number lives in the header.
---
@build
## Internal constants
After `LEAF_MAX_CELLS`, add:
```c
#define LEAF_RIGHT_SPLIT_COUNT ((LEAF_MAX_CELLS + 1) / 2)
#define LEAF_LEFT_SPLIT_COUNT ((LEAF_MAX_CELLS + 1) - LEAF_RIGHT_SPLIT_COUNT)

// An internal node adds: num_keys (4), right_child (4).
#define INTERNAL_NUM_KEYS_OFFSET 6
#define INTERNAL_RIGHT_CHILD_OFFSET 10
#define INTERNAL_HEADER_SIZE 14

// Each internal cell is a child page number followed by a key.
#define INTERNAL_CELL_SIZE 8
```
---
@build
## Type and root flag
Next to `set_node_type`:
```c
NodeType get_node_type(char *node) {
  return node[NODE_TYPE_OFFSET];
}

bool is_node_root(char *node) {
  return node[IS_ROOT_OFFSET] != 0;
}

void set_node_root(char *node, bool is_root) {
  node[IS_ROOT_OFFSET] = is_root;
}
```
In `initialize_leaf_node`, add `set_node_root(node, false);`. In `db_open`, after `initialize_leaf_node(root);`, add `set_node_root(root, true);`.
---
@build
## Internal node fields
```c
uint32_t internal_node_num_keys(char *node) {
  return read_u32(node + INTERNAL_NUM_KEYS_OFFSET);
}

void set_internal_node_num_keys(char *node, uint32_t num_keys) {
  write_u32(node + INTERNAL_NUM_KEYS_OFFSET, num_keys);
}

char *internal_node_cell(char *node, uint32_t cell_num) {
  return node + INTERNAL_HEADER_SIZE + cell_num * INTERNAL_CELL_SIZE;
}
```
---
@build
## Children and keys
```c
// Child num_keys is the right child, stored in the header.
char *internal_node_child_slot(char *node, uint32_t child_num) {
  if (child_num == internal_node_num_keys(node)) {
    return node + INTERNAL_RIGHT_CHILD_OFFSET;
  }
  return internal_node_cell(node, child_num);
}

uint32_t internal_node_child(char *node, uint32_t child_num) {
  return read_u32(internal_node_child_slot(node, child_num));
}

void set_internal_node_child(char *node, uint32_t child_num,
                             uint32_t page_num) {
  write_u32(internal_node_child_slot(node, child_num), page_num);
}
```
Children are numbered 0 to `num_keys`. The last one is the right child.
---
@build
## Keys and a fresh node
```c
uint32_t internal_node_key(char *node, uint32_t key_num) {
  return read_u32(internal_node_cell(node, key_num) + 4);
}

void set_internal_node_key(char *node, uint32_t key_num, uint32_t key) {
  write_u32(internal_node_cell(node, key_num) + 4, key);
}

void initialize_internal_node(char *node) {
  set_node_type(node, NODE_INTERNAL);
  set_node_root(node, false);
  set_internal_node_num_keys(node, 0);
}
```
The key sits 4 bytes into the cell, after the child page number.
---
@build
## New pages and max keys
Put these after `db_close`:
```c
// New pages always go at the end of the file.
uint32_t get_unused_page_num(Pager *pager) {
  return pager->num_pages;
}

// The largest key is in the rightmost leaf.
uint32_t get_node_max_key(Pager *pager, uint32_t page_num) {
  char *node = get_page(pager, page_num);
  if (get_node_type(node) == NODE_LEAF) {
    return leaf_node_key(node, leaf_node_num_cells(node) - 1);
  }
  uint32_t num_keys = internal_node_num_keys(node);
  uint32_t right_child = internal_node_child(node, num_keys);
  return get_node_max_key(pager, right_child);
}
```
For an internal node, the function calls itself on the right child until it reaches a leaf.
---
@build
## Fill an internal node
```c
// Fills an internal node with children, in order.
void set_internal_node_children(Pager *pager, uint32_t page_num,
                                const uint32_t *children, uint32_t count) {
  char *node = get_page(pager, page_num);
  set_internal_node_num_keys(node, count - 1);
  for (uint32_t i = 0; i < count; i++) {
    set_internal_node_child(node, i, children[i]);
    if (i < count - 1) {
      uint32_t max_key = get_node_max_key(pager, children[i]);
      set_internal_node_key(node, i, max_key);
    }
  }
}
```
We set `num_keys` first, so the last child lands in the right-child slot.
---
@concept
## The root stays on page 0
The table finds the tree through page 0, so the root must stay there. To split the root, we copy its contents to a new page, which becomes the left child. Then we rewrite page 0 as an internal node over the two halves.
---
@build
## create_new_root
```c
// The root stays on its page: move its contents to a new left
// child, then make the root an internal node over both halves.
void create_new_root(Table *table, uint32_t right_page_num) {
  Pager *pager = &table->pager;
  char *root = get_page(pager, table->root_page_num);
  uint32_t left_page_num = get_unused_page_num(pager);
  char *left = get_page(pager, left_page_num);
  memcpy(left, root, PAGE_SIZE);
  set_node_root(left, false);

  initialize_internal_node(root);
  set_node_root(root, true);
  uint32_t children[2] = {left_page_num, right_page_num};
  set_internal_node_children(pager, table->root_page_num, children, 2);
}
```
---
@concept
## Split through a buffer
14 cells do not fit in one page. So we line them up in a local buffer of 14 cells, with the new one in its sorted place. Then we copy the first half back into the old page and the second half into a new page.
---
@build
## Line up the cells
Put this above `leaf_node_insert`:
```c
void leaf_node_split_and_insert(Cursor *cursor, uint32_t key,
                                const Row *value) {
  Pager *pager = &cursor->table->pager;
  char *old_node = get_page(pager, cursor->page_num);

  // Line up all the cells, plus the new one, in a buffer.
  char cells[(LEAF_MAX_CELLS + 1) * LEAF_CELL_SIZE];
  memcpy(cells, leaf_node_cell(old_node, 0),
         LEAF_MAX_CELLS * LEAF_CELL_SIZE);
  char *gap = cells + cursor->cell_num * LEAF_CELL_SIZE;
  uint32_t cells_after = LEAF_MAX_CELLS - cursor->cell_num;
  memmove(gap + LEAF_CELL_SIZE, gap, cells_after * LEAF_CELL_SIZE);
  write_u32(gap, key);
  serialize_row(value, gap + LEAF_KEY_SIZE);
```
This is the same gap trick as in `leaf_node_insert`, done in the buffer.
---
@build
## Divide the cells
```c
  // The left half stays; the right half moves to a new leaf.
  uint32_t new_page_num = get_unused_page_num(pager);
  char *new_node = get_page(pager, new_page_num);
  initialize_leaf_node(new_node);
  char *right_half = cells + LEAF_LEFT_SPLIT_COUNT * LEAF_CELL_SIZE;
  memcpy(leaf_node_cell(old_node, 0), cells,
         LEAF_LEFT_SPLIT_COUNT * LEAF_CELL_SIZE);
  memcpy(leaf_node_cell(new_node, 0), right_half,
         LEAF_RIGHT_SPLIT_COUNT * LEAF_CELL_SIZE);
  set_leaf_node_num_cells(old_node, LEAF_LEFT_SPLIT_COUNT);
  set_leaf_node_num_cells(new_node, LEAF_RIGHT_SPLIT_COUNT);
```
---
@build
## Then a new root
```c
  if (is_node_root(old_node)) {
    create_new_root(cursor->table, new_page_num);
  } else {
    printf("Need to implement updating parent after split.\n");
    exit(EXIT_FAILURE);
  }
}
```
Only the root can split for now. A second split needs searching through internal nodes, which comes next.
---
@build
## Split when full
At the start of `leaf_node_insert`, after reading `num_cells`:
```c
  if (num_cells >= LEAF_MAX_CELLS) {
    leaf_node_split_and_insert(cursor, key, value);
    return;
  }
```
In `execute_insert`, delete the `Error: Table full.` check.
---
@build
## Not there yet
Search and scan still treat the root as a leaf. Until we fix them, both stop with a message. At the start of `execute_insert`:
```c
  char *root = get_page(&table->pager, table->root_page_num);
  if (get_node_type(root) == NODE_INTERNAL) {
    return "Need to implement searching an internal node.";
  }
```
At the start of `execute_select`, the same check, returning `"Need to implement scanning a tree."`.
---
@build
## Print internal nodes
Replace `print_tree`:
```c
void print_tree(Pager *pager, uint32_t page_num, uint32_t level) {
  char *node = get_page(pager, page_num);
  indent(level);
  if (get_node_type(node) == NODE_LEAF) {
    uint32_t num_cells = leaf_node_num_cells(node);
    printf("- leaf (size %u)\n", num_cells);
    for (uint32_t i = 0; i < num_cells; i++) {
      indent(level + 1);
      printf("- %u\n", leaf_node_key(node, i));
    }
    return;
  }
  uint32_t num_keys = internal_node_num_keys(node);
  printf("- internal (size %u)\n", num_keys);
  for (uint32_t i = 0; i < num_keys; i++) {
    print_tree(pager, internal_node_child(node, i), level + 1);
    indent(level + 1);
    printf("- key %u\n", internal_node_key(node, i));
  }
  print_tree(pager, internal_node_child(node, num_keys), level + 1);
}
```
---
@build
## Run it
We write 14 inserts to a file and feed it in. At the end of input, the program closes the database normally.
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ for i in $(seq 1 14); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > .btree
Tree:
- internal (size 1)
  - leaf (size 7)
    - 1
    - 2
    - 3
    - 4
    - 5
    - 6
    - 7
  - key 7
  - leaf (size 7)
    - 8
    - 9
    - 10
    - 11
    - 12
    - 13
    - 14
db > insert 15 user15 u15@example.com
Need to implement searching an internal node.
db > .exit
```
---
@quiz
## A full leaf gets one more cell. How are the 14 cells divided?
- [ ] 13 and 1
- [x] 7 and 7
- [ ] 14 in a bigger page
> Each half gets (13 + 1) / 2 = 7 cells.
---
@quiz
## After the first split, how long is the file?
- [ ] 4096 bytes
- [ ] 8192 bytes
- [x] 12288 bytes
> Three pages: the root, the new right leaf, and the copy of the old root that became the left leaf.
---
@quiz
## After inserting 1 to 14, what is the root's only key?
- [ ] 1
- [x] 7
- [ ] 8
> The key is the largest key in the left child.
