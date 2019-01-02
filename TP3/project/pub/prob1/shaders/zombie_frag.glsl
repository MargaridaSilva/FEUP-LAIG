#ifdef GL_ES
precision highp float;
#endif


varying vec3 vVertexPosition;
varying vec4 vFinalColor;

uniform float zombieLevel;

void main() {
	
	gl_FragColor = vFinalColor;
	
	gl_FragColor.rgb = gl_FragColor.rgb / zombieLevel;

	
}