# Search through internal nodes
requires: c-basics/bytes-and-layout

@concept
## Walking down
To find a key, start at the root. At each internal node, pick the child whose range holds the key, and go down into it. Repeat until you reach a leaf, then search the leaf as before.
---
@concept
## Choosing a child
Take the first key that is greater than or equal to the one you want. Its child is the one to follow. If every key is smaller, follow the right child. This is the same search we use in leaves.
```diagram
keys: 7 20
find 5: child 0
find 7: child 0
find 8: child 1
find 25: child 2, the right child
```
---
@build
## internal_node_find_child
Put this above `table_find`:
```c
// Returns the index of the child that should hold key.
uint32_t internal_node_find_child(char *node, uint32_t key) {
  uint32_t low = 0;
  uint32_t high = internal_node_num_keys(node);
  while (low < high) {
    uint32_t mid = (low + high) / 2;
    if (internal_node_key(node, mid) < key) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
```
`high` starts at `num_keys`, so the answer can be the right child.
---
@build
## table_find walks the tree
```c
// Finds where key is, or where it would go.
Cursor table_find(Table *table, uint32_t key) {
  uint32_t page_num = table->root_page_num;
  char *node = get_page(&table->pager, page_num);
  while (get_node_type(node) == NODE_INTERNAL) {
    uint32_t child_num = internal_node_find_child(node, key);
    page_num = internal_node_child(node, child_num);
    node = get_page(&table->pager, page_num);
  }
  return leaf_node_find(table, page_num, key);
}
```
A loop handles any number of levels.
---
@build
## Remove the insert check
In `execute_insert`, delete the "Need to implement searching an internal node." check. Inserts now reach the right leaf.
---
@concept
## The next limit
Now a leaf below the root can fill up. Splitting it means adding a child to its parent, which we have not written yet. For now the program prints "Need to implement updating parent after split." and stops.
---
@build
## Run it
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ for i in $(seq 1 14); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > insert 15 user15 u15@example.com
Executed.
db > insert 3 again again@example.com
Error: Duplicate key.
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
  - leaf (size 8)
    - 8
    - 9
    - 10
    - 11
    - 12
    - 13
    - 14
    - 15
db > .exit
```
---
@quiz
## An internal node has keys 7 and 20. Which child does key 20 go to?
- [ ] Child 0
- [x] Child 1
- [ ] Child 2, the right child
> The first key that is at least 20 is 20 itself, at index 1.
---
@quiz
## Why does table_find use a loop instead of one step?
- [ ] To retry when a read fails
- [x] The tree can have many levels of internal nodes
- [ ] To search every leaf
> It goes down one level per pass until it reaches a leaf.
