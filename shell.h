#ifndef SHELL_H
#define SHELL_H

#define MAX_INPUT 1024
#define MAX_ARGS 64

void start_shell();
void execute_command(char *input);
void handle_signal(int sig);

#endif