//  main.cpp
//  OpenGL_Shader_Example_step1
//

#if defined (__APPLE__)
#define GLFW_INCLUDE_GLCOREARB
#else
#define GLEW_STATIC
#include <GL/glew.h>
#endif

#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <string>
#include <cstdio>
#include <vector>

#include "Shader.hpp"
#include "Camera.hpp"
#include "Model3D.hpp"

//variabile GLOBALE
int glWindowWidth = 800;
int glWindowHeight = 600;
int retina_width, retina_height;

float deltaTime = 0.0f;
float lastFrame = 0.0f;

// 1=solid, 2=wireframe, 3=poligonal (solid+overlay), 4=smooth+lumini+umbre
int renderMode = 1;

GLFWwindow* glWindow = NULL;

bool pressedKeys[1024];


glm::vec3 modelPosition = glm::vec3(0.0f);
float modelScale = 1.0f;
glm::vec3 modelRotation = glm::vec3(0.0f, 180.0f, 0.0f); // grade
float modelRotStep = 5.0f;

glm::mat4 model;


gps::Camera myCamera(
    glm::vec3(0.0f, 5.0f, 15.0f),   // position
    glm::vec3(0.0f, 5.0f, -10.0f),  // target
    glm::vec3(0.0f, 1.0f, 0.0f)     // up
);


gps::Model3D myModel;
gps::Shader  myCustomShader;

gps::Shader depthShader;
GLuint depthMapFBO = 0;
GLuint depthMap = 0;
const unsigned int SHADOW_WIDTH = 2048;
const unsigned int SHADOW_HEIGHT = 2048;
glm::mat4 lightSpaceMatrix;

// prima sursa de lumina 
glm::vec3 lightPos = glm::vec3(60.0f, 60.0f, 20.0f);
glm::vec3 lightColor = glm::vec3(1.0f, 1.0f, 0.95f);

// a doua sursa de lumina
glm::vec3 lightPos2 = glm::vec3(-40.0f, 20.0f, -20.0f);
glm::vec3 lightColor2 = glm::vec3(1.0f, 0.8f, 0.6f);

// prezentarea camerei
struct CameraKeyframe {
    glm::vec3 position;
    glm::vec3 target;
    float time;
};

std::vector<CameraKeyframe> cameraPath = {
    { glm::vec3(0.0f, 25.0f, 120.0f), glm::vec3(0.0f),  0.0f },
    { glm::vec3(0.0f, 25.0f,-120.0f), glm::vec3(0.0f), 10.0f },
    { glm::vec3(0.0f, 25.0f, 120.0f), glm::vec3(0.0f), 20.0f }
};

bool presentationMode = false;
float presentationTime = 0.0f;
glm::mat4 presentationView = glm::mat4(1.0f);
glm::vec3 presentationCameraPos = glm::vec3(0.0f);

//  EFFECTS (FOG & WIND) 
bool fogEnabled = false;     // F
bool windEnabled = false;    // R

const float kFogDensity = 0.00005f;
const float kWindStrength = 1.0f;

void renderScene();
void renderSceneDepth(gps::Shader& shader);

bool initOpenGLWindow();
void cleanup();
void processMovement(float dt);

void windowResizeCallback(GLFWwindow* window, int width, int height) {
    fprintf(stdout, "window resized to width: %d , and height: %d\n", width, height);
    glWindowWidth = width;
    glWindowHeight = height;

    glfwGetFramebufferSize(window, &retina_width, &retina_height);
    glViewport(0, 0, retina_width, retina_height);
}

void startPresentation() {
    if (cameraPath.empty()) return;

    presentationMode = true;
    presentationTime = 0.0f;

    myCamera = gps::Camera(
        cameraPath[0].position,
        cameraPath[0].target,
        glm::vec3(0.0f, 1.0f, 0.0f)
    );

    presentationCameraPos = cameraPath[0].position;
    presentationView = glm::lookAt(
        cameraPath[0].position,
        cameraPath[0].target,
        glm::vec3(0.0f, 1.0f, 0.0f)
    );
}

