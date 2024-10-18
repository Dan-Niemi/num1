const KEY_ROTATION = 0.1;
const KEY_ROTATION_FINE = 0.01;
const MOUSE_ROTATION = 0.003;
const MOUSE_ROTATION_FINE = 0.0005;
const KEY_FINE = 83; //s key

const dnEase = BezierEasing(0.25,0.1,0.0,1.5);

let hull, debug;
let colors = {};

document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    cursors: new Map(),
    rocks: new Map(),
    id: null,
    selectedRock: null,
    gameStarted: false,
    animStartTime: null,
    animEndTime: null,
    animDur: 400,
    animStagger: 50,
    init() {
      console.log("alpine store running");
    },
    beginGame() {
      this.gameStarted = true;
      this.animStartTime = Date.now();
      this.animEndTime = this.animStartTime + this.animDur  + this.animStagger * this.rocks.size;
    },
  });
  window.data = Alpine.store("data");
});

function setup() {
  colorMode(HSL);
  createCanvas(windowWidth, windowHeight);
  noStroke();
  colors.base = color(240, 8, 75);
  colors.overlap = color(0, 100, 50, 0.2);
  colors.selected = color(240, 8, 0, 0.2);
  hull = new Hull(data.rocks);
  debug = new Debug(document.querySelector(".debug"));
}

function draw() {
  if(!data.gameStarted){return}
  let dur = Date.now() - data.animStartTime;
  if (data.animStartTime + dur < data.animEndTime){
    background(240, 2, 95);
    data.rocks.forEach((rock, index) => {
      let progress = constrain((dur - data.animStagger * index) / data.animDur,0,1)
      let eased = dnEase(progress)
      fill(rock.color);
      rock.animate(eased);
    });
  }else{
    getInput();
    background(240, 2, 95);
    // draw base rock
    data.rocks.forEach((rock) => {
      fill(rock.color);
      rock.draw();
      rock.updateSpeckles();
    });
    // draw selected rock
    if (data.selectedRock) {
      fill(colors.selected);
      data.selectedRock.draw();
      // draw overlapping rocks
      let overlapping = data.selectedRock.checkOverlap(data.rocks);
      if (overlapping) {
        fill(colors.overlap);
        overlapping.forEach((rock) => rock.draw());
      }
    }
    hull.draw();
    debug.update();
  }


}

function mouseMoved() {
  data.selectedRock && data.selectedRock.move();
}

function mousePressed() {
  if (data.selectedRock) {
    // if not overlapping another, drop
    if (!data.selectedRock.checkOverlap(data.rocks)) {
      placeRock();
    }
  } else {
    // if mouse is over a polygon, select that polygon
    for (let [id, rock] of data.rocks) {
      if (rock.collidePoint(createVector(mouseX, mouseY))) {
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

function placeRock() {
  data.selectedRock = null;
  hull.update(data.rocks);
}
