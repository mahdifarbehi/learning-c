# Update a parent after a split
requires: c-basics/pointers, c-basics/bytes-and-layout

@concept
## A split below the root
When a leaf under the root splits, there is no new root. The parent gains one more child, the new leaf, right after the old one. The parent also needs keys that match its children again.
```diagram
before: root 7 | leaves 1-7, 8-20
insert 21
after: root 7 14 | leaves 1-7, 8-14, 15-21
```
---
@concept
## Finding the parent
A node needs to know its parent. Bytes 2-5 of the header have been reserved for this from the start: the **parent pointer**, which holds the parent's page number.
---
@build
## Parent accessors
Next to `set_node_root`:
```c
uint32_t node_parent(char *node) {
  return read_u32(node + PARENT_OFFSET);
}

void set_node_parent(char *node, uint32_t page_num) {
  write_u32(node + PARENT_OFFSET, page_num);
}
```
---
@build
## Children learn their parent
In `set_internal_node_children`, add one line at the end of the loop:
```c
    set_node_parent(get_page(pager, children[i]), page_num);
```
Every time a node gets its children, each child records who its parent is. `create_new_root` uses this function too, so both halves of a root split get the root as their parent.
---
@concept
## Rebuild the list of children
To add a child, we read the parent's children into a small array, put the new page right after the old one, and write the whole list back with `set_internal_node_children`. That also recomputes every key, including the old child's, whose largest key just got smaller.
---
@build
## A small limit
```c
#define INTERNAL_MAX_KEYS 3
```
Put it after `INTERNAL_CELL_SIZE`. A page has room for about 500 keys, but with 3, internal nodes fill up after a few dozen rows, so you can watch them split.
---
@build
## internal_node_insert
Put this above `leaf_node_split_and_insert`:
```c
// Puts right_page_num into the parent, just after left_page_num.
void internal_node_insert(Table *table, uint32_t parent_page_num,
                          uint32_t left_page_num, uint32_t right_page_num) {
  Pager *pager = &table->pager;
  char *parent = get_page(pager, parent_page_num);

  uint32_t children[INTERNAL_MAX_KEYS + 2];
  uint32_t count = 0;
  for (uint32_t i = 0; i <= internal_node_num_keys(parent); i++) {
    uint32_t child = internal_node_child(parent, i);
    children[count] = child;
    count += 1;
    if (child == left_page_num) {
      children[count] = right_page_num;
      count += 1;
    }
  }
```
The array has room for one child more than a full node holds.
---
@build
## Write the list back
```c
  if (count > INTERNAL_MAX_KEYS + 1) {
    printf("Need to implement splitting internal node.\n");
    exit(EXIT_FAILURE);
  }
  set_internal_node_children(pager, parent_page_num, children, count);
}
```
A full parent would have to split too. That is the next lesson.
---
@build
## insert_into_parent
```c
// After a node splits, records its new right half in the parent.
void insert_into_parent(Table *table, uint32_t left_page_num,
                        uint32_t right_page_num) {
  char *left = get_page(&table->pager, left_page_num);
  if (is_node_root(left)) {
    create_new_root(table, right_page_num);
    return;
  }
  internal_node_insert(table, node_parent(left), left_page_num,
                       right_page_num);
}
```
---
@build
## Use it after a leaf split
At the end of `leaf_node_split_and_insert`, replace the `if (is_node_root(old_node))` block with:
```c
  insert_into_parent(cursor->table, cursor->page_num, new_page_num);
```
---
@build
## Run it
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ for i in $(seq 1 28); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > .btree
Tree:
- internal (size 3)
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
  - key 14
  - leaf (size 7)
    - 15
    - 16
    - 17
    - 18
    - 19
    - 20
    - 21
  - key 21
  - leaf (size 7)
    - 22
    - 23
    - 24
    - 25
    - 26
    - 27
    - 28
db > .exit
```
The root now has its maximum of 3 keys and 4 children.
---
@build
## The next limit
```console
$ rm -f test.db
$ for i in $(seq 1 34); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > insert 35 user35 u35@example.com
Need to implement splitting internal node.
```
The last leaf is full again. Splitting it would give the root a fifth child.
---
@quiz
## The parent has 3 keys and one of its leaves splits. What happens now?
- [ ] The parent stores 4 keys
- [x] `Need to implement splitting internal node.`
- [ ] The new leaf is dropped
> 3 keys is the maximum, so a fifth child does not fit.
---
@quiz
## Why does set_internal_node_children recompute every key?
- [ ] Keys are stored in a different order on disk
- [x] After a split, the old child's largest key is smaller
- [ ] To check the file for errors
> The old child gave its upper half away, so its key in the parent must change.
