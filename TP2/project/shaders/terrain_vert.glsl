// attribute vec3 aVertexPosition;
// attribute vec3 aVertexNormal;
// attribute vec2 aTextureCoord;

// uniform mat4 uMVMatrix;
// uniform mat4 uPMatrix;
// uniform mat4 uNMatrix;

// varying vec2 vTextureCoord;
// uniform sampler2D uSampler;

// uniform float normScale;

// void main() {
// 	vec3 offset=vec3(0.0,0.0,0.0);
	
// 	vTextureCoord = aTextureCoord;

// 	vec4 color = texture2D(uSampler, vTextureCoord);
// 	offset=aVertexNormal*color.r*normScale*0.01;

// 	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
// }


attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;
uniform float uCameraX;
uniform float uCameraY;
uniform float uCameraZ;
uniform sampler2D uSampler;
uniform float normScale;

struct lightProperties {
    vec4 position;                  // Default: (0, 0, 1, 0)
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 half_vector;
    vec3 spot_direction;            // Default: (0, 0, -1)
    float spot_exponent;            // Default: 0 (possible values [0, 128]
    float spot_cutoff;              // Default: 180 (possible values [0, 90] or 180)
    float constant_attenuation;     // Default: 1 (value must be >= 0)
    float linear_attenuation;       // Default: 0 (value must be >= 0)
    float quadratic_attenuation;    // Default: 0 (value must be >= 0)
    bool enabled;                   // Deafult: false
};

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform bool uLightEnabled;
uniform bool uLightModelTwoSided;

#define NUMBER_OF_LIGHTS 8

uniform vec4 uGlobalAmbient;

uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform materialProperties uFrontMaterial;
uniform materialProperties uBackMaterial;

varying vec4 vFinalColor;

vec4 lighting(vec4 vertex, vec3 E, vec3 N) {

    vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

    for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
        if (uLight[i].enabled) {

            float att = 1.0;
            float spot_effect = 1.0;
            vec3 L = vec3(0.0);

            if (uLight[i].position.w == 1.0) {
                L = (uLight[i].position - vertex).xyz;
                float dist = length(L);
                L = normalize(L);

                if (uLight[i].spot_cutoff != 180.0) {
                    vec3 sd = normalize(vec3(uLight[i].spot_direction));
                    float cos_cur_angle = dot(sd, -L);
                    float cos_inner_cone_angle = cos(radians(clamp(uLight[i].spot_cutoff, 0.0, 89.0)));

                    spot_effect = pow(clamp(cos_cur_angle/ cos_inner_cone_angle, 0.0, 1.0), clamp(uLight[i].spot_exponent, 0.0, 128.0));
                }

                att = 1.0 / (uLight[i].constant_attenuation + uLight[i].linear_attenuation * dist + uLight[i].quadratic_attenuation * dist * dist);

            } else {
                L = normalize(uLight[i].position.xyz);
            }

            float lambertTerm = max(dot(N, L), 0.0);

            vec4 Ia = uLight[i].ambient * uFrontMaterial.ambient;

            vec4 Id = uLight[i].diffuse * uFrontMaterial.diffuse * lambertTerm;

            vec4 Is = vec4(0.0, 0.0, 0.0, 0.0);

            if (lambertTerm > 0.0) {
                vec3 R = reflect(-L, N);
                float specular = pow( max( dot(R, E), 0.0 ), uFrontMaterial.shininess);

                Is = uLight[i].specular * uFrontMaterial.specular * specular;
            }

            if (uLight[i].position.w == 1.0) 
               result += att * max(spot_effect * (Id + Is), Ia);
            else
               result += att * spot_effect * (Ia + Id + Is);
        }
    }

	result += uGlobalAmbient * uFrontMaterial.ambient  + uFrontMaterial.emission;
    result = clamp(result, vec4(0.0), vec4(1.0));

    result.a = 1.0;
    return result;
}

vec4 heightMapData(){
    float offset = 50./256.;

    float center = texture2D(uSampler, vTextureCoord).x;
    float up     = texture2D(uSampler, vTextureCoord+vec2( 0, offset)).x;
    float down   = texture2D(uSampler, vTextureCoord+vec2( 0,-offset)).x;
    float left   = texture2D(uSampler, vTextureCoord+vec2(-offset, 0)).x;
    float right  = texture2D(uSampler, vTextureCoord+vec2( offset, 0)).x;



    // vec3 vVer = vec3(0, (up-down)*10.0, 2.0*offset);
    // vec3 vHor = vec3(2.0*offset, (right-left)*10.0, 0);


    float d1 = (right-left)*normScale*0.01;
    float d2 = (up-down)*normScale*0.01;
    vec3 normal = normalize(vec3(-offset*d1, 2.0*offset*offset, -offset*d2));

    // vec3 normal = normalize(cross(vHor, vVer));
    vec4 bump = vec4(normal, center);
	return bump;
}

void main() {

	vTextureCoord = aTextureCoord;

	vec4 heightMapData = heightMapData();
	vec3 normal = heightMapData.xyz;
	float height = heightMapData.w;

	vec3 offset = aVertexNormal*height*normScale*0.01;

    // Transformed Vertex position
    vec4 vertex = uMVMatrix * vec4(aVertexPosition+offset, 1.0);

    // Transformed normal position
	vec3 N = normalize(vec3(uNMatrix * vec4(normal, 1.0)));

    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);

    vFinalColor = lighting(vertex, E, N);
    // vFinalColor = vec4(N, 1);

	gl_Position = uPMatrix * vertex;
}


