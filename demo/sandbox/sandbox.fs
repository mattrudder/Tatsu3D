#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D helloSampler;
uniform float alpha;
uniform vec3 color; 

varying vec2 uv;

void main(void) {
    gl_FragColor = texture2D(helloSampler, uv) * vec4(color, 1);

}	