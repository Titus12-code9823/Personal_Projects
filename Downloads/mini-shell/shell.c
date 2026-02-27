#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <fcntl.h>

#include "shell.h"

void handle_signal(int sig) {
    printf("\nmini-shell> ");
    fflush(stdout);
}

void start_shell() {
    char input[MAX_INPUT];

    while (1) {
        printf("mini-shell> ");
        fflush(stdout);

        if (fgets(input, MAX_INPUT, stdin) == NULL)
            break;

        input[strcspn(input, "\n")] = 0;

        if (strlen(input) == 0)
            continue;

        execute_command(input);
    }
}

void parse_args(char *input, char **args) {
    int i = 0;
    char *token = strtok(input, " ");
    while (token != NULL && i < MAX_ARGS - 1) {
        args[i++] = token;
        token = strtok(NULL, " ");
    }
    args[i] = NULL;
}

void execute_simple(char **args, int background) {
    pid_t pid = fork();

    if (pid == 0) {
        execvp(args[0], args);
        perror("exec failed");
        exit(EXIT_FAILURE);
    } else if (pid > 0) {
        if (!background)
            waitpid(pid, NULL, 0);
    } else {
        perror("fork failed");
    }
}

void execute_pipe(char *left, char *right) {
    int fd[2];
    pipe(fd);

    pid_t pid1 = fork();
    if (pid1 == 0) {
        dup2(fd[1], STDOUT_FILENO);
        close(fd[0]);
        close(fd[1]);

        char *args[MAX_ARGS];
        parse_args(left, args);
        execvp(args[0], args);
        perror("exec failed");
        exit(1);
    }

    pid_t pid2 = fork();
    if (pid2 == 0) {
        dup2(fd[0], STDIN_FILENO);
        close(fd[1]);
        close(fd[0]);

        char *args[MAX_ARGS];
        parse_args(right, args);
        execvp(args[0], args);
        perror("exec failed");
        exit(1);
    }

    close(fd[0]);
    close(fd[1]);

    waitpid(pid1, NULL, 0);
    waitpid(pid2, NULL, 0);
}

void execute_redirect(char *input) {
    char *args[MAX_ARGS];
    char *file;
    int fd;

    if (strstr(input, ">")) {
        file = strtok(strstr(input, ">") + 1, " ");
        *strstr(input, ">") = '\0';

        parse_args(input, args);

        pid_t pid = fork();
        if (pid == 0) {
            fd = open(file, O_CREAT | O_WRONLY | O_TRUNC, 0644);
            dup2(fd, STDOUT_FILENO);
            close(fd);
            execvp(args[0], args);
            exit(1);
        }
        wait(NULL);
    }
    else if (strstr(input, "<")) {
        file = strtok(strstr(input, "<") + 1, " ");
        *strstr(input, "<") = '\0';

        parse_args(input, args);

        pid_t pid = fork();
        if (pid == 0) {
            fd = open(file, O_RDONLY);
            dup2(fd, STDIN_FILENO);
            close(fd);
            execvp(args[0], args);
            exit(1);
        }
        wait(NULL);
    }
}

void execute_command(char *input) {

    if (strcmp(input, "exit") == 0)
        exit(0);

    if (strncmp(input, "cd ", 3) == 0) {
        if (chdir(input + 3) != 0)
            perror("cd failed");
        return;
    }

    if (strchr(input, '|')) {
        char *left = strtok(input, "|");
        char *right = strtok(NULL, "|");
        execute_pipe(left, right);
        return;
    }

    if (strchr(input, '>') || strchr(input, '<')) {
        execute_redirect(input);
        return;
    }

    int background = 0;
    if (input[strlen(input) - 1] == '&') {
        background = 1;
        input[strlen(input) - 1] = '\0';
    }

    char *args[MAX_ARGS];
    parse_args(input, args);

    execute_simple(args, background);
}