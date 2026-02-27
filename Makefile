CC=gcc
CFLAGS=-Wall -Wextra -g

all: mini-shell

mini-shell: main.o shell.o
	$(CC) $(CFLAGS) main.o shell.o -o mini-shell

main.o: main.c shell.h
	$(CC) $(CFLAGS) -c main.c

shell.o: shell.c shell.h
	$(CC) $(CFLAGS) -c shell.c

clean:
	rm -f *.o mini-shell