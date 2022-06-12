const fragment = /* glsl */ `
precision mediump float;

// our textures
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform vec2 u_mousePosition;
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform sampler2D u_image2;
uniform sampler2D u_image3;

// the texCoords passed in from the vertex shader.
varying vec2 v_uv;

void main() {
    float uvRatio = u_imageResolution.y / u_imageResolution.x;
    float xyRatio = u_resolution.y / u_resolution.x;
    float weight = u_mousePosition.y / u_resolution.y * 4.;
    float transl = u_mousePosition.x / u_resolution.x;

    vec4 color0, color1;
    if (weight >= 3.0) {
        color0 = texture2D(u_image3, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        color1 = texture2D(u_image0, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        if (weight >= 4.0) weight = 4.0;
    }else if (weight >= 2.0) {
        color0 = texture2D(u_image2, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        color1 = texture2D(u_image3, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
    }else if (weight >= 1.0) {
        color0 = texture2D(u_image1, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        color1 = texture2D(u_image2, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
    }else {
        color0 = texture2D(u_image0, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        color1 = texture2D(u_image1, v_uv * vec2(uvRatio/xyRatio, 1.0) + vec2((1.0-uvRatio/xyRatio)*transl, 0.));
        if (weight < 0.0) weight = 0.0;
    }
    
    gl_FragColor = mix(color0, color1, fract(weight));
}
`
export default fragment