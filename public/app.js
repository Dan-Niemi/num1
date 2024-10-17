const KEY_ROTATION = 0.1;
const KEY_ROTATION_FINE = 0.01;
const MOUSE_ROTATION = 0.003;
const MOUSE_ROTATION_FINE = 0.0005;
const KEY_FINE = 83; //s key


let hull,debug;

let colors = {};

document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    cursors: new Map(),
    rocks: [],
    id: null,
    selectedRock: null,
    init() {
      console.log("alpine store running");
    },
  });
  window.data = Alpine.store("data");
});

function setup() {
  colorMode(HSL);
  createCanvas(windowWidth, windowHeight);
  noStroke()
  colors.base = color(240, 8, 75);
  colors.overlap = color(0, 100, 50, 0.2);
  colors.selected = color(240, 8, 0, 0.2);
  hull = new Hull(data.rocks);
  debug = new Debug(document.querySelector(".debug"));
}

function draw() {
  getInput();
  background(240, 2, 95);
  data.selectedRock && data.selectedRock.move();
  // draw base rock
  data.rocks.forEach((item) => {
    fill(color(hue(colors.base),saturation(colors.base),item.lightness));
    item.draw();
    item.updateSpeckles()
  });

  if (data.selectedRock) {
    fill(colors.selected);
    data.selectedRock.draw();
    let overlapping = data.selectedRock.checkOverlap(data.rocks);
    if (overlapping) {
      fill(colors.overlap);
      overlapping.forEach((x) => x.draw());
    }
  }

  hull.draw();
  debug.update();
}

function mousePressed() {
  if (data.selectedRock) {
    // if not overlapping another, drop
    data.selectedRock.checkOverlap(data.rocks) ? collideRock() : placeRock();
  } else {
    // if mouse is over a polygon, select that polygon
    for (let rock of data.rocks) {
      if ( rock.collidePoint(createVector(mouseX,mouseY))){
        data.selectedRock = rock;
        break;
      }
    }
  }
}


function mouseWheel(event) {
  if (!data.selectedRock) return false;
  const MAX_SPEED = 200;
  let angle = constrain(event.delta, -MAX_SPEED, MAX_SPEED);
  data.selectedRock.rotate(angle * (keyIsDown(KEY_FINE) ? MOUSE_ROTATION_FINE : MOUSE_ROTATION));
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getInput() {
  if (keyIsDown(65)) {
    data.selectedRock && data.selectedRock.rotate(keyIsDown(KEY_FINE) ? -KEY_ROTATION_FINE : -KEY_ROTATION);
  }
  if (keyIsDown(68)) {
    data.selectedRock && data.selectedRock.rotate(keyIsDown(KEY_FINE) ? KEY_ROTATION_FINE : KEY_ROTATION);
  }
}

function collideRock() {
  random(clicks).play();
}

function placeRock() {
  data.selectedRock = null;
  hull.update(data.rocks);
}
