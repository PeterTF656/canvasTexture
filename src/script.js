import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "lil-gui";
import { CanvasTexture, Raycaster } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import $ from 'jquery';
import TweenMax from "gsap";


/**
 * Base
 */
const parameters = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, 1, { y: mesh.rotation.y + Math.PI * 2 });
  },
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Game Canvas
const canv = document.createElement("canvas");
canv.id = "2048";
const ctx = canv.getContext("2d");
document.body.appendChild(ctx.canvas);

// text canvas
const ctx2 = document.createElement("canvas").getContext("2d");
document.body.appendChild(ctx2.canvas);

var x = 500;
ctx.canvas.height = x;
//height = width/1.2533
ctx.canvas.width = x;
ctx2.canvas.height = x;
ctx2.canvas.width = (x * 2) / 1.5;

// $(function(){
//   $("#2048").on("click",function(){
//     console.log("click")

//   })
// })

var size = 4;
var cells = [];
var fontSize;
var width = ctx.canvas.width / size - 6;
var loss = false;
var score = 0;
var bestScore = localStorage.getItem("score2048");
const raycaster = new THREE.Raycaster();

// Create gradient
var grd = ctx.createRadialGradient(ctx.canvas.width/2, ctx.canvas.height/2, ctx.canvas.height/20, ctx.canvas.width*3/5, ctx.canvas.width*2/5, ctx.canvas.height);
grd.addColorStop(0, "black");
grd.addColorStop(1, "grey");

ctx.fillStyle = grd;
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
// ctx.globalAlpha = 0.0
// ctx.fillStyle = "#FFF";
// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//text fill
ctx2.fillStyle = "#FFF";
ctx2.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
ctx2.beginPath();
ctx2.fillStyle = "grey";
ctx2.font = "40px Roboto";
ctx2.fillText("click here...", ctx2.canvas.width / 3, ctx2.canvas.height / 2);
// console.log(ctx2);

const textCanvasTexture = new THREE.CanvasTexture(ctx2.canvas);
const canvasTexture = new THREE.CanvasTexture(ctx.canvas);

let canvasMaterial = new THREE.MeshBasicMaterial({
  map: canvasTexture,
  transparent: true,
  // alpha: 0.3,
});

let textCanvasMaterial = new THREE.MeshBasicMaterial({
  map: textCanvasTexture,
  transparent: true,
  // alpha: 0.1,
});

//clear canvas
function canvasClear() {
  ctx.clearRect(0, 0, 500, 500);
}

function startGame() {
  createCells();
  drawAllCells();
  pasteNewCell();
  pasteNewCell();
  console.log(cells);
}

function finishGame() {
  localStorage.setItem("score2048", this.score);
  canvas.clearRect();
  canvas.style.opacity = "0.3";
  loss = true;
  $(".lose").css({ display: "block" });
}

function cell(row, col) {
  this.value = 0;
  this.x = col * width + 5 * (col + 1);
  this.y = row * width + 5 * (row + 1);
}

// create cells
function createCells() {
  for (var i = 0; i < size; i++) {
    cells[i] = [];
    for (var j = 0; j < size; j++) {
      cells[i][j] = new cell(i, j);
    }
  }
}

function drawCell(cell) {
  ctx.beginPath();
  ctx.rect(cell.x, cell.y, width, width);

  var fontColor;

  ctx.fillStyle = '#36454F';

  switch (cell.value) {
    case 0:
      ctx.fillStlye = "#495D6A";
      fontColor = "white";
      break;
    case 2:
      ctx.fillStyle = "#495D6A";
      fontColor = "white";
      break;
    case 4:
      ctx.fillStyle = "#5B7586";
      fontColor = "white";
      break;
    case 8:
      ctx.fillStyle = "#718C9E";
      fontColor = "white";
      break;
    case 16:
      ctx.fillStyle = "#144340";
      fontColor = "white";
      break;
    case 32:
      ctx.fillStyle = "#1F6A65";
      fontColor = "white";
      break;
    case 64:
      ctx.fillStyle = "#2B918B";
      fontColor = "white";
      break;
    case 128:
      ctx.fillStyle = "#07597D";
      fontColor = "white";
      break;
    case 256:
      ctx.fillStyle = "#0A7BAD";
      fontColor = "white";
      break;
    case 512:
      ctx.fillStyle = "#440087";
      fontColor = "white";
      break;
    case 1024:
      ctx.fillStyle = "#5E00BA";
      fontColor = "white";
      break;
    case 2048:
      ctx.fillStyle = "#89009A";
      fontColor = "white";
      break;
    case 4096:
      ctx.fillStyle = "#B600CD";
      fontColor = "white";
      break;
    default:
      ctx.fillStyle = "rgba(70,80,161,0.8)";
      fontColor = "white";
  }

  // add text to each cell
  ctx.fill();
  if (cell.value) {
    fontSize = width / 2;
    ctx.font = fontSize + "px Viga";
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    //  ctx.textBaseline = "middle";
    ctx.fillText(cell.value, cell.x + width / 2, cell.y + width / 1.5);
  }
}

function drawAllCells() {
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      drawCell(cells[i][j]);
    }
  }
}

function pasteNewCell() {
  var countFree = 0;
  var i, j;
  for (i = 0; i < size; i++) {
    for (j = 0; j < size; j++) {
      if (!cells[i][j].value) {
        countFree++;
      }
    }
  }
  if (countFree<1) {
    finishGame();
    return;
  }
  while (true) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    if (!cells[row][col].value) {
      cells[row][col].value = 2 * Math.ceil(Math.random() * 2);
      drawAllCells();
      console.log(countFree);
      return;
    }
  }

}

