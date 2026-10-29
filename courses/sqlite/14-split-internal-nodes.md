# Split full internal nodes
requires: c-basics/how-c-becomes-a-program, c-basics/bytes-and-layout

@concept
## When the parent is full
With a fifth child, an internal node has too many. It splits like a leaf: the first 2 children stay, the other 3 move to a new internal node. Then the new node must be added to its own parent.
```diagram
full root: 4 children + 1 new
left: 2 children
right: 3 children
new root above both
```
---
@concept
## Splits travel upward
Adding the new node to its parent can make that parent split too, and so on up the tree. It stops at a node with room, or at the root, which then gets a new root on top. That is how the tree grows taller.
---
@concept
## Two functions calling each other
`internal_node_insert` will call `insert_into_parent`, and `insert_into_parent` already calls `internal_node_insert`. Whichever comes first in the file calls a function that is not declared yet. A prototype fixes that.
---
@build
## The prototype
Just above `internal_node_insert`:
```c
void insert_into_parent(Table *table, uint32_t left_page_num,
                        uint32_t right_page_num);
```
---
@build
## Split instead of stopping
In `internal_node_insert`, replace the "Need to implement splitting internal node." block and the last line with:
```c
  if (count <= INTERNAL_MAX_KEYS + 1) {
    set_internal_node_children(pager, parent_page_num, children, count);
    return;
  }

  // Too many children: split this node too.
  uint32_t new_page_num = get_unused_page_num(pager);
  initialize_internal_node(get_page(pager, new_page_num));
  uint32_t left_count = count / 2;
  set_internal_node_children(pager, parent_page_num, children,
                             left_count);
  set_internal_node_children(pager, new_page_num, children + left_count,
                             count - left_count);
  insert_into_parent(table, parent_page_num, new_page_num);
}
```
`children + left_count` is the address of the first child that moves. `set_internal_node_children` also sets the moved children's parent to the new node.
---
@concept
## Copying an internal root
When the root is an internal node and splits, `create_new_root` copies it to a new left page. Its children still say page 0 is their parent, but their parent is now that left page.
---
@build
## Fix the children's parent
In `create_new_root`, after `set_node_root(left, false);`:
```c
  if (get_node_type(left) == NODE_INTERNAL) {
    // Its children still name the root as their parent.
    for (uint32_t i = 0; i <= internal_node_num_keys(left); i++) {
      char *child = get_page(pager, internal_node_child(left, i));
      set_node_parent(child, left_page_num);
    }
  }
```
---
@build
## Run it
```console
$ rm -f test.db
$ cc -Wall -Wextra -o db db.c
$ for i in $(seq 1 35); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ ./db test.db
db > .btree
Tree:
- internal (size 1)
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
  - key 14
  - internal (size 2)
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
    - key 28
    - leaf (size 7)
      - 29
      - 30
      - 31
      - 32
      - 33
      - 34
      - 35
db > .exit
```
The tree now has three levels.
---
@build
## Random order
Insert 200 ids in random order, then look at the first rows:
```console
$ rm -f test.db
$ for i in $(seq 1 200 | sort -R); do echo "insert $i user$i u$i@example.com"; done > rows.txt
$ ./db test.db < rows.txt > /dev/null
$ echo select | ./db test.db | head -n 3
db > (1, user1, u1@example.com)
(2, user2, u2@example.com)
(3, user3, u3@example.com)
```
`sort -R` shuffles the lines. With piped input, the prompt is printed but your input is not, so the first row appears right after `db > `.
---
@concept
## What you built
A REPL that parses `insert` and `select`, rows packed into bytes, a pager that caches 4096-byte pages from a file, and a B+ tree that keeps rows sorted, finds keys in a few steps, and grows by splitting nodes upward.
---
@quiz
## The root splits. Which page is the root afterwards?
- [x] Page 0
- [ ] The new page
- [ ] The left copy
> The root's contents move to a new left page, and page 0 becomes the new root.
---
@quiz
## An internal node ends up with 5 children. How are they divided?
- [ ] 1 and 4
- [x] 2 and 3
- [ ] 5 and 0
> `left_count` is 5 / 2 = 2, and the other 3 move to the new node.
---
@quiz
## Why do we need the prototype for insert_into_parent?
- [ ] It makes the function faster
- [x] internal_node_insert calls it before its definition in the file
- [ ] Prototypes are needed for every function
> C needs a declaration before a call. The two functions call each other, so one of them must be declared first.
