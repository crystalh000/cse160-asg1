
// Import the drawPicture function from Picture.js
// import { drawPicture } from './Picture.js';

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setUpWebGL() {
   // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

   // Get the rendering context for WebGL
   //gl = getWebGLContext(canvas);
   gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

   if (!gl) {
     console.log('Failed to get the rendering context for WebGL');
     return;
   }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program,'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PICTURE = 3;

// Globals related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0]; // Default white
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHTMLUI() {

  // Button Events (Shape Type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  document.getElementById('drawPictureButton').onclick = drawPicture; 

  // Slider Events
  document.getElementById('redSlide').addEventListener('input', function() { g_selectedColor[0] = this.value/100;   });
  document.getElementById('greenSlide').addEventListener('input', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('input',  function() { g_selectedColor[2] = this.value/100;  });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('input', function() { g_selectedSize = this.value });

  // Segment Slider Events
  // document.getElementById('segmentsSlide').addEventListener('input', function() { g_selectedSegments = this.value });
  document.getElementById('segmentsSlide').addEventListener('input', function() { g_selectedSegments = parseInt(this.value); });

}
function main() {
  // Set up canvas and get gl variables
  setUpWebGL();

  // Set up GLSL shader programs and connect JS variables to GLSL
  connectVariablesToGLSL();

  // Set up actions for the HTML UI Elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // The array to store the size of a point

function click(ev) {
  // Extract the event click and return it in WebGL
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store a new point object
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedType == CIRCLE){
    point = new Circle();
    point.segments = g_selectedSegments;
  } else if (g_selectedType == PICTURE){
    point = new Picture();

  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  

  // // Store the coordinates to g_points array
  // g_points.push([x, y]);

  // g_colors.push(g_selectedColor.slice()); // forces a copy of all the elements in the array

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();

 
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes() {
  // Check the time at the start of the function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the list
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
    
  }

  // check the time at the end of the function and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from the HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
