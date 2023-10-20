var post;
(function (post) {
    post.fragmentBackdrop = `
varying vec2 vUv;
//uniform float time;
void main() {
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 );
}`;
    post.fragmentPost = `
float saturation = 2.0;

uniform int compression;

// 24 is best
// 32 is nice
// 48 is mild
float factor = 24.0;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);

}

// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	//clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	
	if (compression == 1) {
	mainImage(clr, vUv, clr);
	}

	//vec3 original_color = clr.rgb;
	//vec3 lumaWeights = vec3(.25,.50,.25);
	//vec3 grey = vec3(dot(lumaWeights,original_color));
	//clr = vec4(grey + saturation * (original_color - grey), 1.0);
	
	gl_FragColor = clr;
}`;
    post.vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
})(post || (post = {}));
export default { post };
