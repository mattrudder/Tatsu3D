attribute vec3 position;
attribute vec2 texcoord;

uniform mat4 matModelView;
uniform mat4 matProj;

varying vec2 uv;

void main(void) {
    gl_Position = matProj * matModelView * vec4(position, 1.0);
    uv = texcoord;
}