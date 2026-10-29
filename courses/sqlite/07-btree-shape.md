# Choose a B+ tree
requires: c-basics/bytes-and-layout

@concept
## The problem with a list
Our rows sit in insert order. To find id 500, we must read every row. To keep them sorted, every insert would shift all the rows after it.

A database needs fast lookups, fast inserts, and fast scans in order.
---
@concept
## A tree of pages
A **B-tree** is a tree where each node is one page and holds many keys. With many keys per node, the tree is wide and shallow. Finding any key takes only a few page reads.
---
@concept
## B+ tree
SQLite stores each table in a **B+ tree**. Rows live only in the **leaf** nodes at the bottom. **Internal** nodes above them hold only keys and links to children, to guide the search.
```diagram
internal: 5 9
leaf: 1 3 5
leaf: 7 8 9
leaf: 12 15
```
---
@concept
## Keys guide the search
In our tree, each key in an internal node is the largest key in the child it belongs to. The last child has no key: it holds everything larger.

To find 8: it is above 5 and not above 9, so it is in the middle child.
---
@concept
## One more child than keys
An internal node with n keys has n + 1 children. Inside every node, keys are kept sorted, so the node can be searched with binary search.
---
@concept
## Splitting keeps it balanced
When a leaf is full, it splits into two halves, and its parent gains a key and a child. When the parent is full, it splits too.

When the root splits, a new root is added on top. That is the only way the tree gets taller, so all leaves stay at the same depth.
```diagram
full leaf: 1 2 3 4
after split:
root: 2
leaf: 1 2
leaf: 3 4
```
---
@concept
## One node, one page
Each node is one 4096-byte page. A link to a child is its page number, not a memory address: addresses change every time the program runs, but page numbers in the file stay the same. The root is always page 0.
---
@concept
## Why it scales
A node holds hundreds of keys, so three levels can reach millions of rows. Our tree has the same shape on a smaller scale.
---
@quiz
## In a B+ tree, which nodes hold the rows?
- [ ] Every node
- [ ] Only the root
- [x] Only the leaves
> Internal nodes hold keys and children. Rows live in the leaves.
---
@quiz
## An internal node has keys 5 and 9. Which child holds key 10?
- [ ] The first
- [ ] The second
- [x] The last
> 10 is larger than every key in the node.
---
@quiz
## When does the tree get taller?
- [ ] When any leaf splits
- [x] When the root splits
- [ ] Every 100 inserts
> A new root is added above the old one. Every leaf stays at the same depth.
---
@quiz
## An internal node has 3 keys. How many children does it have?
- [ ] 3
- [x] 4
- [ ] 6
> Always one more child than keys.
