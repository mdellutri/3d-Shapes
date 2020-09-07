"use strict";

let canvas;

/** @type {WebGLRenderingContext} */
let gl;

let program;

let rot1;
let rot2;
let rot3;
let scale1;
let tz;
let tx=0;
let ty=0;

let mat;

let shapes = [];

let status;

// Represents a shape to be drawn to the screen, and maintains the relevant
// GPU buffers
class Shape {
    constructor() {
        if (!gl) {
            console.log("Shape constructor must be called after WebGL is initialized");
        }
        // Buffer for vertex positions
        this.vBuffer = gl.createBuffer();

        // Buffer for vertex colors
        this.cBuffer = gl.createBuffer();
    
        // Transformation matrix
        this.mat = mat4();

        // Number of vertices in this shape
        this.numVertices = 0;

        // What draw mode to use
        this.drawMode = gl.TRIANGLES;
    }

    // Render the shape to the screen
    draw() {
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        this.vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( this.vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vPosition );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        this.vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( this.vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vColor );

        this.location = gl.getUniformLocation(program, "mat");
        gl.uniformMatrix4fv(this.location, false, flatten(this.mat));
        gl.drawArrays( gl.TRIANGLES, 0, this.numVertices );
        
    }

    // Set the positions and colors to be used for this shape.  Both positions
    // and colors should be arrays of vec4s.
    //define what shape the shape is here
    setData(positions, colors) {
        if (positions.length != colors.length) {
            console.log("Positions and colors not the same length");
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

        render()
    }

    // Set transformation matrix
    setMat(mat) {
        this.mat = mat;
    }
}

window.onload = function init()
{
    status = document.getElementById("status");
    rot1 = document.getElementById("rot1");
    rot2 = document.getElementById("rot2");
    rot3 = document.getElementById("rot3");
    scale1 = document.getElementById("scale1");
    tz = document.getElementById("tz");
    [rot1, rot2, rot3, scale1, tz].forEach(function(elem) {
        elem.initValue = elem.value;
        elem.addEventListener("input", render);
        elem.addEventListener("dblclick", function() {
            elem.value = elem.initValue;
            render();
        });
    });
    let addTet = document.getElementById("addTet");
    addTet.addEventListener("click", function() {
        shapes.push(new Shape);
        

        let verticies = [
            //back
            vec4(0.0000,  0.9428,  0.3333, 1.0 ),
            vec4( -0.8165, -0.4714, 0.3333, 1.0),
            vec4( 0.8165, -0.4714,  0.3333, 1.0),
            
            //left face
            vec4( 0.0000,  0.9428,  0.3333, 1.0),
            vec4( 0.0000,  0.0000, -1.0000, 1.0),
            vec4( -0.8165, -0.4714,  0.3333, 1.0),

            //right face
            vec4( 0.0000,  0.9428,  0.3333, 1.0),
            vec4( 0.0000,  0.0000, -1.0000, 1.0),
            vec4 (0.8165, -0.4714,  0.3333, 1.0),

            //bottom face
            vec4( 0.0000,  0.0000, -1.0000, 1.0),
            vec4( -0.8165, -0.4714,  0.3333, 1.0),
            vec4( 0.8165, -0.4714,  0.3333, 1.0),
        ];

        let vertColor = [
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),

        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),

        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),

        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        ];   

