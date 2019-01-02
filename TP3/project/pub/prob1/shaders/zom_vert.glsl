attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform float uHeightScale;
uniform float uTexScale;
uniform float uTimeFactor;

varying vec3 vEye;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;


varying vec4 vFinalColor;

void main() {

	vTextureCoord = (aTextureCoord + vec2(0, -uTimeFactor*0.000001)) * uTexScale;

	vec4 heightMapData = heightMapData();
	vec3 normal = heightMapData.xyz;
	float height = heightMapData.w;

	vec3 offset = aVertexNormal*height*uHeightScale;

    // Transformed Vertex position
    vec4 vertex = uMVMatrix * vec4(aVertexPosition+offset, 1.0);

    // Transformed normal position
	vec3 N = normalize(vec3(uNMatrix * vec4(normal, 1.0)));

    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);
    vEye = E;
    
    vFinalColor = lighting(vertex, E, N);
	gl_Position = uPMatrix * vertex;
}