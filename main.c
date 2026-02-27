#include <stdio.h>
#include <signal.h>
#include "shell.h"

int main() {
    signal(SIGINT, handle_signal);
    start_shell();
    return 0;
}