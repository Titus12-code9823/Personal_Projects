#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <limits.h>

#define MAGIC "FwPU"
#define MIN_VERSION 56
#define MAX_VERSION 157
#define BUFFER_SIZE 4096

const int VALID_TYPES[] = {91, 14, 83, 52, 50, 39, 44};

typedef struct {
    char name[18];
    uint8_t type;
    uint32_t offset;
    uint32_t size;
} Section;

void print_variant() {
    printf("25150\n");
}

int is_valid_type(uint8_t type) {
    for (int i = 0; i < sizeof(VALID_TYPES) / sizeof(int); i++) {
        if (type == VALID_TYPES[i]) {
            return 1;
        }
    }
    return 0;
}

int read_header(int fd, Section **sections_out, int *version_out, int *nr_sections_out, off_t *file_size_out) {
    // Get file size
    off_t file_size = lseek(fd, 0, SEEK_END);
    if (file_size < 6) { // Minimum size: magic(4) + header_size(2)
        return -1;
    }
    *file_size_out = file_size;

    // Read header size from the last 2 bytes
    uint16_t header_size;
    if (lseek(fd, file_size - 2, SEEK_SET) == -1 ||
        read(fd, &header_size, 2) != 2) {
        return -2;
    }

    // Validate header size
    if (header_size > file_size - 2) {
        return -3;
    }

    // Read magic string (last 4 bytes before header_size)
    char magic[5] = {0};
    if (lseek(fd, file_size - 6, SEEK_SET) == -1 ||
        read(fd, magic, 4) != 4) {
        return -4;
    }

    if (strcmp(magic, "FwPU") != 0) {
        return -13; // Wrong magic
    }

    // Position at start of header
    off_t header_start = file_size - header_size - 6;
    if (lseek(fd, header_start, SEEK_SET) == -1) {
        return -5;
    }

    // Read version and number of sections
    uint8_t version, nr_sections;
    if (read(fd, &version, 1) != 1 ||
        read(fd, &nr_sections, 1) != 1) {
        return -6;
    }

    // Validate version
    if (version < 56 || version > 157) {
        return -5; // Wrong version
    }

    // Validate number of sections
    if (!(nr_sections == 2 || (nr_sections >= 4 && nr_sections <= 10))) {
        return -6; // Wrong section number
    }

    // Allocate memory for sections
    Section *sections = calloc(nr_sections, sizeof(Section));
    if (!sections) {
        return -7;
    }

    // Read each section
    for (int i = 0; i < nr_sections; i++) {
        // Read name (17 bytes + null terminator)
        if (read(fd, sections[i].name, 17) != 17) {
            free(sections);
            return -8;
        }
        sections[i].name[17] = '\0';

        // Read type, offset, and size
        if (read(fd, &sections[i].type, 1) != 1 ||
            read(fd, &sections[i].offset, 4) != 4 ||
            read(fd, &sections[i].size, 4) != 4) {
            free(sections);
            return -9;
        }

        // Validate section type
        if (!is_valid_type(sections[i].type)) {
            free(sections);
            return -10; // Wrong section types
        }

        // Validate offset and size
        if (sections[i].offset + sections[i].size > header_start) {
            free(sections);
            return -11;
        }
    }

    // Check for overlapping sections
    for (int i = 0; i < nr_sections; i++) {
        for (int j = i + 1; j < nr_sections; j++) {
            if ((sections[i].offset <= sections[j].offset && 
                 sections[i].offset + sections[i].size > sections[j].offset) ||
                (sections[j].offset <= sections[i].offset && 
                 sections[j].offset + sections[j].size > sections[i].offset)) {
                free(sections);
                return -12;
            }
        }
    }

    *sections_out = sections;
    *version_out = version;
    *nr_sections_out = nr_sections;
    return 0;
}
//parse
int parse_command(const char *filename) {
    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        printf("ERROR\ncannot open file\n");
        return 1;
    }

    Section *sections = NULL;
    int version = 0, nr_sections = 0;
    off_t file_size = 0;

    int result = read_header(fd, &sections, &version, &nr_sections, &file_size);
    
    if (result != 0) {
        switch (result) {
            case -13:
                printf("ERROR\nwrong magic\n");
                break;
            case -5:
                printf("ERROR\nwrong version\n");
                break;
            case -6:
                printf("ERROR\nwrong sect_nr\n");
                break;
            case -10:
                printf("ERROR\nwrong sect_types\n");
                break;
            default:
                printf("ERROR\nwrong file format\n");
        }
        if (sections) free(sections);
        close(fd);
        return 1;
    }

    printf("SUCCESS\nversion=%d\nnr_sections=%d\n", version, nr_sections);
    for (int i = 0; i < nr_sections; i++) {
        printf("section%d: %s %d %d %d\n",
               i + 1, 
               sections[i].name,
               sections[i].type,
               sections[i].offset,
               sections[i].size);
    }

    free(sections);
    close(fd);
    return 0;
}
//extract
int extract_command(const char *filename, int section_id, int line_number) {
    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        printf("ERROR\ncannot open file\n");
        return 1;
    }

    Section *sections = NULL;
    int version = 0, nr_sections = 0;
    off_t file_size = 0;

    if (read_header(fd, &sections, &version, &nr_sections, &file_size) != 0 ||
        section_id < 1 || section_id > nr_sections) {
        printf("ERROR\ninvalid section\n");
        if (sections) free(sections);
        close(fd);
        return 1;
    }

    Section s = sections[section_id - 1];
    uint8_t *buffer = malloc(s.size + 1);
    if (!buffer) {
        printf("ERROR\nmemory allocation failed\n");
        free(sections);
        close(fd);
        return 1;
    }

    if (lseek(fd, s.offset, SEEK_SET) == -1 ||
        read(fd, buffer, s.size) != s.size) {
        printf("ERROR\nread failed\n");
        free(buffer);
        free(sections);
        close(fd);
        return 1;
    }
    buffer[s.size] = '\0';

    // Numărăm liniile totale pentru validare
    int total_lines = 1;
    for (int i = 0; i < s.size; i++) {
        if (buffer[i] == '\n') {
            total_lines++;
        }
    }

    if (line_number > total_lines) {
        printf("ERROR\ninvalid line\n");
        free(buffer);
        free(sections);
        close(fd);
        return 1;
    }

    // Găsim și afișăm linia cerută
    int current_line = 1;
    int found = 0;

    for (int i = 0; i < s.size; i++) {
        if (current_line == line_number) {
            found = 1;
            printf("SUCCESS\n");
            while (i < s.size && buffer[i] != '\n') {
                putchar(buffer[i]);
                i++;
            }
            printf("\n");
            break;
        }
        if (buffer[i] == '\n') {
            current_line++;
        }
    }

    free(buffer);
    free(sections);
    close(fd);
    return !found;
}

