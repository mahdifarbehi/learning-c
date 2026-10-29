# Lay out a leaf node
requires: c-basics/pointers, c-basics/bytes-and-layout, c-basics/file-descriptors

@concept
## From a list to a leaf
Now each page becomes a tree node. We start with the simplest tree: one leaf, stored in page 0, that is also the root. It holds up to 13 rows.

Each row is stored in a **cell**: its key (the id) followed by the row's bytes.
---
@concept
## The node header
Every node starts with a few bytes that describe it.
```diagram
byte 0: node type
byte 1: is root
bytes 2-5: parent page
bytes 6-9: number of cells
bytes 10 and up: cells
```
The first six bytes are the same for every kind of node.
---
@concept
## Cells
A cell is a 4-byte key plus a 293-byte row: 297 bytes. After the 10-byte header there is room for (4096 - 10) / 297 = 13 cells.
```diagram
cell n starts at byte 10 + n * 297
key: 4 bytes
row: 293 bytes
```
---
@build
## Node constants
Delete `ROWS_PER_PAGE` and `TABLE_MAX_ROWS`. After `TABLE_MAX_PAGES`, add:
```c
typedef enum { NODE_INTERNAL, NODE_LEAF } NodeType;

// Every node starts with: type (1 byte), is_root (1), parent (4).
#define NODE_TYPE_OFFSET 0
#define IS_ROOT_OFFSET 1
#define PARENT_OFFSET 2

// A leaf node adds: num_cells (4).
#define LEAF_NUM_CELLS_OFFSET 6
#define LEAF_HEADER_SIZE 10

// Each leaf cell is a key followed by a row.
#define LEAF_KEY_SIZE 4
#define LEAF_CELL_SIZE (LEAF_KEY_SIZE + ROW_SIZE)
#define LEAF_MAX_CELLS ((PAGE_SIZE - LEAF_HEADER_SIZE) / LEAF_CELL_SIZE)
```
---
@build
## Numbers inside bytes
```c
uint32_t read_u32(const char *bytes) {
  uint32_t value;
  memcpy(&value, bytes, 4);
  return value;
}

void write_u32(char *bytes, uint32_t value) {
  memcpy(bytes, &value, 4);
}
```
Header fields sit at odd offsets like 6, so we copy them with `memcpy` instead of casting pointers.
---
@build
## Leaf accessors
```c
void set_node_type(char *node, NodeType type) {
  node[NODE_TYPE_OFFSET] = type;
}

uint32_t leaf_node_num_cells(char *node) {
  return read_u32(node + LEAF_NUM_CELLS_OFFSET);
}

void set_leaf_node_num_cells(char *node, uint32_t num_cells) {
  write_u32(node + LEAF_NUM_CELLS_OFFSET, num_cells);
}
```
Small functions like these keep the offsets in one place.
---
@build
## Cells, keys and values
```c
char *leaf_node_cell(char *node, uint32_t cell_num) {
  return node + LEAF_HEADER_SIZE + cell_num * LEAF_CELL_SIZE;
}

uint32_t leaf_node_key(char *node, uint32_t cell_num) {
  return read_u32(leaf_node_cell(node, cell_num));
}

char *leaf_node_value(char *node, uint32_t cell_num) {
  return leaf_node_cell(node, cell_num) + LEAF_KEY_SIZE;
}

void initialize_leaf_node(char *node) {
  set_node_type(node, NODE_LEAF);
  set_leaf_node_num_cells(node, 0);
}
```
---
@build
## Pager, Table and Cursor
The pager now counts whole pages. The table remembers the root page. The cursor points at a cell in a page.
```c
typedef struct {
  int file_descriptor;
  uint32_t num_pages;
  char *pages[TABLE_MAX_PAGES];
} Pager;

typedef struct {
  Pager pager;
  uint32_t root_page_num;
} Table;

typedef struct {
  Table *table;
  uint32_t page_num;
  uint32_t cell_num;
  bool end_of_table;  // one past the last row
} Cursor;
```
---
@build
## Whole pages only
In `pager_open`, after the size check, check the length and count pages:
```c
  if (file_length % PAGE_SIZE != 0) {
    fprintf(stderr, "Db file is not a whole number of pages.\n");
    exit(EXIT_FAILURE);
  }
  pager->file_descriptor = fd;
  pager->num_pages = (uint32_t)(file_length / PAGE_SIZE);
```
Every page is now written whole, so any other length means the file is broken.
---
@build
## get_page counts new pages
In `get_page`, drop the partial-page lines and use `num_pages`:
```c
    if (page_num < pager->num_pages) {
      off_t offset = (off_t)page_num * PAGE_SIZE;
      if (lseek(pager->file_descriptor, offset, SEEK_SET) == -1) {
        die("lseek");
      }
      if (read(pager->file_descriptor, page, PAGE_SIZE) == -1) {
        die("read");
      }
    } else {
      pager->num_pages = page_num + 1;
    }
```
A page past the end is new, so the file grows to include it.
---
@build
## Flush whole pages
```c
void pager_flush(Pager *pager, uint32_t page_num) {
  off_t offset = (off_t)page_num * PAGE_SIZE;
  if (lseek(pager->file_descriptor, offset, SEEK_SET) == -1) {
    die("lseek");
  }
  ssize_t written =
      write(pager->file_descriptor, pager->pages[page_num], PAGE_SIZE);
  if (written != PAGE_SIZE) {
    die("write");
  }
}
```
---
@build
## Open: an empty root
```c
Table *db_open(const char *filename) {
  Table *table = malloc(sizeof(Table));
  if (table == NULL) {
    die("malloc");
  }
  pager_open(&table->pager, filename);
  table->root_page_num = 0;
  if (table->pager.num_pages == 0) {
    // A new file: page 0 becomes an empty leaf.
    char *root = get_page(&table->pager, 0);
    initialize_leaf_node(root);
  }
  return table;
}
```
---
@build
## Close: flush every page
```c
void db_close(Table *table) {
  Pager *pager = &table->pager;
  for (uint32_t i = 0; i < pager->num_pages; i++) {
    if (pager->pages[i] != NULL) {
      pager_flush(pager, i);
    }
  }
```
The rest of `db_close` stays the same.
---
@build
## The cursor uses cells
```c
Cursor table_start(Table *table) {
  char *root = get_page(&table->pager, table->root_page_num);
  Cursor cursor = {
      .table = table,
      .page_num = table->root_page_num,
      .cell_num = 0,
      .end_of_table = (leaf_node_num_cells(root) == 0),
  };
  return cursor;
}

Cursor table_end(Table *table) {
  char *root = get_page(&table->pager, table->root_page_num);
  Cursor cursor = {
      .table = table,
      .page_num = table->root_page_num,
      .cell_num = leaf_node_num_cells(root),
      .end_of_table = true,
  };
  return cursor;
}
```
---
@build
## Value and advance
```c
char *cursor_value(Cursor *cursor) {
  char *page = get_page(&cursor->table->pager, cursor->page_num);
  return leaf_node_value(page, cursor->cell_num);
}

void cursor_advance(Cursor *cursor) {
  char *node = get_page(&cursor->table->pager, cursor->page_num);
  cursor->cell_num += 1;
  if (cursor->cell_num >= leaf_node_num_cells(node)) {
    cursor->end_of_table = true;
  }
}
```
---
@build
## Insert into the leaf
```c
void leaf_node_insert(Cursor *cursor, uint32_t key, const Row *value) {
  char *node = get_page(&cursor->table->pager, cursor->page_num);
  uint32_t num_cells = leaf_node_num_cells(node);
  set_leaf_node_num_cells(node, num_cells + 1);
  write_u32(leaf_node_cell(node, cursor->cell_num), key);
  serialize_row(value, leaf_node_value(node, cursor->cell_num));
}
```
The key is the row's id.
---
@build
## execute_insert
```c
const char *execute_insert(const Statement *statement, Table *table) {
  const Row *row = &statement->row_to_insert;
  Cursor cursor = table_end(table);
  char *node = get_page(&table->pager, cursor.page_num);
  if (leaf_node_num_cells(node) >= LEAF_MAX_CELLS) {
    return "Error: Table full.";
  }
  leaf_node_insert(&cursor, row->id, row);
  return NULL;
}
```
One leaf holds 13 rows. Splitting comes later.
---
@build
## Show the tree
```c
void indent(uint32_t level) {
  for (uint32_t i = 0; i < level; i++) {
    printf("  ");
  }
}

void print_tree(Pager *pager, uint32_t page_num, uint32_t level) {
  char *node = get_page(pager, page_num);
  uint32_t num_cells = leaf_node_num_cells(node);
  indent(level);
  printf("- leaf (size %u)\n", num_cells);
  for (uint32_t i = 0; i < num_cells; i++) {
    indent(level + 1);
    printf("- %u\n", leaf_node_key(node, i));
  }
}
```
---
@build
## A .btree command
In `main`, after the `.exit` check:
```c
    if (strcmp(line, ".btree") == 0) {
      printf("Tree:\n");
      print_tree(&table->pager, table->root_page_num, 0);
      continue;
    }
```
---
@build
## Run it
The file format changed, so delete the old file first.
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ ./db test.db
db > insert 3 carol carol@example.com
Executed.
db > insert 1 alice alice@example.com
Executed.
db > insert 2 bob bob@example.com
Executed.
db > .btree
Tree:
- leaf (size 3)
  - 3
  - 1
  - 2
db > .exit
```
The keys are still in insert order. The next lesson sorts them.
---
@quiz
## The leaf has 13 rows. What happens on the next insert?
- [ ] The leaf splits
- [x] `Error: Table full.`
- [ ] The program crashes
> We check `LEAF_MAX_CELLS` before inserting.
---
@quiz
## You insert 3 rows and exit. How long is the file?
- [ ] 891 bytes
- [x] 4096 bytes
- [ ] 12288 bytes
> The single leaf page is written whole.
---
@quiz
## The file is 5000 bytes long. What happens when you open it?
- [ ] The first page loads and the rest is ignored
- [x] `Db file is not a whole number of pages.`
- [ ] The file is truncated to 4096 bytes
> 5000 is not a multiple of 4096.
