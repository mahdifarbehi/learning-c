# Save pages to a file
requires: c-basics/heap-memory, c-basics/bytes-and-layout, c-basics/file-descriptors

@concept
## The pager
A new layer sits between the table and the file: the **pager**. The table asks it for page n. The pager returns the page from memory, or on first use reads it from the file at byte n × 4096. On exit, it writes the pages back.
```diagram
table -> pager -> file
page n starts at byte n * 4096
```
---
@build
## Pager and Table
Add `#include <fcntl.h>` and `#include <unistd.h>`. The pages move from the table into the pager:
```c
typedef struct {
  int file_descriptor;
  uint32_t file_length;
  char *pages[TABLE_MAX_PAGES];
} Pager;

typedef struct {
  uint32_t num_rows;
  Pager pager;
} Table;
```
The `Pager` is stored inside the `Table`, so it needs no allocation of its own.
---
@build
## Open the file
```c
void pager_open(Pager *pager, const char *filename) {
  int fd = open(filename, O_RDWR | O_CREAT, 0644);
  if (fd == -1) {
    die("open");
  }
  off_t file_length = lseek(fd, 0, SEEK_END);
  if (file_length == -1) {
    die("lseek");
  }
  pager->file_descriptor = fd;
  pager->file_length = (uint32_t)file_length;
  for (uint32_t i = 0; i < TABLE_MAX_PAGES; i++) {
    pager->pages[i] = NULL;
  }
}
```
Seeking to the end tells us how long the file is.
---
@build
## Get a page
```c
char *get_page(Pager *pager, uint32_t page_num) {
  if (page_num >= TABLE_MAX_PAGES) {
    printf("Page %u is out of bounds.\n", page_num);
    exit(EXIT_FAILURE);
  }
  if (pager->pages[page_num] == NULL) {
    char *page = calloc(1, PAGE_SIZE);
    if (page == NULL) {
      die("calloc");
    }
```
The check uses `>=`: valid page numbers are 0 to 99.
---
@build
## Read it from the file
```c
    // The last page in the file may be only partly full.
    uint32_t num_pages = pager->file_length / PAGE_SIZE;
    if (pager->file_length % PAGE_SIZE != 0) {
      num_pages += 1;
    }
    if (page_num < num_pages) {
      off_t offset = (off_t)page_num * PAGE_SIZE;
      if (lseek(pager->file_descriptor, offset, SEEK_SET) == -1) {
        die("lseek");
      }
      if (read(pager->file_descriptor, page, PAGE_SIZE) == -1) {
        die("read");
      }
    }
    pager->pages[page_num] = page;
  }
  return pager->pages[page_num];
}
```
A page beyond the end of the file stays as zeros. A short read at the last page is fine.
---
@concept
## Why calloc
`calloc` gives a page full of zeros. When we write a whole page back, its unused bytes are saved as zeros, not as leftover memory.
---
@build
## Write a page back
```c
void pager_flush(Pager *pager, uint32_t page_num, size_t size) {
  off_t offset = (off_t)page_num * PAGE_SIZE;
  if (lseek(pager->file_descriptor, offset, SEEK_SET) == -1) {
    die("lseek");
  }
  ssize_t written =
      write(pager->file_descriptor, pager->pages[page_num], size);
  if (written != (ssize_t)size) {
    die("write");
  }
}
```
`size` says how many bytes of the page to write.
---
@concept
## Rows from the file length
We do not store the number of rows. Full pages are written whole, and the last page only up to its last row. So the length of the file tells us the count.
```diagram
30 rows
page 0: 13 rows, 4096 bytes
page 1: 13 rows, 4096 bytes
page 2: 4 rows, 1172 bytes
file: 9364 bytes
```
---
@build
## Open the database
`db_open` replaces `new_table`:
```c
Table *db_open(const char *filename) {
  Table *table = malloc(sizeof(Table));
  if (table == NULL) {
    die("malloc");
  }
  pager_open(&table->pager, filename);
  uint32_t full_pages = table->pager.file_length / PAGE_SIZE;
  uint32_t leftover = table->pager.file_length % PAGE_SIZE;
  table->num_rows = full_pages * ROWS_PER_PAGE + leftover / ROW_SIZE;
  return table;
}
```
---
@build
## Close the database
`db_close` replaces `free_table`:
```c
void db_close(Table *table) {
  Pager *pager = &table->pager;
  uint32_t full_pages = table->num_rows / ROWS_PER_PAGE;
  uint32_t extra_rows = table->num_rows % ROWS_PER_PAGE;

  for (uint32_t i = 0; i < full_pages; i++) {
    if (pager->pages[i] != NULL) {
      pager_flush(pager, i, PAGE_SIZE);
    }
  }
  // The last page may hold only a few rows.
  if (extra_rows > 0 && pager->pages[full_pages] != NULL) {
    pager_flush(pager, full_pages, extra_rows * ROW_SIZE);
  }
```
Only pages in memory are written. The others are already in the file.
---
@build
## Release everything
```c
  if (close(pager->file_descriptor) == -1) {
    die("close");
  }
  for (uint32_t i = 0; i < TABLE_MAX_PAGES; i++) {
    free(pager->pages[i]);
  }
  free(table);
}
```
---
@build
## Rows through the pager
`row_slot` now asks the pager for the page:
```c
char *row_slot(Table *table, uint32_t row_num) {
  uint32_t page_num = row_num / ROWS_PER_PAGE;
  char *page = get_page(&table->pager, page_num);
  uint32_t row_offset = row_num % ROWS_PER_PAGE;
  return page + row_offset * ROW_SIZE;
}
```
---
@build
## A file name argument
```c
int main(int argc, char *argv[]) {
  if (argc < 2) {
    printf("Must supply a database filename.\n");
    return EXIT_FAILURE;
  }
  Table *table = db_open(argv[1]);
```
`argv` holds the words on the command line. `argv[0]` is the program's name, and `argc` counts the words. At the end of `main`, call `db_close(table);` instead of `free_table`.
---
@build
## Run it twice
```console
$ cc -Wall -Wextra -o db db.c
$ ./db test.db
db > insert 1 alice alice@example.com
Executed.
db > .exit
$ ./db test.db
db > select
(1, alice, alice@example.com)
Executed.
db > .exit
```
---
@concept
## When data reaches the file
Pages are written only in `db_close`, which runs after `.exit` or Ctrl-D. If the program is killed before that, the changes since it started are lost.
---
@quiz
## You insert 14 rows and exit. How long is the file?
- [ ] 4096 bytes
- [x] 4389 bytes
- [ ] 8192 bytes
> One full page of 4096 bytes, plus one row of 293 bytes.
---
@quiz
## What does `lseek(fd, 0, SEEK_END)` give us in pager_open?
- [ ] The number of rows
- [x] The length of the file in bytes
- [ ] The number of pages
> It moves to the end and returns that position.
---
@quiz
## The program crashes after a few inserts, before `.exit`. What is in the file?
- [x] Only what was there when the program started
- [ ] All the rows, including the new ones
- [ ] An empty file
> New rows stay in memory until `db_close` writes them.
