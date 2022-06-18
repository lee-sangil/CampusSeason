const fragment = /* glsl */ `
precision mediump float;

// our textures
uniform vec2 u_resolution;
uniform vec2 u_imageResolution;
uniform vec2 u_mousePosition;

uniform sampler2D u_image0L;
uniform sampler2D u_image0R;
uniform sampler2D u_image1L;
uniform sampler2D u_image1R;
uniform sampler2D u_image2L;
uniform sampler2D u_image2R;
uniform sampler2D u_image3L;
uniform sampler2D u_image3R;

// the texCoords passed in from the vertex shader.
varying vec2 v_uv;

void main() {
    float uvRatio = u_imageResolution.x / u_imageResolution.y;
    float xyRatio = u_resolution.x / u_resolution.y;
    float scale = xyRatio / uvRatio;

    float w = u_mousePosition.y * 4.; // 0 => 4
    float t = u_mousePosition.x; // 0 => 1
    t = clamp(t, 0., 1.);

    vec4 color0, color1;
    vec2 uv = vec2(v_uv.x * scale + (2.0 - scale) * t, v_uv.y);
    if (uv.x >= 1.) {
        uv.x -= 1.;
        if (w >= 3.0) {
            color0 = texture2D(u_image3R, uv);
            color1 = texture2D(u_image0R, uv);
            if (w >= 4.0) w = 4.0;
        }else if (w >= 2.0) {
            color0 = texture2D(u_image2R, uv);
            color1 = texture2D(u_image3R, uv);
        }else if (w >= 1.0) {
            color0 = texture2D(u_image1R, uv);
            color1 = texture2D(u_image2R, uv);
        }else {
            color0 = texture2D(u_image0R, uv);
            color1 = texture2D(u_image1R, uv);
            if (w < 0.0) w = 0.0;
        }
    }else {
        if (w >= 3.0) {
            color0 = texture2D(u_image3L, uv);
            color1 = texture2D(u_image0L, uv);
            if (w >= 4.0) w = 4.0;
        }else if (w >= 2.0) {
            color0 = texture2D(u_image2L, uv);
            color1 = texture2D(u_image3L, uv);
        }else if (w >= 1.0) {
            color0 = texture2D(u_image1L, uv);
            color1 = texture2D(u_image2L, uv);
        }else {
            color0 = texture2D(u_image0L, uv);
            color1 = texture2D(u_image1L, uv);
            if (w < 0.0) w = 0.0;
        }
    }

    if (w == 4.0)
        gl_FragColor = mix(color0, color1, 1.0);
    else
        gl_FragColor = mix(color0, color1, fract(w));
}
`
export default fragment