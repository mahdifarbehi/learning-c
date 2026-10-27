# Persist pages to disk
requires: c-basics/how-c-becomes-a-program, c-basics/pointers, c-basics/heap-memory, c-basics/arrays-strings-buffers, c-basics/bytes-and-layout

@concept
## Put a pager between table and file
The **pager** owns the database file and the in-memory page cache. Table code asks it for page numbers instead of performing file operations directly.

```diagram
table -> pager -> database file
         |
         -> cached pages
```

---
@build
## Store pager state
A file descriptor is the integer handle returned by `open`. `off_t` stores file positions.

```c
typedef struct {
  int file_descriptor;
  off_t file_length;
  uint32_t page_count;
  uint8_t *pages[TABLE_MAX_PAGES];
} Pager;

typedef struct {
  Pager *pager;
  uint32_t row_count;
} Table;
```

---
@build
## Open the database file
The flags request reading and writing and create the file when it is absent. The permission bits give its owner read and write access.

```c
int descriptor = open(filename, O_RDWR | O_CREAT, S_IRUSR | S_IWUSR);
if (descriptor < 0) {
  fprintf(stderr, "Could not open database: %s\n", strerror(errno));
  exit(EXIT_FAILURE);
}

off_t length = lseek(descriptor, 0, SEEK_END);
if (length < 0) {
  fprintf(stderr, "Could not measure database.\n");
  exit(EXIT_FAILURE);
}
off_t maximum_length = (off_t)TABLE_MAX_PAGES * PAGE_SIZE;
if (length > maximum_length) {
  fprintf(stderr, "Database exceeds the page-cache limit.\n");
  exit(EXIT_FAILURE);
}

Pager *pager = malloc(sizeof *pager);
if (pager == NULL) {
  fprintf(stderr, "Could not allocate pager.\n");
  exit(EXIT_FAILURE);
}
pager->file_descriptor = descriptor;
pager->file_length = length;
pager->page_count =
    (uint32_t)(((size_t)length + PAGE_SIZE - 1) / PAGE_SIZE);
memset(pager->pages, 0, sizeof pager->pages);
```

The `page_count` calculation rounds up when a partial final page exists. `memset` fills the page-pointer array with zero bytes, making every cache entry null. `strerror` turns the error number in `errno` into a message. Include `<fcntl.h>`, `<sys/stat.h>`, and `<unistd.h>` for these file operations.

---
@build
## Load a page on a cache miss
Allocate a cleared page, seek to its file offset, and read the bytes that already exist there.

Before allocating, reject `page_number >= TABLE_MAX_PAGES`. After caching a new highest page, set `page_count` to `page_number + 1`.

```c
if (page_number >= TABLE_MAX_PAGES) {
  fprintf(stderr, "Page number is out of range.\n");
  exit(EXIT_FAILURE);
}

uint8_t *page = calloc(PAGE_SIZE, 1);
if (page == NULL) {
  fprintf(stderr, "Could not allocate page cache.\n");
  exit(EXIT_FAILURE);
}

off_t offset = (off_t)page_number * PAGE_SIZE;
if (offset < pager->file_length) {
  size_t remaining = (size_t)(pager->file_length - offset);
  size_t expected = remaining < PAGE_SIZE ? remaining : PAGE_SIZE;
  if (lseek(pager->file_descriptor, offset, SEEK_SET) != offset ||
      read(pager->file_descriptor, page, expected) != (ssize_t)expected) {
    fprintf(stderr, "Could not read database page.\n");
    exit(EXIT_FAILURE);
  }
}
pager->pages[page_number] = page;
if (page_number >= pager->page_count) {
  pager->page_count = page_number + 1;
}
```

The conditional expression `condition ? first : second` selects one of two values. A read count different from `expected` is fatal.

---
@build
## Write exactly the live bytes
At this stage the final page may contain only part of its capacity.

```c
void pager_flush(Pager *pager, uint32_t page_number, size_t byte_count) {
  off_t offset = (off_t)page_number * PAGE_SIZE;
  if (lseek(pager->file_descriptor, offset, SEEK_SET) != offset ||
      write(pager->file_descriptor,
            pager->pages[page_number],
            byte_count) != (ssize_t)byte_count) {
    fprintf(stderr, "Could not write database page.\n");
    exit(EXIT_FAILURE);
  }
}
```

---
@build
## Reconstruct the row count
The file contains only complete serialized rows, so opening it can derive the count.

```c
if ((size_t)pager->file_length % ROW_SIZE != 0) {
  fprintf(stderr, "Database file has an invalid size.\n");
  exit(EXIT_FAILURE);
}
table->row_count =
    (uint32_t)((size_t)pager->file_length / ROW_SIZE);
```

---
@build
## Close in ownership order
Flush each dirty cached page, free it, close the descriptor, then free the pager and table.

The final page writes `(row_count % rows_per_page) * ROW_SIZE` bytes. When the remainder is zero, every used page is full.

```c
if (close(pager->file_descriptor) != 0) {
  fprintf(stderr, "Could not close database.\n");
  exit(EXIT_FAILURE);
}
free(pager);
free(table);
```

---
@quiz
## When does a page read from disk?
- [ ] Every time a row is accessed
- [x] The first time that page is requested after opening the database
- [ ] Only when `.exit` is entered
> The pager caches a loaded page pointer and reuses it on later requests.

---
@build
## Take the filename from argv
`argv` is the array of command-line strings and `argc` is its length.

```c
int main(int argc, char *argv[]) {
  if (argc != 2) {
    fprintf(stderr, "Usage: %s DATABASE_FILE\n", argv[0]);
    return EXIT_FAILURE;
  }
  Table *table = db_open(argv[1]);
  /* REPL */
  db_close(table);
  return EXIT_SUCCESS;
}
```

Now rows survive closing and reopening `./db demo.db`.
