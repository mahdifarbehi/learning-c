# Keep the leaf sorted
requires: c-basics/bytes-and-layout

@concept
## Sorted cells
If the cells are sorted by key, we can find a key with binary search, `select` prints rows in id order, and a duplicate id is easy to spot: it sits exactly where the new key would go.
---
@concept
## Search for a position
We look for the first cell whose key is greater than or equal to the one we want. That is where the key is, or where it belongs. Each step halves the window between `low` and `high`.
```diagram
keys: 1 3 5 7, find 4
low 0, high 4, mid 2: 5 >= 4, high = 2
low 0, high 2, mid 1: 3 < 4, low = 2
answer: position 2
```
---
@build
## leaf_node_find
Replace `table_end` with:
```c
// Finds the first cell whose key is >= key.
Cursor leaf_node_find(Table *table, uint32_t page_num, uint32_t key) {
  char *node = get_page(&table->pager, page_num);
  uint32_t low = 0;
  uint32_t high = leaf_node_num_cells(node);
  while (low < high) {
    uint32_t mid = (low + high) / 2;
    if (leaf_node_key(node, mid) < key) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  Cursor cursor = {
      .table = table,
      .page_num = page_num,
      .cell_num = low,
      .end_of_table = false,
  };
  return cursor;
}
```
---
@build
## table_find
```c
// Finds where key is, or where it would go.
Cursor table_find(Table *table, uint32_t key) {
  return leaf_node_find(table, table->root_page_num, key);
}
```
For now the root is the only node.
---
@concept
## Make a gap
To insert in the middle, the cells after the position move one cell to the right. The source and destination overlap, so we use `memmove`.
```diagram
before: 1 3 5 7
insert 4 at position 2
after: 1 3 4 5 7
```
---
@build
## Insert in order
In `leaf_node_insert`, after reading `num_cells`:
```c
  // Shift the later cells one step right to make a gap.
  char *gap = leaf_node_cell(node, cursor->cell_num);
  uint32_t cells_after = num_cells - cursor->cell_num;
  memmove(gap + LEAF_CELL_SIZE, gap, cells_after * LEAF_CELL_SIZE);
```
When the position is at the end, `cells_after` is 0 and nothing moves.
---
@build
## Reject duplicates
`execute_insert` now finds the position by key:
```c
  const Row *row = &statement->row_to_insert;
  Cursor cursor = table_find(table, row->id);
  char *node = get_page(&table->pager, cursor.page_num);
  uint32_t num_cells = leaf_node_num_cells(node);
  if (cursor.cell_num < num_cells &&
      leaf_node_key(node, cursor.cell_num) == row->id) {
    return "Error: Duplicate key.";
  }
  if (num_cells >= LEAF_MAX_CELLS) {
    return "Error: Table full.";
  }
  leaf_node_insert(&cursor, row->id, row);
  return NULL;
```
We check `cell_num < num_cells` first, so we never read a key past the last cell.
---
@build
## Run it
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
db > insert 2 eve eve@example.com
Error: Duplicate key.
db > select
(1, alice, alice@example.com)
(2, bob, bob@example.com)
(3, carol, carol@example.com)
Executed.
db > .exit
```
---
@quiz
## The keys are 2 4 6. Which position does leaf_node_find return for 7?
- [ ] 2
- [x] 3
- [ ] It returns nothing
> No key is 7 or more, so the answer is one past the last cell: the new key goes at the end.
---
@quiz
## What could go wrong if we used memcpy to make the gap?
- [ ] Nothing, they do the same thing
- [x] The areas overlap, so memcpy's result is undefined
- [ ] memcpy cannot copy more than 4 bytes
> Only `memmove` is defined for overlapping areas.
---
@quiz
## The keys are 1 3 5. You insert 3 again. What prints?
- [ ] `Executed.`
- [x] `Error: Duplicate key.`
- [ ] `Error: Table full.`
> leaf_node_find lands on the existing 3.
