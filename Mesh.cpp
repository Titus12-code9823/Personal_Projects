#include "Mesh.hpp"
namespace gps {

	/* Mesh Constructor */
	Mesh::Mesh(std::vector<Vertex> vertices, std::vector<GLuint> indices, std::vector<Texture> textures) {

		this->vertices = vertices;
		this->indices = indices;
		this->textures = textures;

		this->setupMesh();
	}

	Buffers Mesh::getBuffers() {
	    return this->buffers;
	}

	void Mesh::Draw(gps::Shader shader)
	{
		// num?r?m texturile difuze / speculare
		unsigned int diffuseNr = 1;
		unsigned int specularNr = 1;

		// presupunem c? NU este ap?
		int isWater = 0;

		// VAO-ul este în structura buffers
		glBindVertexArray(this->buffers.VAO);

		for (unsigned int i = 0; i < textures.size(); i++) {

			glActiveTexture(GL_TEXTURE0 + i);

			std::string number;
			std::string name = textures[i].type;   // ex: "texture_diffuse" sau "texture_specular"

			if (name == "texture_diffuse") {
				number = std::to_string(diffuseNr++);

				// detect?m dac? textura este water.jpg
				if (textures[i].path.find("water.jpg") != std::string::npos) {
					isWater = 1;
				}
			}
			else if (name == "texture_specular") {
				number = std::to_string(specularNr++);
			}

			// set?m samplerul (ex: texture_diffuse1, texture_specular1)
			std::string uniformName = name + number;
			glUniform1i(glGetUniformLocation(shader.shaderProgram, uniformName.c_str()), i);

			glBindTexture(GL_TEXTURE_2D, textures[i].id);
		}

		// Trimitem în shader dac? acest mesh este ap? sau nu
		glUniform1i(glGetUniformLocation(shader.shaderProgram, "isWaterMaterial"), isWater);

		// Desen?m mesh-ul
		glDrawElements(GL_TRIANGLES, static_cast<GLsizei>(indices.size()), GL_UNSIGNED_INT, 0);

		glBindVertexArray(0);
		glActiveTexture(GL_TEXTURE0);
	}


	// Initializes all the buffer objects/arrays
	void Mesh::setupMesh() {

		// Create buffers/arrays
		glGenVertexArrays(1, &this->buffers.VAO);
		glGenBuffers(1, &this->buffers.VBO);
		glGenBuffers(1, &this->buffers.EBO);

		glBindVertexArray(this->buffers.VAO);
		// Load data into vertex buffers
		glBindBuffer(GL_ARRAY_BUFFER, this->buffers.VBO);
		glBufferData(GL_ARRAY_BUFFER, this->vertices.size() * sizeof(Vertex), &this->vertices[0], GL_STATIC_DRAW);

		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, this->buffers.EBO);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER, this->indices.size() * sizeof(GLuint), &this->indices[0], GL_STATIC_DRAW);

		// Set the vertex attribute pointers
		// Vertex Positions
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (GLvoid*)0);
		// Vertex Normals
		glEnableVertexAttribArray(1);
		glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (GLvoid*)offsetof(Vertex, Normal));
		// Vertex Texture Coords
		glEnableVertexAttribArray(2);
		glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (GLvoid*)offsetof(Vertex, TexCoords));

		glBindVertexArray(0);
	}
}