document.addEventListener("keydown", function (event) {
  if (!loss) {
    // console.log(event.code);
    if (event.code == "ArrowUp" || event.code == 87) moveUp();
    else if (event.code == "ArrowRight" || event.code == 68) moveRight();
    else if (event.code == "ArrowDown" || event.code == 83) moveDown();
    else if (event.code == "ArrowLeft" || event.code == 65) moveLeft();
    // scoreLabel.html("Score: "+score);
  }
});

function moveRight() {
  var i, j;
  var col;
  for (i = 0; i < size; i++) {
    for (j = size - 2; j >= 0; j--) {
      if (cells[i][j].value) {
        col = j;
        while (col + 1 < size) {
          if (!cells[i][col + 1].value) {
            cells[i][col + 1].value = cells[i][col].value;
            cells[i][col].value = 0;
            col++;
          } else if (cells[i][col].value == cells[i][col + 1].value) {
            cells[i][col + 1].value *= 2;
            score += cells[i][col + 1].value;
            cells[i][col].value = 0;
            break;
          } else {
            break;
          }
        }
      }
    }
  }
  // console.log(cells);
  pasteNewCell();
}

function moveLeft() {
  var i, j;
  var col;
  for (i = 0; i < size; i++) {
    for (j = 1; j < size; j++) {
      if (cells[i][j].value) {
        col = j;
        while (col - 1 >= 0) {
          if (!cells[i][col - 1].value) {
            cells[i][col - 1].value = cells[i][col].value;
            cells[i][col].value = 0;
            col--;
          } else if (cells[i][col].value == cells[i][col - 1].value) {
            cells[i][col - 1].value *= 2;
            score += cells[i][col - 1].value;
            cells[i][col].value = 0;
            break;
          } else {
            break;
          }
        }
      }
    }
  }
  pasteNewCell();
}

function moveUp() {
  var i, j, row;
  for (j = 0; j < size; j++) {
    for (i = 1; i < size; i++) {
      if (cells[i][j].value) {
        row = i;
        while (row > 0) {
          if (!cells[row - 1][j].value) {
            cells[row - 1][j].value = cells[row][j].value;
            cells[row][j].value = 0;
            row--;
          } else if (cells[row][j].value == cells[row - 1][j].value) {
            cells[row - 1][j].value *= 2;
            score += cells[row - 1][j].value;
            cells[row][j].value = 0;
            break;
          } else {
            break;
          }
        }
      }
    }
  }
  pasteNewCell();
}

function moveDown() {
  var i, j, row;
  for (j = 0; j < size; j++) {
    for (i = size - 2; i >= 0; i--) {
      if (cells[i][j].value) {
        row = i;
        while (row + 1 < size) {
          if (!cells[row + 1][j].value) {
            cells[row + 1][j].value = cells[row][j].value;
            cells[row][j].value = 0;
            row++;
          } else if (cells[row][j].value == cells[row + 1][j].value) {
            cells[row + 1][j].value *= 2;
            score += cells[row + 1][j].value;
            cells[row][j].value = 0;
            break;
          } else {
            break;
          }
        }
      }
    }
  }
  pasteNewCell();
}

// Scene
const scene = new THREE.Scene();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// var mesh;
/**
 * Object
 */
// Loading Model
gltfLoader.load("monitorgltf.gltf", (gltf) => {
  gltf.scene.traverse((child) => {
    const size = new THREE.Vector3();
    const dimension = new THREE.Box3().setFromObject(child).getSize(size);
    child.material = canvasMaterial;
    console.log(dimension);
  });
  // mesh = gltf.scene;
  // if(gltf.scene)
  // {console.log(gltf.scene.children[0].geometry)}
  scene.add(gltf.scene);
});

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const geometry = new THREE.PlaneGeometry(
  0.869257260217573,
  0.6769603274601188,
  1
);
const mesh = new THREE.Mesh(geometry, canvasMaterial);
mesh.position.set(-0.044937536120414734, 0, -0.252805233001709);
scene.add(mesh);

const sizea = new THREE.Vector3();
const dimension = new THREE.Box3().setFromObject(mesh).getSize(sizea);
// console.log(dimension);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, canvasMaterial)
let currentIntersect = null;

const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  // console.log(mouse)
});

window.addEventListener("click", () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case mesh:
        console.log("click on mesh");
        // $("#2048").fadeToggle("slow", function(){
        //   console.log("change")
        TweenMax.fromTo(mesh.material, 1, {opacity: 1}, {opacity: 0.1, onupdate: function() { mesh.material = textCanvasMaterial; TweenMax.fromTo(mesh.material, 1, {opacity: 0.1}, {opacity: 1});}});
        // mesh.material = textCanvasMaterial
        
        // });
        break;
    }
  }
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Debug
 */
const gui = new dat.GUI({
  // closed: true,
  width: 400,
});
// gui.hide()
// gui.add(mesh.position, 'y').min(- 3).max(3).step(0.01).name('elevation')
// gui.add(mesh, 'visible')
// gui.add(material, 'wireframe')

window.addEventListener("keydown", (event) => {
  if (event.key === "h") {
    if (gui._hidden) gui.show();
    else gui.hide();
  }
});

gui.addColor(parameters, "color").onChange(() => {
  material.color.set(parameters.color);
});

gui.add(parameters, "spin");

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  raycaster.setFromCamera(mouse, camera);
  if (mesh) {
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length) {
      if (!currentIntersect) {
        console.log("mouse enter");
      }

      currentIntersect = intersects[0];
    } else {
      if (currentIntersect) {
        console.log("mouse leave");
      }

      currentIntersect = null;
    }
  }

  canvasTexture.needsUpdate = true;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
startGame();
tick();
