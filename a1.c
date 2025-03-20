#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAGIC "FwPU"

//header structure
typedef struct {
    char sect_name[17];
    uint8_t sect_type;
    uint32_t sect_offset;
    uint32_t sect_size;
} SectionHeader;

// Structure for main header
typedef struct {
    uint8_t version;
    uint8_t no_of_sections;
    SectionHeader *sections;
    uint16_t header_size;
    char magic[5];
} SFHeader;

typedef struct {
    
}BodyStructure;
void read_header(FILE *file, SFHeader *header) {
    // Seek to end of file - HEADER_SIZE
    fseek(file, -2, SEEK_END);
    fread(&header->header_size, sizeof(header->header_size), 1, file);

    // Seek to the header start
    fseek(file, -(header->header_size), SEEK_END);

    // Read version, number of sections
    fread(&header->version, sizeof(header->version), 1, file);
    fread(&header->no_of_sections, sizeof(header->no_of_sections), 1, file);

    // Allocate memory for sections
    header->sections = malloc(header->no_of_sections * sizeof(SectionHeader));

    // Read each section
    for (int i = 0; i < header->no_of_sections; i++) {
        fread(header->sections[i].sect_name, 17, 1, file);
        fread(&header->sections[i].sect_type, sizeof(uint8_t), 1, file);
        fread(&header->sections[i].sect_offset, sizeof(uint32_t), 1, file);
        fread(&header->sections[i].sect_size, sizeof(uint32_t), 1, file);
    }
     fread()
    // Read MAGIC
    fread(header->magic, 4, 1, file);
    header->magic[4] = '\0'; // Null-terminate the string
}

void validate_header(SFHeader *header) {
    if (strcmp(header->magic, MAGIC) != 0) {
        printf("Invalid magic value!\n");
        exit(EXIT_FAILURE);
    }

void display_header_info(SFHeader *header) {
    printf("Version: %d\n", header->version);
    printf("Number of Sections: %d\n", header->no_of_sections);
    printf("Header Size: %d\n", header->header_size);
    printf("Magic: %s\n", header->magic);

    for (int i = 0; i < header->no_of_sections; i++) {
        printf("Section %d:\n", i + 1);
        printf("  Name: %s\n", header->sections[i].sect_name);
        printf("  Type: %d\n", header->sections[i].sect_type);
        printf("  Offset: %d\n", header->sections[i].sect_offset);
        printf("  Size: %d\n", header->sections[i].sect_size);
    }
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <filename>\n", argv[0]);
        return EXIT_FAILURE;
    }

    FILE *file = fopen(argv[1], "rb");
    if (!file) {
        perror("Error opening file");
        return EXIT_FAILURE;
    }

    SFHeader header;
    read_header(file, &header);
    validate_header(&header);
    display_header_info(&header);

    free(header.sections);
    fclose(file);
    return EXIT_SUCCESS;
}