void updatePresentationCamera(float dt) {
    if (!presentationMode || cameraPath.size() < 2) return;

    presentationTime += dt;
    float endTime = cameraPath.back().time;

    if (presentationTime >= endTime) {
        presentationMode = false;
        const CameraKeyframe& last = cameraPath.back();

        myCamera = gps::Camera(last.position, last.target, glm::vec3(0, 1, 0));
        presentationCameraPos = last.position;
        presentationView = glm::lookAt(last.position, last.target, glm::vec3(0, 1, 0));
        return;
    }

    CameraKeyframe k0 = cameraPath[0];
    CameraKeyframe k1 = cameraPath[1];

    for (size_t i = 0; i < cameraPath.size() - 1; ++i) {
        if (presentationTime >= cameraPath[i].time && presentationTime <= cameraPath[i + 1].time) {
            k0 = cameraPath[i];
            k1 = cameraPath[i + 1];
            break;
        }
    }

    float seg = (k1.time - k0.time);
    float localT;

    if (seg > 0.0f) {
        localT = (presentationTime - k0.time) / seg;
    }
    else {
        localT = 0.0f;
    }


    glm::vec3 pos = glm::mix(k0.position, k1.position, localT);
    glm::vec3 tgt = glm::mix(k0.target, k1.target, localT);

    presentationCameraPos = pos;
    presentationView = glm::lookAt(pos, tgt, glm::vec3(0, 1, 0));
}

void keyboardCallback(GLFWwindow* window, int key, int scancode, int action, int mode) {

    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS) {
        glfwSetWindowShouldClose(window, GL_TRUE);
        return;
    }

    if (key < 0 || key >= 1024) return;

    if (action == GLFW_PRESS) {
        pressedKeys[key] = true;

        // --- Render modes 1-4 ---
        if (key == GLFW_KEY_1) { glPolygonMode(GL_FRONT_AND_BACK, GL_FILL); renderMode = 1; }
        if (key == GLFW_KEY_2) { glPolygonMode(GL_FRONT_AND_BACK, GL_LINE); renderMode = 2; }
        if (key == GLFW_KEY_3) { glPolygonMode(GL_FRONT_AND_BACK, GL_FILL); renderMode = 3; }
        if (key == GLFW_KEY_4) { glPolygonMode(GL_FRONT_AND_BACK, GL_FILL); renderMode = 4; }

        // --- Presentation ---
        if (key == GLFW_KEY_P) startPresentation();

        // --- Fog / Wind ---
        if (key == GLFW_KEY_F) { fogEnabled = !fogEnabled; printf("Fog: %s\n", fogEnabled ? "ON" : "OFF"); }
        if (key == GLFW_KEY_R) { windEnabled = !windEnabled; printf("Wind: %s\n", windEnabled ? "ON" : "OFF"); }

        // --- Model translation (IJKLUO) ---
        if (key == GLFW_KEY_I) modelPosition.z -= 2.0f;
        if (key == GLFW_KEY_K) modelPosition.z += 2.0f;
        if (key == GLFW_KEY_J) modelPosition.x -= 2.0f;
        if (key == GLFW_KEY_L) modelPosition.x += 2.0f;
        if (key == GLFW_KEY_U) modelPosition.y += 2.0f;
        if (key == GLFW_KEY_O) modelPosition.y -= 2.0f;

        // --- Model scale (Z/X) ---
        if (key == GLFW_KEY_Z) modelScale *= 1.05f;
        if (key == GLFW_KEY_X) modelScale *= 0.95f;

        // --- Model rotation (T/G = X, Y/H = Y, B/N = Z) ---
        if (key == GLFW_KEY_T) modelRotation.x += modelRotStep;
        if (key == GLFW_KEY_G) modelRotation.x -= modelRotStep;
        if (key == GLFW_KEY_Y) modelRotation.y += modelRotStep;
        if (key == GLFW_KEY_H) modelRotation.y -= modelRotStep;
        if (key == GLFW_KEY_B) modelRotation.z += modelRotStep;
        if (key == GLFW_KEY_N) modelRotation.z -= modelRotStep;
    }
    else if (action == GLFW_RELEASE) {
        pressedKeys[key] = false;
    }
}

