// script.js

// function imports from other files
import { generatePoints } from './javascript/seed.js';

// declare constants
const canvas = document.getElementById('cartesianCanvas');
const ctx = canvas.getContext('2d');
const infoText = document.getElementById('infoText');
const numSlider = document.getElementById('pointsNumSlider');
const numSliderText = document.getElementById('pointsNumSliderText');
const sizeSlider = document.getElementById('pointSizeSlider');
const sizeSliderText = document.getElementById('pointSizeSliderText');
const seedText = document.getElementById('seedText');

// declare variables, to be dynamically updated
var seededPoints = [];
var completedSeededPoints = [];
var globalMouseX = 400;
var globalMouseY = 200;
var globalcenterX;
var globalcenterY;
var mouseMove = true;
var pointSize = 5;
var count = 10;
var seed = '';
var oldCount = 10;
var nearestPoint;

// event listeners
window.addEventListener('mousemove', mouseMoveHandler);
window.addEventListener('click', clicks);
window.addEventListener('contextmenu', function(event) {
	event.preventDefault();
	console.log("prevented context menu !");
});
window.addEventListener('keydown', function(e) {
  if(e.key === 'x'){
    completedSeededPoints = [];
    renderCanvas(e.clientX - globalcenterX, e.clientY - globalcenterY);
    localStorage.clear();
    console.log('cleared points and localStorage')
  }
});

numSlider.addEventListener('input', () => {
  count = Number(numSlider.value);
    if (count < oldCount && completedSeededPoints.length > 0) {
    const newPoints = generatePoints(seed, count, window.innerWidth, window.innerHeight);
    for (let i = completedSeededPoints.length - 1; i >= 0; i--) {
      const p = completedSeededPoints[i];
      const stillExists = newPoints.some(np => np.x === p.x && np.y === p.y);
      if (!stillExists) completedSeededPoints.splice(i, 1);
    }
  }

  oldCount = Number(numSlider.value);
  seededPoints = generatePoints(seed, count, window.innerWidth, window.innerHeight);
  numSliderText.textContent = `# points: ${numSlider.value}`;
});

sizeSlider.addEventListener('input', () => {
  let coords = vHandler([resizeHandler()[0], resizeHandler()[1]], [globalMouseX, globalMouseY])
  pointSize = Number(sizeSlider.value);
  renderCanvas(coords.x, coords.y)
  sizeSliderText.textContent =`point size: ${sizeSlider.value}`;
});

numSlider.addEventListener('change', saveState);
sizeSlider.addEventListener('change', saveState);

seedText.addEventListener('input', () => {
  setSeed(seedText.value);
});

seedText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateSeed()
});

document.getElementById('toSeedRegButton').addEventListener('click', () => {window.location = './seedreg.html';});

function setSeed(value){
  seed = value;
  let coords = vHandler([resizeHandler()[0], resizeHandler()[1]], [globalMouseX, globalMouseY])
  seededPoints = generatePoints(seed, count, window.innerWidth, window.innerHeight);
  completedSeededPoints = [];
  seedText.value = seed;
  renderCanvas(coords.x, coords.y)
  saveState();
}

// mouse movement handler, handle mouse movement
function mouseMoveHandler(e) {
	if (mouseMove) {
		globalcenterX = resizeHandler()[0];
		globalcenterY = resizeHandler()[1];
		globalMouseX = e.clientX;
		globalMouseY = e.clientY;
		infoTextHandler();
		renderCanvas(e.clientX - globalcenterX, e.clientY - globalcenterY);
    if (seededPoints.length === completedSeededPoints.length) savePoints();
	} else return
}

// inforamtion text handler, handle dynamic updating of information text
function infoTextHandler() {
	infoText.textContent = `cursor: (${globalMouseX}, ${globalMouseY})
  center: (${globalcenterX}, ${globalcenterY})
  ` + vectorHandler([globalcenterX, globalcenterY], [globalMouseX, globalMouseY]);
  seedText.value = `${seed}`;
}

function findNearest() {
  const mousePos = { x: globalMouseX - globalcenterX, y: globalMouseY - globalcenterY };

  const incompletePoints = seededPoints.filter(sp => {
    return !completedSeededPoints.some(cp => cp.x === sp.x && cp.y === sp.y);
  });

  if (incompletePoints.length === 0) return null;

  let shortestDistance = Infinity;
  let shortIndex = 0;

  for (let i = 0; i < incompletePoints.length; i++) {
    const distance = Math.hypot(incompletePoints[i].x - mousePos.x, incompletePoints[i].y - mousePos.y);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      shortIndex = i;
    }
  }

  return incompletePoints[shortIndex];
}

function savePoints(){
  var completedSeeds = localStorage.getItem('completedSeeds');
  let seedsArray = [];
  if (completedSeeds) {
    seedsArray = JSON.parse(completedSeeds);
  }
  if (!seedsArray.some(s => s.seed === seed)) {
    seedsArray.push({seed: seed, count: count});
    localStorage.setItem('completedSeeds', JSON.stringify(seedsArray));
  }
}



// resize handler, handle calculations updating stored width and height in case of window resize
function resizeHandler() {
	let centerX = Math.round(window.innerWidth / 2);
	let centerY = Math.round(window.innerHeight / 2);
	return [centerX, centerY];
}

// vector handler, handle calculating vector and display text
function vectorHandler(origin, coordinates) {
	let x = coordinates[0] - origin[0];
	let y = coordinates[1] - origin[1];
	return `v = (${x}, ${y})`;
}

