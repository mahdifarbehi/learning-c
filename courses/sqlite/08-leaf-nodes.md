# Lay out leaf nodes
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Every node occupies one page
From this point, the database file contains complete 4096-byte node pages. Page 0 is the root.

Opening an existing file now requires its length to be a whole number of pages, and flushing a node writes exactly `PAGE_SIZE` bytes. Start this format with a new database file.

---
@build
## Give every node a common header
The header records the node kind, whether it is the root, and its parent page number.

```c
typedef enum { NODE_INTERNAL, NODE_LEAF } NodeType;

enum {
  NODE_TYPE_OFFSET = 0,
  IS_ROOT_OFFSET = 1,
  PARENT_OFFSET = 2,
  COMMON_HEADER_SIZE = 2 + sizeof(uint32_t)
};
```

One-byte fields store the enum and boolean values.

---
@build
## Read and write header fields
The node pointer is already a `uint8_t *`, so adding an offset moves by bytes.

```c
NodeType node_type(const uint8_t *node) {
  return (NodeType)node[NODE_TYPE_OFFSET];
}

void set_node_type(uint8_t *node, NodeType type) {
  node[NODE_TYPE_OFFSET] = (uint8_t)type;
}

bool node_is_root(const uint8_t *node) {
  return node[IS_ROOT_OFFSET] != 0;
}
```

Use the `read_u32` and `write_u32` helpers for the parent field.

---
@build
## Add the leaf header
A leaf needs the number of live cells after the common header.

```c
enum {
  LEAF_COUNT_OFFSET = COMMON_HEADER_SIZE,
  LEAF_HEADER_SIZE = COMMON_HEADER_SIZE + sizeof(uint32_t)
};

uint32_t leaf_count(const uint8_t *node) {
  return read_u32(node, LEAF_COUNT_OFFSET);
}

void set_leaf_count(uint8_t *node, uint32_t count) {
  write_u32(node, LEAF_COUNT_OFFSET, count);
}
```

---
@build
## Lay out each leaf cell
A cell stores its key first and its serialized row second.

```c
enum {
  LEAF_KEY_SIZE = sizeof(uint32_t),
  LEAF_CELL_SIZE = LEAF_KEY_SIZE + ROW_SIZE,
  LEAF_MAX_CELLS =
      (PAGE_SIZE - LEAF_HEADER_SIZE) / LEAF_CELL_SIZE
};

uint8_t *leaf_cell(uint8_t *node, uint32_t cell_number) {
  return node + LEAF_HEADER_SIZE + cell_number * LEAF_CELL_SIZE;
}
```

---
@build
## Access keys and values separately
Key access copies a `uint32_t`; the value accessor returns the row's first byte.

```c
uint32_t leaf_key(const uint8_t *node, uint32_t cell_number) {
  const uint8_t *cell =
      node + LEAF_HEADER_SIZE + cell_number * LEAF_CELL_SIZE;
  return read_u32(cell, 0);
}

void set_leaf_key(uint8_t *node, uint32_t cell_number, uint32_t key) {
  write_u32(leaf_cell(node, cell_number), 0, key);
}

uint8_t *leaf_value(uint8_t *node, uint32_t cell_number) {
  return leaf_cell(node, cell_number) + LEAF_KEY_SIZE;
}
```

---
@build
## Initialize a new root leaf
Every field receives a known value before the page is used.

```c
void initialize_leaf(uint8_t *node) {
  memset(node, 0, PAGE_SIZE);
  set_node_type(node, NODE_LEAF);
  node[IS_ROOT_OFFSET] = 0;
  write_u32(node, PARENT_OFFSET, 0);
  set_leaf_count(node, 0);
}

uint8_t *root = pager_get_page(pager, 0);
initialize_leaf(root);
root[IS_ROOT_OFFSET] = 1;
```

`memset` writes the same byte value across a region; zeroing the page prevents uninitialized metadata. This initialization happens only when the file has no pages.

---
@build
## Insert into the root leaf
The cursor now stores a page number and cell number. An insert writes both parts of the cell.

Add `EXECUTE_TABLE_FULL` to `ExecuteResult` for the temporary full-leaf case.

```c
uint8_t *node = pager_get_page(cursor->table->pager, cursor->page_number);
uint32_t count = leaf_count(node);
if (count >= LEAF_MAX_CELLS) return EXECUTE_TABLE_FULL;

set_leaf_key(node, cursor->cell_number, row->id);
serialize_row(row, leaf_value(node, cursor->cell_number));
set_leaf_count(node, count + 1);
```

---
@quiz
## What can happen if Row is copied directly into the file?
- [ ] `memcpy` refuses to copy it
- [x] Padding bytes can become part of the stored format
- [ ] The leaf automatically removes the id
> Explicit field copies give the database a layout made only from the bytes it intends to store.