void findall_command(const char *path, int *found_any) {
    DIR *dir = opendir(path);
    if (!dir) return;

    struct dirent *entry;
    char full_path[PATH_MAX];
    
    while ((entry = readdir(dir)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) 
            continue;

        snprintf(full_path, PATH_MAX, "%s/%s", path, entry->d_name);
        
        struct stat st;
        if (lstat(full_path, &st) == -1) 
            continue;

        if (S_ISREG(st.st_mode)) {
            int fd = open(full_path, O_RDONLY);
            if (fd != -1) {
                off_t file_size = lseek(fd, 0, SEEK_END);
                if (file_size >= 4) {
                    char magic[5] = {0};
                    lseek(fd, file_size - 4, SEEK_SET);
                    if (read(fd, magic, 4) == 4 && strncmp(magic, MAGIC, 4) == 0) {
                        Section *sections = NULL;
                        int version = 0, nr_sections = 0;
                        off_t dummy_size = 0;
                        
                        if (read_header(fd, &sections, &version, &nr_sections, &dummy_size) == 0) {
                            printf("%s\n", full_path);
                            *found_any = 1;
                            free(sections);
                        }
                    }
                }
                close(fd);
            }
        }
        
        if (S_ISDIR(st.st_mode)) {
            findall_command(full_path, found_any);
        }
    }
    
    closedir(dir);
}

