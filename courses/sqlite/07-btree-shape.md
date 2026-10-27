# Choose a B+ tree
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## The append-only table has a limit
Rows currently follow insertion order. Finding one id requires scanning every earlier row, and inserting in sorted order would require moving many rows.

We need a structure that stays sorted as it grows.

---
@concept
## A B+ tree stores many choices per node
A **B+ tree** is a balanced search tree whose nodes contain many keys. All stored rows live in leaf nodes; internal nodes only guide the search.

```diagram
internal: 7 | 15
children: <=7   8..15   >15
```

---
@concept
## Leaf nodes hold the records
A leaf contains sorted key-and-row cells.

```diagram
leaf: 2->row  5->row  7->row
```

Searching within one leaf can use binary search.

---
@concept
## Internal keys describe children
Each internal key is the largest key in the child immediately to its left. The separate right child contains keys larger than the last separator.

This rule tells a search which child page to visit.

---
@concept
## Splitting preserves balance
When a node fills, insertion divides its cells between two nodes and adds a separator to their parent.

If the root splits, a new root is created above both halves. Every leaf therefore remains at the same depth.

---
@quiz
## What happens when a search reaches an internal node?
- [ ] It reads the complete row there
- [x] It follows a child page toward a leaf
- [ ] It scans every database page
> Internal nodes store page numbers and separator keys. The complete serialized row is read only in a leaf.

---
@concept
## Page numbers connect the tree
Nodes cannot store ordinary pointers on disk because addresses change between runs. They store page numbers, which the pager resolves to in-memory page pointers.

The next lesson defines the byte layout of the first leaf node.
