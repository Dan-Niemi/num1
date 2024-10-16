const NUM_POLYGONS = 10;
const KEY_ROTATION = 0.1;
const KEY_ROTATION_FINE = 0.01;
const MOUSE_ROTATION = 0.003;
const MOUSE_ROTATION_FINE = 0.0005;
const KEY_FINE = 83; //s key

let thuds = [];
let clicks = [];

let dragMode = false;
let rotateClickPos = false;

let polygons = [],
  selectedPolygon,
  hull,
  debug;

document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    cursors: new Map(),
    id: null,
    init() {
      console.log('alpine store running')
    },
  });
});

function setup() {
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  noStroke();
  addRocks(NUM_POLYGONS, width / 2, height / 2, min(height, width) / 2);
  hull = new Hull(polygons);
  debug = new Debug(document.querySelector(".debug"));
}

function addRocks(num = NUM_POLYGONS) {
  let margin = 50;
  let failedAttempts = 0;
  for (let i = 0; i < num; ) {
    let pos = createVector(random(margin, width - margin), random(margin, height - margin));
    let newRock = new Rock(pos);
    if (!newRock.checkOverlap(polygons)) {
      polygons.push(newRock);
      i++;
    } else {
      failedAttempts++;
      if (failedAttempts > 50) return;
    }
  }
}

function draw() {
  getInput();
  background(240, 5, 95);
  selectedPolygon && selectedPolygon.move();
  polygons.forEach((poly) => poly.draw());
  let overlapping = selectedPolygon && selectedPolygon.checkOverlap(polygons);
  overlapping && overlapping.forEach((item) => item.drawPoints(item.overlapColor));
  hull.draw();
  debug.update();
}

function mousePressed() {
  if (selectedPolygon) {
    // if not overlapping another, drop
    selectedPolygon.checkOverlap(polygons) ? collideRock() : placeRock();
  } else {
    // if mouse is over a polygon, select that polygon
    for (let poly of polygons) {
      if (collidePointPoly(mouseX, mouseY, poly.vertices)) {
        selectedPolygon = poly;
        poly.clickCenter = createVector(mouseX, mouseY);
        break;
      }
    }
  }
}
function mouseReleased() {
  if (dragMode && selectedPolygon) {
    selectedPolygon.checkOverlap(polygons) ? collideRock() : placeRock();
  }
}

function mouseWheel(event) {
  if (!selectedPolygon) return false;
  const MAX_SPEED = 200;
  let angle = constrain(event.delta, -MAX_SPEED, MAX_SPEED);
  selectedPolygon.rotate(angle * (keyIsDown(KEY_FINE) ? MOUSE_ROTATION_FINE : MOUSE_ROTATION));
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getInput() {
  if (keyIsDown(65)) {
    selectedPolygon && selectedPolygon.rotate(keyIsDown(KEY_FINE) ? -KEY_ROTATION_FINE : -KEY_ROTATION);
  }
  if (keyIsDown(68)) {
    selectedPolygon && selectedPolygon.rotate(keyIsDown(KEY_FINE) ? KEY_ROTATION_FINE : KEY_ROTATION);
  }
}

function collideRock() {
  random(clicks).play();
}

function placeRock() {
  selectedPolygon = null;
  hull.update(polygons);
}
