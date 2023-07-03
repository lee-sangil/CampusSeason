const base_dir = '/apps/panorama'

import fragment from './canvas.frag.js'
import vertex from './canvas.vert.js'

export class App {
    constructor(app_container) {
        // Get A WebGL context
        const div = document.createElement("div");
        div.style.width = '100%';
        div.style.height = '100%';

        const canvas = document.createElement("canvas");
        canvas.draggable = false;
        this.canvas = canvas;
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        
        div.appendChild(canvas);
        app_container.appendChild(div);
        this.body = div;

        const gl = this.canvas.getContext("webgl");
        if (!gl) {
            return;
        }
        this.gl = gl;
        this.dpr = window.devicePixelRatio;

        // create GLSL shaders, upload the GLSL source, compile the shaders
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertex);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragment);

        // Link the two shaders into a program
        const program = this.createProgram(gl, vertexShader, fragmentShader);

        // setup GLSL program
        gl.useProgram(program);

        this.loadImages([base_dir+'/img/Spring_left.jpg', 
                         base_dir+'/img/Spring_right.jpg', 
                         base_dir+'/img/Summer_left.jpg', 
                         base_dir+'/img/Summer_right.jpg', 
                         base_dir+'/img/Autumn_left.jpg', 
                         base_dir+'/img/Autumn_right.jpg', 
                         base_dir+'/img/Winter_left.jpg', 
                         base_dir+'/img/Winter_right.jpg'], function () {
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
                    height: this.images[0].height,
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
            this.u_mousePosition = gl.getUniformLocation(program, "u_mousePosition");

            // lookup the sampler locations.
            const u_image0LeftLocation  = gl.getUniformLocation(program, "u_image0L");
            const u_image0RightLocation = gl.getUniformLocation(program, "u_image0R");
            const u_image1LeftLocation  = gl.getUniformLocation(program, "u_image1L");
            const u_image1RightLocation = gl.getUniformLocation(program, "u_image1R");
            const u_image2LeftLocation  = gl.getUniformLocation(program, "u_image2L");
            const u_image2RightLocation = gl.getUniformLocation(program, "u_image2R");
            const u_image3LeftLocation  = gl.getUniformLocation(program, "u_image3L");
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
            gl.uniform2f(this.u_imageResolution, this.param.imageLeft.width, this.param.imageLeft.height);

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
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize, false);

        this.touch_move = {x: 0, y: 0};
        this.body.addEventListener('mousemove', function (evt) {
            this.touch_move.x = this.dpr * evt.clientX / this.canvas.width;
            this.touch_move.y = this.dpr * evt.clientY / this.canvas.height;
            gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);
        }.bind(this));
        this.body.addEventListener('touchstart', function (evt) {
            this.touch_vel = 0;
            this.touch_curr = evt.changedTouches[0];
            this.touch_damping = false;
            
            evt.preventDefault();
        }.bind(this));
        this.body.addEventListener('touchmove', function (evt) {
            const img_ratio = this.canvas.height / this.param.image.height;
            const ratio = this.canvas.width / (this.param.image.width*img_ratio - this.canvas.width);

            this.touch_vel = ratio * this.dpr * (evt.changedTouches[0].clientX - this.touch_curr.clientX) / this.canvas.width;

            this.touch_move.x -= this.touch_vel;
            this.touch_move.y -= this.dpr * (evt.changedTouches[0].clientY - this.touch_curr.clientY) / this.canvas.height;
            this.touch_move.x = Math.min(Math.max(this.touch_move.x, 0), 1);
            this.touch_move.y = this.touch_move.y - Math.floor(this.touch_move.y);
            this.touch_curr = evt.changedTouches[0];
            gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);

            evt.preventDefault();
        }.bind(this));
        this.body.addEventListener('touchend', function (evt) {
            if (this.touch_damping == false) {
                this.touch_damping_pos = this.touch_move.x;
                this.touch_damping_time = Date.now();
                this.touch_damping = true;
            }

            evt.preventDefault();
        }.bind(this));
        
        this.render();
    }

    release(){
        window.cancelAnimationFrame(this.requestID);
        window.removeEventListener('resize', this.resize, false);

        this.removeElement(this.body);
    }

    removeElement(element){
        while (element.firstChild) {
            this.removeElement(element.firstChild);
        }
        element.remove();
    }

    getTotalNumAssets() {
        return 8;
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
            dispatchEvent(new CustomEvent("onloadasset", {detail: {type: 'image'}}));

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

        if (this.touch_damping) {
            this.touch_vel *= 0.95;
            if (Math.abs(this.touch_vel) < 0.0001) {
                this.touch_damping = false;
            }else {
                this.touch_move.x -= this.touch_vel;
                if (this.touch_move.x >= 1 || this.touch_move.x <= 0) {
                    this.touch_move.x = Math.min(Math.max(this.touch_move.x, 0), 1);
                    this.touch_damping = false;
                }
            }
            this.gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);

            // const time = (Date.now() - this.touch_damping_time) / 1000;
            // const T = 2;
            // if (time >= T) {
            //     this.touch_damping = false;
            // }else {
            //     this.touch_move.x = this.touch_damping_pos - this.touch_vel * 15 * (1-Math.exp(-5*time/T));
            //     if (this.touch_move.x >= 1 || this.touch_move.x <= 0) {
            //         this.touch_move.x = Math.min(Math.max(this.touch_move.x, 0), 1);
            //         this.touch_damping = false;
            //     }
            // }
            // this.gl.uniform2f(this.u_mousePosition, this.touch_move.x, this.touch_move.y);
        };

        this.requestID = requestAnimationFrame(this.render.bind(this));
    }
}