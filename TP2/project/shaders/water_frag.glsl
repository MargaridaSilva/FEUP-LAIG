#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vFinalColor;
varying vec3 vEye;


uniform sampler2D uWaterTexture;
varying vec3 normal;

vec3 exposure(vec3 color, float relative_fstop) {
   return color * pow(2.0,relative_fstop);
}

void main() {

	// vec3 nnormal = normalize(normal);
	// float fresnel = pow(1.0 - dot(nnormal, vEye), 2.0 );

	vec3 waterTextureColor = texture2D(uWaterTexture, vTextureCoord).xyz;

	// vec3 waterColor = (1.0 - fresnel) * waterTextureColor;

	// vec3 color = vFinalColor.xyz * waterColor;

	

	
	gl_FragColor = vec4(exposure(waterTextureColor, 0.7), 1);
}