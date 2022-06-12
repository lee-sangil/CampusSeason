import fragment from './canvas.frag.js'
import vertex from './canvas.vert.js'

// class App {
//     constructor() {
//         const canvas = document.getElementById('webgl-container');
//         const gl = canvas.getContext('webgl');
//         if (!gl) alert('WebGL is not supported by your browser');

//         this.canvas = canvas;
//         this.gl = gl;
//         this.dpr = window.devicePixelRatio;

//         const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertex);
//         const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragment);
//         const program = this.createProgram(gl, vertexShader, fragmentShader);

//         // Clear the canvas
//         gl.clearColor(0, 0, 0, 0);
//         gl.clear(gl.COLOR_BUFFER_BIT);

//         // Tell it to use our program (pair of shaders)
//         gl.useProgram(program);

//         // Create a buffer and position attributes
//         const positionBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//         const positions = [
//             0, 0,
//             this.canvas.width, this.canvas.height,
//             0, this.canvas.height,
//             0, 0,
//             this.canvas.width, 0,
//             this.canvas.width, this.canvas.height,
//         ];
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//         const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
//         gl.enableVertexAttribArray(positionAttributeLocation);
//         gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

//         // Create a buffer and uv attributes
//         const texCoordBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
//         gl.bufferData(
//             gl.ARRAY_BUFFER,
//             new Float32Array([
//                 0.0, 0.0,
//                 1.0, 0.0,
//                 0.0, 1.0,
//                 0.0, 1.0,
//                 1.0, 0.0,
//                 1.0, 1.0
//             ]),
//             gl.STATIC_DRAW
//         );
//         const texCoordLocation = gl.getAttribLocation(program, "a_uv");
//         gl.enableVertexAttribArray(texCoordLocation);
//         gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

//         this.textures = [];
//         this.loadImages(['../img/Spring.jpg', '../img/Summer.jpg', '../img/Autumn.jpg', '../img/Winter.jpg'], function () {
//             for (let i = 0; i < this.numImages; ++i) {
//                 let texture = gl.createTexture();
//                 gl.bindTexture(gl.TEXTURE_2D, texture);

//                 // Set the parameters so we can render any size image.
//                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//                 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//                 // Upload the image into the texture.
//                 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[i]);

//                 // add the texture to the array of textures.
//                 this.textures.push(texture);
//             }
//         }.bind(this));

//         // look up uniform locations
//         this.u_resolution = gl.getUniformLocation(program, "u_resolution");
//         this.u_mousePosition = gl.getUniformLocation(program, "u_mousePosition");
//         this.u_texture_spring = gl.getUniformLocation(program, "u_texture_spring");
//         this.u_texture_summer = gl.getUniformLocation(program, "u_texture_summer");
//         this.u_texture_autumn = gl.getUniformLocation(program, "u_texture_autumn");
//         this.u_texture_winter = gl.getUniformLocation(program, "u_texture_winter");

//         // set which texture units to render with.
//         gl.uniform1i(this.u_texture_spring, 0);  // texture unit 0
//         gl.uniform1i(this.u_texture_summer, 1);  // texture unit 1
//         gl.uniform1i(this.u_texture_autumn, 2);  // texture unit 2
//         gl.uniform1i(this.u_texture_winter, 3);  // texture unit 3

//         // Set each texture unit to use a particular texture.
//         gl.activeTexture(gl.TEXTURE0);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
//         gl.activeTexture(gl.TEXTURE1);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
//         gl.activeTexture(gl.TEXTURE2);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
//         gl.activeTexture(gl.TEXTURE3);
//         gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);

//         // set the resolution
//         this.canvas.addEventListener('mousemove', function (evt) {
//             this.gl.uniform2f(this.u_mousePosition, this.dpr * evt.clientX, this.dpr * evt.clientY);
//         }.bind(this));

//         /** Add window resize event listeners */
//         window.onresize = this.resize.bind(this);
//         this.resize();

//         window.requestAnimationFrame(this.render.bind(this));
//     }

//     createShader(gl, type, source) {
//         const shader = gl.createShader(type);
//         gl.shaderSource(shader, source);
//         gl.compileShader(shader);

//         const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
//         if (success) {
//             return shader;
//         }

//         console.log(gl.getShaderInfoLog(shader));
//         gl.deleteShader(shader);
//     }

//     createProgram(gl, vertexShader, fragmentShader) {
//         const program = gl.createProgram();
//         gl.attachShader(program, vertexShader);
//         gl.attachShader(program, fragmentShader);
//         gl.linkProgram(program);

//         const success = gl.getProgramParameter(program, gl.LINK_STATUS);
//         if (success) {
//             return program;
//         }

//         console.log(gl.getProgramInfoLog(program));
//         gl.deleteProgram(program);
//     }

//     loadImage(url, callback) {
//         const image = new Image();
//         image.src = url;
//         image.onload = callback;
//         return image;
//     }

