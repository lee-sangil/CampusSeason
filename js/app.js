import fragment from './canvas.frag.js'
import vertex from './canvas.vert.js'

let assetLoaded = {
    percentage: 0,
    num: 0,
    size: 0,
    totNum: 8,
};

const loading = document.querySelector('#loading');
const assetLoadingInterval = setInterval(()=>{
    if (assetLoaded.percentage < Math.floor(assetLoaded.num/assetLoaded.totNum*100)) {
        ++assetLoaded.percentage;
        loading.textContent = 'Loading... ' + assetLoaded.percentage + '%';
    }else if (assetLoaded.percentage === 100) {
        document.getElementById('preloader').style.opacity = 0;
        clearInterval(assetLoadingInterval);
    }
}, 15);

class App {
    constructor() {
        // Get A WebGL context
        const canvas = document.getElementById('webgl-container');
        const gl = canvas.getContext("webgl");
        if (!gl) {
            return;
        }
        this.canvas = canvas;
        this.gl = gl;
        this.dpr = window.devicePixelRatio;

        // create GLSL shaders, upload the GLSL source, compile the shaders
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertex);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragment);

        // Link the two shaders into a program
        const program = this.createProgram(gl, vertexShader, fragmentShader);

        // setup GLSL program
        gl.useProgram(program);

        this.loadImages(['../img/Spring_left.jpg', '../img/Spring_right.jpg', '../img/Summer_left.jpg', '../img/Summer_right.jpg', '../img/Autumn_left.jpg', '../img/Autumn_right.jpg', '../img/Winter_left.jpg', '../img/Winter_right.jpg'], function () {
            this.param = {
                imageLeft: {
                    width: this.images[0].width,
                    height: this.images[0].height,
                },
                imageRight: {
                    width: this.images[1].width,
                    height: this.images[1].height,
                },
                image: {
                    width: this.images[0].width + this.images[1].width,
                    height: this.images[0].height + this.images[1].height,
                },
            };

            // look up where the vertex data needs to go.
            const positionLocation = gl.getAttribLocation(program, "a_position");
            const texcoordLocation = gl.getAttribLocation(program, "a_uv");

            // Create a buffer to put three 2d clip space points in
            this.positionBuffer = gl.createBuffer();

            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            // Set a rectangle the same size as the image.
            const positions = [
                0, 0,
                canvas.clientWidth*this.dpr, 0,
                0, canvas.clientHeight*this.dpr,
                0, canvas.clientHeight*this.dpr,
                canvas.clientWidth*this.dpr, 0,
                canvas.clientWidth*this.dpr, canvas.clientHeight*this.dpr,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            // provide texture coordinates for the rectangle.
            const texcoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0,
            ]), gl.STATIC_DRAW);

            // create textures
            const textures = [];
            for (let ii = 0; ii < this.images.length; ++ii) {
                const texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);

                // Set the parameters so we can render any size image.
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                // Upload the image into the texture.
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[ii]);

                // add the texture to the array of textures.
                textures.push(texture);
            }

            // lookup uniforms
            this.u_resolution = gl.getUniformLocation(program, "u_resolution");
            this.u_imageResolution = gl.getUniformLocation(program, "u_imageResolution");
            this.u_imageLeftWidth = gl.getUniformLocation(program, "u_imageLeftWidth");
            this.u_imageRightWidth = gl.getUniformLocation(program, "u_imageRightWidth");
            this.u_mousePosition = gl.getUniformLocation(program, "u_mousePosition");

            // lookup the sampler locations.
            const u_image0LeftLocation = gl.getUniformLocation(program, "u_image0L");
            const u_image0RightLocation = gl.getUniformLocation(program, "u_image0R");
            const u_image1LeftLocation = gl.getUniformLocation(program, "u_image1L");
            const u_image1RightLocation = gl.getUniformLocation(program, "u_image1R");
            const u_image2LeftLocation = gl.getUniformLocation(program, "u_image2L");
            const u_image2RightLocation = gl.getUniformLocation(program, "u_image2R");
            const u_image3LeftLocation = gl.getUniformLocation(program, "u_image3L");
            const u_image3RightLocation = gl.getUniformLocation(program, "u_image3R");

            this.resize();

            // Clear the canvas
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Turn on the position attribute
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Turn on the texcoord attribute
            gl.enableVertexAttribArray(texcoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
            gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

            // set the resolution
            gl.uniform2f(this.u_resolution, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(this.u_imageResolution, this.param.image.width, this.param.image.height);
            gl.uniform1f(this.u_imageLeftWidth, this.param.imageLeft.width);
            gl.uniform1f(this.u_imageRightWidth, this.param.imageRight.width);

            // set which texture units to render with.
            gl.uniform1i(u_image0LeftLocation,  0);  // texture unit 0 left
            gl.uniform1i(u_image0RightLocation, 1);  // texture unit 0 right
            gl.uniform1i(u_image1LeftLocation,  2);  // texture unit 1 left
            gl.uniform1i(u_image1RightLocation, 3);  // texture unit 1 right
            gl.uniform1i(u_image2LeftLocation,  4);  // texture unit 2 left
            gl.uniform1i(u_image2RightLocation, 5);  // texture unit 2 right
            gl.uniform1i(u_image3LeftLocation,  6);  // texture unit 3 left
            gl.uniform1i(u_image3RightLocation, 7);  // texture unit 3 right

            // Set each texture unit to use a particular texture.
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[0]);
            gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, textures[2]);
            gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, textures[3]);
            gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, textures[4]);
            gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, textures[5]);
            gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, textures[6]);
            gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, textures[7]);
        }.bind(this));

        // set the event listener
        window.addEventListener('resize', this.resize.bind(this));

        this.touch_move = {x: 0, y: 0};
        canvas.addEventListener('mousemove', function (evt) {
            this.touch_move.x = this.dpr * evt.clientX / this.canvas.width;
            this.touch_move.y = this.dpr * evt.clientY / this.canvas.height;
            gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);
        }.bind(this));
        canvas.addEventListener('touchstart', function (evt) {
            this.touch_vel = 0;
            clearInterval(this.touch_damping);
            this.touch_damping = null;
        });
        canvas.addEventListener('touchmove', function (evt) {
            if (this.touch_moving) {
                const img_ratio = this.canvas.height / this.param.image.height;
                const ratio = this.canvas.width / (this.param.image.width*img_ratio - this.canvas.width);

                this.touch_vel = ratio * this.dpr * (evt.changedTouches[0].clientX - this.touch_curr.clientX) / this.canvas.width;
                
                this.touch_move.x -= this.touch_vel;
                this.touch_move.y -= this.dpr * (evt.changedTouches[0].clientY - this.touch_curr.clientY) / this.canvas.height;
                this.touch_move.x = Math.min(Math.max(this.touch_move.x, 0), 1);
                this.touch_move.y = Math.min(Math.max(this.touch_move.y, 0), 1);

                gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);
            }
            this.touch_curr = evt.changedTouches[0];
            this.touch_moving = true;
            evt.preventDefault();
        }.bind(this));
        canvas.addEventListener('touchend', function (evt) {
            this.touch_moving = false;

            if (this.touch_damping == null) {
                this.touch_damping = setInterval(function(){
                    let sign = Math.sign(this.touch_vel);
                    if (sign > 0)
                        this.touch_vel -= 0.5 /this.canvas.width;
                    else
                        this.touch_vel += 0.5 /this.canvas.width;

                    if (sign * Math.sign(this.touch_vel) < 0) {
                        clearInterval(this.touch_damping);
                        this.touch_damping = null;
                    }else {
                        this.touch_move.x -= this.touch_vel;
                        if (this.touch_move.x >= 1 || this.touch_move.x <= 0) {
                            this.touch_move.x = Math.min(Math.max(this.touch_move.x, 0), 1);
                            clearInterval(this.touch_damping);
                            this.touch_damping = null;
                        }
                        gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);
                    }
                }.bind(this), 15);
            }

            evt.preventDefault();
        }.bind(this));
        
        window.requestAnimationFrame(this.render.bind(this));
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    loadImage(url, callback) {
        const image = new Image();
        image.src = url;
        image.onload = callback;
        return image;
    }

    loadImages(urls, callback) {
        this.images = [];
        this.numImages = urls.length;
        let numImagesToLoad = urls.length;

        // Called each time an image finished loading.
        const onImageLoad = function () {
            --numImagesToLoad;
            ++assetLoaded.num;

            // If all the images are loaded call the callback.
            if (numImagesToLoad === 0) {
                callback();
            }
        };

        for (let ii = 0; ii < numImagesToLoad; ++ii) {
            const image = this.loadImage(urls[ii], onImageLoad);
            this.images.push(image);
        }
    }

    resize() {
        // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
        const displayWidth = Math.round(this.canvas.clientWidth * this.dpr);
        const displayHeight = Math.round(this.canvas.clientHeight * this.dpr);

        this.touch_move.x *= displayWidth / this.canvas.width;
        this.touch_move.y *= displayHeight / this.canvas.height;
        this.gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);

        // 캔버스를 동일한 크기가 되도록 합니다.
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Update uniform for resolution
        this.gl.uniform2f(this.u_resolution, this.gl.canvas.width, this.gl.canvas.height);

        // Update attributes
        const positions = [
            0, 0,
            this.canvas.width, 0,
            0, this.canvas.height,
            0, this.canvas.height,
            this.canvas.width, 0,
            this.canvas.width, this.canvas.height,
        ];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    render() {
        // draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        requestAnimationFrame(this.render.bind(this));
    }
}

window.onload = () => {
    new App();
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