function vHandler(origin, coordinates) {
	let x = coordinates[0] - origin[0];
	let y = coordinates[1] - origin[1];
	return {
    x: x,
    y: y
  };
}

// draw point, handle drawing a single point, called be renderCanvas() that uses stored info provided by clickHandler()
function drawPoint(ctx, x, y, size, colour, fill) {
  if(fill) ctx.fillStyle = colour; else {ctx.strokeStyle = colour; ctx.lineWidth = size;};
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI * 2, true);
  if(fill) ctx.fill(); else ctx.stroke();
}

function generateSeed(){
  let output = [];
  const seedLength = 16;
  const chars = 
  ['a','b','c','d','e','f','g','h','i','j','k',
  'l','m','n','o','p','q','r','s','t','u','v',
  'w','x','y','z','A','B','C','D','E','F','G',
  'H','I','J','K','L','M','N','O','P','Q','R',
  'S','T','U','V','W','X','Y','Z','0','1',
  '2','3','4','5','6','7','8','9', '(', ')',
  '!','@','#','$','%','^','&','*', '/', '\\',
  '+','-','.',',','<','>',';',':', '\'', '"',
  '[',']','{','}','_','=','|','`', '~'
  ];
  
  for (let i = 0; i < seedLength; i++){
    let index = Math.trunc(Math.random()*chars.length);
    output.push(`${chars[index]}`);
  }
  setSeed(output.join(''));
}

function clicks(){
  const mouseC = vHandler([resizeHandler()[0], resizeHandler()[1]], [globalMouseX, globalMouseY])
  for(let i = 0; i < seededPoints.length; i++){
      if(mouseC.x >= seededPoints[i].x-pointSize && mouseC.x <= seededPoints[i].x+pointSize){
        if(mouseC.y >= seededPoints[i].y-pointSize && mouseC.y <= seededPoints[i].y+pointSize){
          completedSeededPoints.push({
		        x: seededPoints[i].x,
		        y: seededPoints[i].y
	        });
          renderCanvas(mouseC.x, mouseC.y);
        }
      }
    }
    saveState();
}

// for debug purposes, currently unused
function debug(){}

// render canvas, handle rendering canvas and all its components, excluding single points (handled by calling drawPoint())
function renderCanvas(mousex, mousey) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	let canvasWidth = canvas.width;
	let canvasHeight = canvas.height;
	let originX = resizeHandler()[0];
	let originY = resizeHandler()[1];

	// set up coordinate system
	ctx.translate(originX, originY); // move origin to center

	// Draw x and x axes
	ctx.beginPath();
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	ctx.moveTo(-originX, 0);
	ctx.lineTo(canvasWidth - originX, 0); // x-axis
	ctx.moveTo(0, -originY);
	ctx.lineTo(0, canvasHeight - originY); // y-axis
	ctx.stroke();

	for (let i = -canvasWidth; i < canvasWidth; i += canvasWidth / 20) {
		ctx.beginPath();
		ctx.strokeStyle = 'grey';
		ctx.lineWidth = 1;
		ctx.moveTo(-originX, i);
		ctx.lineTo(canvasWidth - originX, i); // x-axis
		ctx.moveTo(i, -originY);
		ctx.lineTo(i, canvasHeight - originY); // y-axis
		ctx.stroke();
	}

  // draw shortest distance line to point from mouse
  nearestPoint = findNearest();
  if(nearestPoint){
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.moveTo(mousex, mousey);
    ctx.lineTo(nearestPoint.x, nearestPoint.y);
    ctx.stroke();
  }

	// Draw all the points
  seededPoints.forEach(point => {
    drawPoint(ctx, point.x, point.y, pointSize-(pointSize/5), 'black', false);
    drawPoint(ctx, point.x, point.y, pointSize, 'blue', true);
  });

  completedSeededPoints.forEach(point => {
    drawPoint(ctx, point.x, point.y, pointSize, 'black', true);
  });

  //debug()
}


function saveState(){
  const save = {
    completedSeededPoints: completedSeededPoints,
    pointSize: pointSize,
    count: count,
    oldCount: oldCount,
    seed: seed
  }
  localStorage.setItem('save', JSON.stringify(save));
  console.log('saved state')
}

const savedString = localStorage.getItem('save');
const loadSave = savedString ? () => {
  const data = JSON.parse(savedString);
  completedSeededPoints = data.completedSeededPoints;
  pointSize = data.pointSize;
  count = data.count;
  oldCount = data.oldCount;
  seed = data.seed;
  seededPoints = generatePoints(seed, count, window.innerWidth, window.innerHeight);
  numSlider.value = count;
  sizeSlider.value = pointSize;
  sizeSliderText.textContent =`point size: ${sizeSlider.value}`;
  numSliderText.textContent = `# points: ${numSlider.value}`;
} : () => {return};

// initialization, handles initialization
function init() {
  seededPoints = generatePoints(seed, count, window.innerWidth, window.innerHeight);
	globalcenterX = resizeHandler()[0];
	globalcenterY = resizeHandler()[1];
	infoText.textContent = `cursor: (${globalMouseX}, ${globalMouseY})
  center: (${globalcenterX}, ${globalcenterY})
  ` + vectorHandler([globalcenterX, globalcenterY], [globalMouseX, globalMouseY]);
  loadSave();
  if(seededPoints.length === completedSeededPoints.length) generateSeed();
	renderCanvas(globalMouseX - globalcenterX, globalMouseY - globalcenterY);
  infoTextHandler();
  console.log('ran init() & initialized');
}

// run only once DOM content is loaded, call init()
window.addEventListener("DOMContentLoaded", init);