void mouseCallback(GLFWwindow* window, double xpos, double ypos) {
    // fara mouse
}

// Input
void processMovement(float dt) {
    if (presentationMode) return;

    float cameraSpeed = 50.0f * dt;
    float rotationSpeed = 50.0f * dt;

    // rotire camera (yaw)
    if (pressedKeys[GLFW_KEY_Q]) myCamera.rotate(0.0f, rotationSpeed);
    if (pressedKeys[GLFW_KEY_E]) myCamera.rotate(0.0f, -rotationSpeed);

    // WASD move
    if (pressedKeys[GLFW_KEY_W]) myCamera.move(gps::MOVE_FORWARD, cameraSpeed);
    if (pressedKeys[GLFW_KEY_S]) myCamera.move(gps::MOVE_BACKWARD, cameraSpeed);
    if (pressedKeys[GLFW_KEY_A]) myCamera.move(gps::MOVE_LEFT, cameraSpeed);
    if (pressedKeys[GLFW_KEY_D]) myCamera.move(gps::MOVE_RIGHT, cameraSpeed);

    // up/down
    if (pressedKeys[GLFW_KEY_SPACE]) myCamera.move(gps::MOVE_UP, cameraSpeed);
    if (pressedKeys[GLFW_KEY_LEFT_CONTROL]) myCamera.move(gps::MOVE_DOWN, cameraSpeed);
}

bool initOpenGLWindow() {

    if (!glfwInit()) {
        fprintf(stderr, "ERROR: could not start GLFW3\n");
        return false;
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 1);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    glfwWindowHint(GLFW_SCALE_TO_MONITOR, GLFW_TRUE);
    glfwWindowHint(GLFW_SAMPLES, 4);

    glWindow = glfwCreateWindow(glWindowWidth, glWindowHeight, "OpenGL Texturing", NULL, NULL);
    if (!glWindow) {
        fprintf(stderr, "ERROR: could not open window with GLFW3\n");
        glfwTerminate();
        return false;
    }

    glfwSetWindowSizeCallback(glWindow, windowResizeCallback);
    glfwSetKeyCallback(glWindow, keyboardCallback);
    glfwSetCursorPosCallback(glWindow, mouseCallback);

    glfwMakeContextCurrent(glWindow);
    glfwSwapInterval(1);

#if not defined (__APPLE__)
    glewExperimental = GL_TRUE;
    glewInit();
#endif

    const GLubyte* renderer = glGetString(GL_RENDERER);
    const GLubyte* version = glGetString(GL_VERSION);
    printf("Renderer: %s\n", renderer);
    printf("OpenGL version supported %s\n", version);

    glfwGetFramebufferSize(glWindow, &retina_width, &retina_height);
    return true;
}

// helpere pentru umbre
glm::mat4 computeLightSpaceMatrix() {

    float near_plane = 1.0f;
    float far_plane = 200.0f;

    glm::mat4 lightProjection = glm::ortho(-100.0f, 100.0f,
        -100.0f, 100.0f,
        near_plane, far_plane);

    glm::mat4 lightView = glm::lookAt(
        lightPos,
        glm::vec3(0.0f),
        glm::vec3(0.0f, 1.0f, 0.0f)
    );

    return lightProjection * lightView;
}

