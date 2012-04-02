#ifdef GL_ES
precision highp float;
#endif

uniform float alpha;
uniform vec3 color; 

void main(void) {
    gl_FragColor = vec4(color, 1.0);
}	