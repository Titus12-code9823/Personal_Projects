#include "Camera.hpp"

namespace gps {

    // poți schimba valorile astea dacă vrei alte unghiuri de start
    static float yaw = -90.0f; // privim pe -Z la început
    static float pitch = 0.0f;

    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp)
    {
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;

        // direcția inițială în față
        cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);

        // up și right inițiale
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp));
        cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, cameraFrontDirection));
    }

    glm::vec3 gps::Camera::getCameraPosition() const
    {
        return this->cameraPosition;   // sau cameraPos, depinde cum îl ai definit
    }

    glm::mat4 Camera::getViewMatrix()
    {
        // privim mereu în direcția front
        return glm::lookAt(cameraPosition,
            cameraPosition + cameraFrontDirection,
            cameraUpDirection);
    }

    void Camera::move(MOVE_DIRECTION direction, float speed)
    {
        switch (direction) {
        case MOVE_FORWARD:
            cameraPosition += cameraFrontDirection * speed;
            break;
        case MOVE_BACKWARD:
            cameraPosition -= cameraFrontDirection * speed;
            break;
        case MOVE_RIGHT:
            cameraPosition += cameraRightDirection * speed;
            break;
        case MOVE_LEFT:
            cameraPosition -= cameraRightDirection * speed;
            break;
        case MOVE_UP:
            cameraPosition += cameraUpDirection * speed;
            break;
        case MOVE_DOWN:
            cameraPosition -= cameraUpDirection * speed;
            break;
        default:
            break;
        }
    }

    void Camera::rotate(float pitchOffset, float yawOffset)
    {
        // actualizăm yaw/pitch globale
        pitch += pitchOffset;
        yaw += yawOffset;

        // clamp la pitch (să nu „rupem gâtul” camerei)
        if (pitch > 89.0f)  pitch = 89.0f;
        if (pitch < -89.0f) pitch = -89.0f;

        // recalculăm cameraFrontDirection din yaw/pitch (în radiani)
        glm::vec3 front;
        front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front.y = sin(glm::radians(pitch));
        front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        cameraFrontDirection = glm::normalize(front);

        // și up/right pe baza noii direcții
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f)));
        cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, cameraFrontDirection));
    }

}