// Depth Pass
void renderSceneDepth(gps::Shader& shader) {
    shader.useShaderProgram();

    glm::mat4 modelDepth = glm::mat4(1.0f);
    modelDepth = glm::translate(modelDepth, modelPosition);
    modelDepth = glm::rotate(modelDepth, glm::radians(modelRotation.x), glm::vec3(1, 0, 0));
    modelDepth = glm::rotate(modelDepth, glm::radians(modelRotation.y), glm::vec3(0, 1, 0));
    modelDepth = glm::rotate(modelDepth, glm::radians(modelRotation.z), glm::vec3(0, 0, 1));
    modelDepth = glm::scale(modelDepth, glm::vec3(modelScale));

    GLint modelLocDepth = glGetUniformLocation(shader.shaderProgram, "model");
    glUniformMatrix4fv(modelLocDepth, 1, GL_FALSE, glm::value_ptr(modelDepth));

    myModel.Draw(shader);
}

void renderScene() {

    glViewport(0, 0, retina_width, retina_height);
    glClearColor(0.5f, 0.75f, 1.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    myCustomShader.useShaderProgram();

    // time uniform
    float t = (float)glfwGetTime();
    GLint timeLoc = glGetUniformLocation(myCustomShader.shaderProgram, "time");
    glUniform1f(timeLoc, t);

    glm::mat4 view;
    glm::vec3 viewPos;
    if (presentationMode) {
        view = presentationView;
        viewPos = presentationCameraPos;
    }
    else {
        view = myCamera.getViewMatrix();
        viewPos = myCamera.getCameraPosition();
    }
    GLint viewLoc = glGetUniformLocation(myCustomShader.shaderProgram, "view");
    glUniformMatrix4fv(viewLoc, 1, GL_FALSE, glm::value_ptr(view));

    // model matrix
    model = glm::mat4(1.0f);
    model = glm::translate(model, modelPosition);
    model = glm::rotate(model, glm::radians(modelRotation.x), glm::vec3(1, 0, 0));
    model = glm::rotate(model, glm::radians(modelRotation.y), glm::vec3(0, 1, 0));
    model = glm::rotate(model, glm::radians(modelRotation.z), glm::vec3(0, 0, 1));
    model = glm::scale(model, glm::vec3(modelScale));

    GLint modelLoc = glGetUniformLocation(myCustomShader.shaderProgram, "model");
    glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));

    // le trm ca unifrms in shader
    glUniform3fv(glGetUniformLocation(myCustomShader.shaderProgram, "lightPos"), 1, glm::value_ptr(lightPos));
    glUniform3fv(glGetUniformLocation(myCustomShader.shaderProgram, "lightColor"), 1, glm::value_ptr(lightColor));
    glUniform3fv(glGetUniformLocation(myCustomShader.shaderProgram, "lightPos2"), 1, glm::value_ptr(lightPos2));
    glUniform3fv(glGetUniformLocation(myCustomShader.shaderProgram, "lightColor2"), 1, glm::value_ptr(lightColor2));
    glUniform3fv(glGetUniformLocation(myCustomShader.shaderProgram, "viewPos"), 1, glm::value_ptr(viewPos));
    
    // matricea luminii pentru umbre
    glUniformMatrix4fv(glGetUniformLocation(myCustomShader.shaderProgram, "lightSpaceMatrix"), 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));

    // shadow map texture
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, depthMap);
    glUniform1i(glGetUniformLocation(myCustomShader.shaderProgram, "shadowMap"), 1);

    // fog (if-uri scrise pe un rand (variabile ? a : b) mai rapid decat standard
    glUniform1i(glGetUniformLocation(myCustomShader.shaderProgram, "enableFog"), fogEnabled ? 1 : 0);  
    glUniform3f(glGetUniformLocation(myCustomShader.shaderProgram, "fogColor"), 0.7f, 0.8f, 0.9f);
    glUniform1f(glGetUniformLocation(myCustomShader.shaderProgram, "fogDensity"), kFogDensity);

    // wind
    glUniform1i(glGetUniformLocation(myCustomShader.shaderProgram, "enableWind"), windEnabled ? 1 : 0);
    glUniform1f(glGetUniformLocation(myCustomShader.shaderProgram, "windStrength"), kWindStrength);

    GLint modeLoc = glGetUniformLocation(myCustomShader.shaderProgram, "renderMode");

    // modurile de randare
    if (renderMode == 3) {
        // PASS 1: solid 
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
        glUniform1i(modeLoc, 3);
        myModel.Draw(myCustomShader);

        // PASS 2: overlay wireframe 
        glEnable(GL_POLYGON_OFFSET_LINE);
        glPolygonOffset(-1.0f, -1.0f);

        glLineWidth(2.5f);
        glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
        glUniform1i(modeLoc, 5);
        myModel.Draw(myCustomShader);

       
        glLineWidth(1.0f);
        glDisable(GL_POLYGON_OFFSET_LINE);
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
    }
    else {
        glUniform1i(modeLoc, renderMode);
        myModel.Draw(myCustomShader);
    }
}


