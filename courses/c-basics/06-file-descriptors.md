# Files and file descriptors

@concept
## A file is a number
The POSIX function `open` returns an `int` called a **file descriptor**: a small number the operating system uses to name an open file. You pass it to `read`, `write`, `lseek` and `close`.

`open` comes from `<fcntl.h>`. The other four come from `<unistd.h>`.
---
@concept
## open
```c
int fd = open("test.db", O_RDWR | O_CREAT, 0644);
```
`O_RDWR` opens the file for reading and writing. `O_CREAT` creates it if it is missing. The flags are bits, combined with `|`.

`0644` sets the permissions of a new file. The leading `0` makes it an octal number. Here the owner can read and write, and everyone else can read.
---
@concept
## Failure is -1 plus errno
These calls return -1 when they fail, and they store the reason in the global variable `errno`.

`perror("open")` prints your text plus that reason, for example `open: Permission denied`. Check the result of every call.
---
@concept
## Each open file has a position
`read` and `write` start at the file's current position and move it forward.

`lseek(fd, offset, SEEK_SET)` jumps to `offset` bytes from the start. `lseek(fd, 0, SEEK_END)` jumps to the end and returns that position, which is the file's length. The result has type `off_t`, a signed file offset.
---
@concept
## read
```c
ssize_t n = read(fd, buffer, 4096);
```
`read` copies up to 4096 bytes into `buffer` and returns how many it read. Near the end of the file it returns fewer. At the end it returns 0, and on error -1.

A short read is normal, not an error.
---
@concept
## write
```c
ssize_t n = write(fd, buffer, 4096);
```
`write` returns how many bytes it wrote, or -1. It can write fewer than you asked, for example when the disk is full. So compare the result with the size you asked for.
---
@concept
## close
`close(fd)` releases the descriptor. It can fail too, and sometimes it reports a write error late. Check it like the others.
---
@quiz
## A file is 10 bytes long. What does `lseek(fd, 0, SEEK_END)` return?
- [ ] 0
- [ ] 9
- [x] 10
> It returns the new position, which is the end of the file: its length.
---
@quiz
## A file is 100 bytes long. You are at the start and call `read(fd, buf, 4096)`. What does it return?
- [ ] -1, because you asked for too much
- [x] 100
- [ ] 4096
> `read` returns what it could read. Asking for more than the file holds is fine.
---
@quiz
## `open("missing.db", O_RDWR)` runs on a file that does not exist. What happens?
- [ ] The file is created
- [x] It returns -1 and sets `errno`
- [ ] The program stops
> Without `O_CREAT`, `open` does not create the file. It fails, and you check for -1.