        shapes[shapes.length-1].numVertices = 12;
        shapes[shapes.length-1].setData(verticies, vertColor);
    });
    //adds an octahedron
    let addOcta = document.getElementById("addOcta");
    addOcta.addEventListener("click", function() {
        shapes.push(new Shape);
        

        let verticies = [
            //Front top
            vec4(0,  0,  -0.5, 1.0 ),
            vec4( -0.5, 0.5, 0, 1.0),
            vec4( 0.5, 0.5,  0, 1.0),
            
            //Front left face
            vec4(0,  0,  -0.5, 1.0 ),
            vec4( -0.5, 0.5, 0, 1.0),
            vec4( -0.5, -0.5,  0, 1.0),

            //Front right face
            vec4(0,  0,  -0.5, 1.0 ),
            vec4( 0.5, 0.5, 0, 1.0),
            vec4( 0.5, -0.5,  0, 1.0),

            //Front bottom face
            vec4(0,  0,  -0.5, 1.0 ),
            vec4( -0.5, -0.5, 0, 1.0),
            vec4( 0.5, -0.5,  0, 1.0),

            //Back top
            vec4(0,  0,  0.5, 1.0 ),
            vec4( -0.5, 0.5, 0, 1.0),
            vec4( 0.5, 0.5,  0, 1.0),
            
            //Back left face
            vec4(0,  0,  0.5, 1.0 ),
            vec4( -0.5, 0.5, 0, 1.0),
            vec4( -0.5, -0.5,  0, 1.0),

            //Back right face
            vec4(0,  0,  0.5, 1.0 ),
            vec4( 0.5, 0.5, 0, 1.0),
            vec4( 0.5, -0.5,  0, 1.0),

            //Back bottom face
            vec4(0,  0,  0.5, 1.0 ),
            vec4( -0.5, -0.5, 0, 1.0),
            vec4( 0.5, -0.5,  0, 1.0),
        ];

        let vertColor = [
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),

        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),

        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),

        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),

        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),


        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),

        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),

        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),

        vec4( 1, 0.5, 0.5, 1),
        vec4( 1, 0.5, 0.5, 1),
        vec4( 1, 0.5, 0.5, 1),
        ];   

        shapes[shapes.length-1].numVertices = 24;
        shapes[shapes.length-1].setData(verticies, vertColor);
    });
    //Adds a cube
    let addCube = document.getElementById("addCube");
    addCube.addEventListener("click", function() {
        shapes.push(new Shape);
        

        let verticies = [
            //front
            vec4( -0.5, 0.5, -0.5, 1),
            vec4( 0.5, 0.5, -0.5, 1),
            vec4( 0.5, -0.5, -0.5, 1),
            vec4( -0.5, 0.5, -0.5, 1),
            vec4( -0.5, -0.5, -0.5, 1),
            vec4( 0.5, -0.5, -0.5, 1),
            
            //left face
            vec4( -0.5, 0.5, -0.5, 1),
            vec4( -0.5, 0.5, 0.5, 1),
            vec4( -0.5, -0.5, 0.5, 1),
            vec4( -0.5, 0.5, -0.5, 1),
            vec4( -0.5, -0.5, -0.5, 1),
            vec4( -0.5, -0.5, 0.5, 1),

            //right face
            vec4( 0.5, 0.5, 0.5, 1),
            vec4( 0.5, -0.5, 0.5, 1),
            vec4( 0.5, 0.5, -0.5, 1),
            vec4( 0.5, 0.5, -0.5, 1),
            vec4( 0.5, -0.5, -0.5, 1),
            vec4( 0.5, -0.5, 0.5, 1),

            //back face
            vec4( -0.5, 0.5, 0.5, 1),
            vec4( 0.5, 0.5, 0.5, 1),
            vec4( 0.5, -0.5, 0.5, 1),
            vec4( -0.5, 0.5, 0.5, 1),
            vec4( -0.5, -0.5, 0.5, 1),
            vec4( 0.5, -0.5, 0.5, 1),

            //top face
            vec4( -0.5, 0.5, 0.5, 1),
            vec4( -0.5, 0.5, -0.5, 1),
            vec4( 0.5, 0.5, -0.5, 1),
            vec4( 0.5, 0.5, -0.5, 1),
            vec4( 0.5, 0.5, 0.5, 1),
            vec4( -0.5, 0.5, 0.5, 1),

            //bottom face
            vec4( -0.5, -0.5, 0.5, 1),
            vec4( -0.5, -0.5, -0.5, 1),
            vec4( 0.5, -0.5, -0.5, 1),
            vec4( 0.5, -0.5, -0.5, 1),
            vec4( 0.5, -0.5, 0.5, 1),
            vec4( -0.5, -0.5, 0.5, 1),
        ];

        let vertColor = [
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),

        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),

        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),

        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),

        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),

        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        ];   

        shapes[shapes.length-1].numVertices = 36;
        shapes[shapes.length-1].setData(verticies, vertColor);
    });


    //Adds an Lshape
    let addLShape = document.getElementById("addLShape");
    addLShape.addEventListener("click", function() {
        shapes.push(new Shape);
        

        let verticies = [
            //front-front
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( 0.25, 0.25, -0.5, 1),
            vec4( 0.25, -0.25, -0.5, 1),
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( -0.25, -0.25, -0.5, 1),
            vec4( 0.25, -0.25, -0.5, 1),
            
            //left face
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( -0.25, 0.25, 0.5, 1),
            vec4( -0.25, -0.25, 0.5, 1),
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( -0.25, -0.25, -0.5, 1),
            vec4( -0.25, -0.25, 0.5, 1),

            // //right face
            vec4( 0.25, 0.25, -0.5, 1),
            vec4( 0.25, 0.25, 0.5, 1),
            vec4( 0.25, -0.25, 0.5, 1),
            vec4( 0.25, 0.25, -0.5, 1),
            vec4( 0.25, -0.25, -0.5, 1),
            vec4( 0.25, -0.25, 0.5, 1),

            //Front-top face
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( 0.25, 0.25, -0.5, 1),
            vec4( 0.25, 0.25, 0, 1),
            vec4( -0.25, 0.25, -0.5, 1),
            vec4( -0.25, 0.25, 0, 1),
            vec4( 0.25, 0.25, 0, 1),

            //bottom face
            vec4( -0.25, -0.25, 0.5, 1),
            vec4( -0.25, -0.25, -0.5, 1),
            vec4( 0.25, -0.25, -0.5, 1),
            vec4( 0.25, -0.25, -0.5, 1),
            vec4( 0.25, -0.25, 0.5, 1),
            vec4( -0.25, -0.25, 0.5, 1),

            //back face
            vec4( -0.25, 0.75, 0.5, 1),
            vec4( 0.25, 0.75, 0.5, 1),
            vec4( 0.25, -0.25, 0.5, 1),
            vec4( -0.25, 0.75, 0.5, 1),
            vec4( -0.25, -0.25, 0.5, 1),
            vec4( 0.25, -0.25, 0.5, 1),

            //Back-top face
            vec4( -0.25, 0.75, 0.5, 1),
            vec4( 0.25, 0.75, 0.5, 1),
            vec4( 0.25, 0.75, 0, 1),
            vec4( -0.25, 0.75, 0.5, 1),
            vec4( -0.25, 0.75, 0, 1),
            vec4( 0.25, 0.75, 0, 1),

            //back-front
            vec4( -0.25, 0.75, 0, 1),
            vec4( 0.25, 0.75, 0, 1),
            vec4( 0.25, 0.25, 0, 1),
            vec4( -0.25, 0.75, 0, 1),
            vec4( -0.25, 0.25, 0, 1),
            vec4( 0.25, 0.25, 0, 1),

             //back left face
             vec4( -0.25, 0.75, 0, 1),
             vec4( -0.25, 0.75, 0.5, 1),
             vec4( -0.25, 0.25, 0.5, 1),
             vec4( -0.25, 0.75, 0, 1),
             vec4( -0.25, 0.25, 0, 1),
             vec4( -0.25, 0.25, 0.5, 1),

             // back right face
             vec4( 0.25, 0.75, 0, 1),
             vec4( 0.25, 0.75, 0.5, 1),
             vec4( 0.25, 0.25, 0.5, 1),
             vec4( 0.25, 0.75, 0, 1),
             vec4( 0.25, 0.25, 0, 1),
             vec4( 0.25, 0.25, 0.5, 1),
            
        ];

        let vertColor = [
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),
        vec4( 1, 0, 0, 1),

        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),

        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),

        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),
        vec4( 0, 1, 1, 1),

        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),
        vec4( 1, 1, 0, 1),

        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),
        vec4( 1, 0, 1, 1),

        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),
        vec4( 1, 1, 1, 1),

        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),
        vec4( 0, 0, 0, 1),

        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),
        vec4( 0, 1, 0, 1),

        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        vec4( 0, 0, 1, 1),
        ];   

        shapes[shapes.length-1].numVertices = 60;
        shapes[shapes.length-1].setData(verticies, vertColor);
    });
    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", function(event) {
        // TODO
    });
    canvas.addEventListener("mousemove", function() {
        if (event.buttons & 1 === 1) {
            // TODO
            let drawnX = 2 * event.clientX / canvas.width - 1;
            let drawnY = 1 - 2 * event.clientY / canvas.height;
            tx = drawnX;
            ty = drawnY
            render();
        }
    });
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    render();
};

function render()
{
    status.innerHTML = "Angles: " + (+rot1.value).toFixed()
        + ", " + (+rot2.value).toFixed()
        + ", " + (+rot3.value).toFixed()
        + ". Scale: " + (+scale1.value).toFixed(2)
        + ". Translation: " + (+tz.value).toFixed(2);
    
    let r1 = rotateX(rot1.value);
    let r2 = rotateY(rot2.value);
    let r3 = rotateZ(rot3.value);
    let s1 = scalem(scale1.value, scale1.value, scale1.value);
    let t1 = translate(tx, ty, tz.value);
    
    let mat = r1;
    mat = mult(r3, mult(r2,r1));
    mat = mult(s1, mat);
    mat = mult(t1, mat);
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (let i=0; i<shapes.length; i++) {
        if (i === shapes.length - 1) {
            shapes[i].setMat(mat);
        }
        shapes[i].draw();
    }
}