void cleanup() {

    if (depthMapFBO) glDeleteFramebuffers(1, &depthMapFBO);
    if (depthMap) glDeleteTextures(1, &depthMap);

    glfwDestroyWindow(glWindow);
    glfwTerminate();
}


int main(int argc, const char* argv[]) {

    if (!initOpenGLWindow()) {
        glfwTerminate();
        return 1;
    }

    for (int i = 0; i < 1024; i++) pressedKeys[i] = false;

    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LESS);

    //glEnable(GL_CULL_FACE);
    //glCullFace(GL_BACK);
    //glFrontFace(GL_CCW);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // main shader
    myCustomShader.loadShader("shaders/shaderStart.vert", "shaders/shaderStart.frag");
    myCustomShader.useShaderProgram();

    // depth shader (shadow map)
    depthShader.loadShader("shaders/depth.vert", "shaders/depth.frag");

    // projection uniform (main shader)
    glm::mat4 projection = glm::perspective(
        glm::radians(55.0f),
        (float)retina_width / (float)retina_height,
        0.1f,
        1000.0f
    );

    GLint projLoc = glGetUniformLocation(myCustomShader.shaderProgram, "projection");
    glUniformMatrix4fv(projLoc, 1, GL_FALSE, glm::value_ptr(projection));

    // load model
    myModel.LoadModel("objects/alta_scena.obj", "textures/");

    // create shadow map FBO + texture
    glGenFramebuffers(1, &depthMapFBO);

    glGenTextures(1, &depthMap);
    glBindTexture(GL_TEXTURE_2D, depthMap);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT,
        SHADOW_WIDTH, SHADOW_HEIGHT, 0,
        GL_DEPTH_COMPONENT, GL_FLOAT, NULL);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);

    float borderColor[] = { 1.0f, 1.0f, 1.0f, 1.0f };
    glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);

    glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMap, 0);
    glDrawBuffer(GL_NONE);
    glReadBuffer(GL_NONE);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);

    // loop
    while (!glfwWindowShouldClose(glWindow)) {

        float currentFrame = (float)glfwGetTime();
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        updatePresentationCamera(deltaTime);
        processMovement(deltaTime);

        //Primu pass la shadow mapping

        lightSpaceMatrix = computeLightSpaceMatrix();

        // depth pass
        glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
        glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
        glClear(GL_DEPTH_BUFFER_BIT);

        depthShader.useShaderProgram();
        glUniformMatrix4fv(
            glGetUniformLocation(depthShader.shaderProgram, "lightSpaceMatrix"),
            1, GL_FALSE, glm::value_ptr(lightSpaceMatrix)
        );

        renderSceneDepth(depthShader);
        glBindFramebuffer(GL_FRAMEBUFFER, 0);

        // render pass
        renderScene();

        glfwPollEvents();
        glfwSwapBuffers(glWindow);
    }

    cleanup();
    return 0;
}