//     loadImages(urls, callback) {
//         this.images = [];
//         this.numImages = urls.length;
//         let numImagesToLoad = urls.length;

//         // Called each time an image finished loading.
//         const onImageLoad = function () {
//             --numImagesToLoad;
//             // If all the images are loaded call the callback.
//             if (numImagesToLoad === 0) {
//                 callback();
//             }
//         };

//         for (let ii = 0; ii < numImagesToLoad; ++ii) {
//             const image = this.loadImage(urls[ii], onImageLoad);
//             this.images.push(image);
//         }
//     }

//     resize() {
//         // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
//         const displayWidth = Math.round(this.canvas.clientWidth * this.dpr);
//         const displayHeight = Math.round(this.canvas.clientHeight * this.dpr);

//         // 캔버스를 동일한 크기가 되도록 합니다.
//         this.canvas.width = displayWidth;
//         this.canvas.height = displayHeight;

//         this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

//         // Update uniform for resolution
//         this.gl.uniform2f(this.u_resolution, this.gl.canvas.width, this.gl.canvas.height);

//         // Update attributes
//         const positions = [
//             0, 0,
//             this.canvas.width, this.canvas.height,
//             0, this.canvas.height,
//             0, 0,
//             this.canvas.width, 0,
//             this.canvas.width, this.canvas.height,
//         ];
//         this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
//     }

//     render() {
//         // draw
//         this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);

//         requestAnimationFrame(this.render.bind(this));
//     }
// }

window.onload = () => {
    // new App();
    document.getElementById('preloader').style.opacity = 0;
    window.document.oncontextmenu = () => { return false }; // lock right click

    if (getComputedStyle(document.documentElement).getPropertyValue('--debug-mode') != 1) {
        window.document.onkeydown = (event) => {
            if (event.key == 'F12') { // Prevent from <F12> key
                return false;
            }
            else if (event.ctrlKey && event.shiftKey && event.key == 'i') {
                return false;  // Prevent from ctrl+shift+i
            }
            else if (event.ctrlKey) {
                return false;  // Prevent from ctrl
            }
        };
    }
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function loadImage(url, callback) {
    var image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}

function loadImages(urls, callback) {
    var images = [];
    var imagesToLoad = urls.length;

    // Called each time an image finished
    // loading.
    var onImageLoad = function () {
        --imagesToLoad;
        // If all the images are loaded call the callback.
        if (imagesToLoad === 0) {
            callback(images);
        }
    };

    for (var ii = 0; ii < imagesToLoad; ++ii) {
        var image = loadImage(urls[ii], onImageLoad);
        images.push(image);
    }
}

function main() {
    loadImages([
        "../img/Spring.jpg",
        "../img/Summer.jpg",
        "../img/Autumn.jpg",
        "../img/Winter.jpg",
    ], render);
}

function render(images) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById('webgl-container');
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // setup GLSL program
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, canvas.clientWidth*2, canvas.clientHeight*2);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]), gl.STATIC_DRAW);

    // create 2 textures
    var textures = [];
    for (var ii = 0; ii < 4; ++ii) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

        // add the texture to the array of textures.
        textures.push(texture);
    }

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var imageResolutionLocation = gl.getUniformLocation(program, "u_imageResolution");
    var mousePositionLocation = gl.getUniformLocation(program, "u_mousePosition");

    // lookup the sampler locations.
    var u_image0Location = gl.getUniformLocation(program, "u_image0");
    var u_image1Location = gl.getUniformLocation(program, "u_image1");
    var u_image2Location = gl.getUniformLocation(program, "u_image2");
    var u_image3Location = gl.getUniformLocation(program, "u_image3");

    // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
    const displayWidth = Math.round(canvas.clientWidth * 2);
    const displayHeight = Math.round(canvas.clientHeight * 2);

    // 캔버스를 동일한 크기가 되도록 합니다.
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // bind the texcoord buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(imageResolutionLocation, images[0].width, images[0].height);

    // set which texture units to render with.
    gl.uniform1i(u_image0Location, 0);  // texture unit 0
    gl.uniform1i(u_image1Location, 1);  // texture unit 1
    gl.uniform1i(u_image2Location, 2);  // texture unit 2
    gl.uniform1i(u_image3Location, 3);  // texture unit 3

    // Set each texture unit to use a particular texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, textures[3]);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 12);

    window.onresize = ()=>{
        // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
        const displayWidth = Math.round(canvas.clientWidth * 2);
        const displayHeight = Math.round(canvas.clientHeight * 2);

        // 캔버스를 동일한 크기가 되도록 합니다.
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Set a rectangle the same size as the image.
        setRectangle(gl, 0, 0, canvas.width, canvas.height);
        
        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    canvas.addEventListener('mousemove', function (evt) {
        gl.uniform2f(mousePositionLocation, 2 * evt.clientX, 2 * evt.clientY);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        console.log('a')
    });
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

main();
