const KEYS = {}
const COLORS = {};
const SETTINGS = {
  rotSpeed: 0.1,
  rotSpeedWheel: 0.002,
  //multiplier for fine control
  get mult() {
    return KEYS["s"] ? 0.1 : 1;
  },
};

let hull, debug, mousePrev;


document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    room: null,
    cursors: new Map(),
    rocks: new Map(),
    playerId: null,
    selectedRock: null,
    gameStarted: false,
    beginGame() {
      connectToRoom(this.room)
      this.gameStarted = true;
    },
    deleteRock(id) {
      socket.send(
        JSON.stringify({
          type: "deleteRock",
          id: id,
        })
      );
    },
    addRock(pos) {
      socket.send(
        JSON.stringify({
          type: "addRock",
          pos: pos,
        })
      );

    }
  });
  window.store = Alpine.store("data");
});

function setup() {
  colorMode(HSL);
  createCanvas(windowWidth, windowHeight);
  noStroke();
  COLORS.base = color(240, 8, 75);
  COLORS.overlap = color(0, 100, 50, 0.2);
  COLORS.selected = color(240, 8, 0, 0.2);
  hull = new Hull(store.rocks);
  debug = new Debug(document.querySelector(".debug"));
  document.addEventListener("keydown", e => KEYS[e.key] = true);
  document.addEventListener("keyup", e => KEYS[e.key] = false);
  document.addEventListener("mousedown", e => KEYS["m" + e.button] = true);
  document.addEventListener("mouseup", e => { KEYS["m" + e.button] = false; canvasGrabbed = false });
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("mousedown", e => { handleMouseDown(e) });
  document.addEventListener("mousemove", e => { handleMouseMove(e) });
  document.addEventListener("wheel", e => { handleWheel(e) }, { passive: false });
  window.addEventListener('resize', e => resizeCanvas(windowWidth, windowHeight))

}

function draw() {
  getInput();
  background(240, 2, 95);
  // draw base rock
  store.rocks.forEach(rock => rock.draw(rock.color));
  // draw selected rock
  if (store.selectedRock) {
    store.selectedRock.draw(COLORS.selected);
    // draw overlapping rocks
    let overlapping = store.selectedRock.checkOverlap(store.rocks);
    if (overlapping) {
      overlapping.forEach(rock => rock.draw(COLORS.overlap));
    }
  }
  hull.draw();
  debug.update();
}



function getInput() {
  if (store.selectedRock) {
    if (KEYS["a"]) {
      store.selectedRock.rotate(-SETTINGS.rotSpeed * SETTINGS.mult);
    }
    if (KEYS["d"]) {
      store.selectedRock.rotate(SETTINGS.rotSpeed * SETTINGS.mult);
    }
  }
}


function placeRock() {
  store.selectedRock = null;
  hull.update(store.rocks);
}




function handleWheel(e) {
  e.preventDefault();
  if (store.selectedRock) { store.selectedRock.rotate(e.deltaY * SETTINGS.rotSpeedWheel * SETTINGS.mult); }

}
function handleMouseMove(e) {
  let delta = createVector(e.clientX, e.clientY).sub(mousePrev);
  if (store.selectedRock) {
    store.selectedRock.move(delta);
  }
  mousePrev = createVector(e.clientX, e.clientY);
}

function handleMouseDown(e) {
  if (e.button == 0) {
    if (store.selectedRock) {
      // PLACE ROCK
      if (!store.selectedRock.checkOverlap(store.rocks)) {
        store.selectedRock = null;
        return;
      }
    }
    if (!store.selectedRock) {
      // PICK ROCK
      for (let rock of store.rocks.values()) {
        if (rock.collidePoint(createVector(mouseX, mouseY))) {
          store.selectedRock = rock;
          return;
        }
      }
    }
  }
  if (e.button == 2) {
    // DELETE ROCK IF CLICKED
    if (!store.selectedRock) {
      for (let [id, rock] of store.rocks) {
        if (rock.collidePoint(createVector(mouseX, mouseY))) {
          store.deleteRock(id)
          return;
        }
      }
      // OTHERWISE ADD NEW ROCK IF NO ROCK CLICKED
      store.addRock(createVector(mouseX, mouseY))
    }
  }
}