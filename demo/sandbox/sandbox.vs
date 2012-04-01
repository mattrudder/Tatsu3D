attribute vec3 position;

uniform mat4 matModelView;
uniform mat4 matProj;

void main(void) {
    gl_Position = matProj * matModelView * vec4(position, 1.0);
}