int has_execute_permission(const char *path) {
    struct stat st;
    return stat(path, &st) == 0 && (st.st_mode & S_IXUSR);
}

void list_command(const char *path, int recursive, const char *suffix, int exec_flag, int *found_any) {
    DIR *dir = opendir(path);
    if (!dir) {
        printf("ERROR\ninvalid directory path\n");
        return;
    }

    struct dirent *entry;
    char full_path[PATH_MAX];

    while ((entry = readdir(dir)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
            continue;

        if (snprintf(full_path, PATH_MAX, "%s/%s", path, entry->d_name) >= PATH_MAX)
            continue;

        struct stat st;
        if (lstat(full_path, &st) == -1)
            continue;

        int match = 1;
        if (suffix) {
            size_t name_len = strlen(entry->d_name);
            size_t suff_len = strlen(suffix);
            if (name_len < suff_len || 
                strcmp(entry->d_name + name_len - suff_len, suffix) != 0) {
                match = 0;
            }
        }

        if (exec_flag && !has_execute_permission(full_path)) {
            match = 0;
        }

        if (match) {
            if (!*found_any) {
                printf("SUCCESS\n");
                *found_any = 1;
            }
            printf("%s\n", full_path);
        }

        if (recursive && S_ISDIR(st.st_mode)) {
            list_command(full_path, recursive, suffix, exec_flag, found_any);
        }
    }
    closedir(dir);
}

int main(int argc, char **argv) {
    if (argc < 2) {
        printf("ERROR\ninvalid command\n");
        return 1;
    }

    const char *path = NULL;
    const char *suffix = NULL;
    int parse_flag = 0, extract_flag = 0, findall_flag = 0, list_flag = 0;
    int section = -1, line = -1;
    int recursive = 0, exec_flag = 0;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "variant") == 0) {
            print_variant();
            return 0;
        } else if (strcmp(argv[i], "parse") == 0) {
            parse_flag = 1;
        } else if (strcmp(argv[i], "extract") == 0) {
            extract_flag = 1;
        } else if (strcmp(argv[i], "findall") == 0) {
            findall_flag = 1;
        } else if (strcmp(argv[i], "list") == 0) {
            list_flag = 1;
        } else if (strncmp(argv[i], "path=", 5) == 0) {
            path = argv[i] + 5;
        } else if (strncmp(argv[i], "section=", 8) == 0) {
            section = atoi(argv[i] + 8);
        } else if (strncmp(argv[i], "line=", 5) == 0) {
            line = atoi(argv[i] + 5);
        } else if (strncmp(argv[i], "name_ends_with=", 15) == 0) {
            suffix = argv[i] + 15;
        } else if (strcmp(argv[i], "recursive") == 0) {
            recursive = 1;
        } else if (strcmp(argv[i], "has_perm_execute") == 0) {
            exec_flag = 1;
        }
    }

    if (parse_flag) {
        if (!path) {
            printf("ERROR\nmissing file path\n");
            return 1;
        }
        return parse_command(path);
    }

    if (extract_flag) {
        if (!path || section == -1 || line == -1) {
            printf("ERROR\ninvalid section|line|file\n");
            return 1;
        }
        return extract_command(path, section, line);
    }

    if (findall_flag) {
        if (!path) {
            printf("ERROR\ninvalid directory path\n");
            return 1;
        }
        int found = 0;
        findall_command(path, &found);
        if (!found) printf("SUCCESS\n");
        return 0;
    }

    if (list_flag) {
        if (!path) {
            printf("ERROR\ninvalid directory path\n");
            return 1;
        }
        int found = 0;
        list_command(path, recursive, suffix, exec_flag, &found);
        if (!found) printf("SUCCESS\n");
        return 0;
    }

    printf("ERROR\ninvalid command\n");
    return 1;
}

