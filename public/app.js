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

document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    // ui
    roomInput: '',
    // lobby scope
    players: [],
    id: null,
    room: null,
    // game scope
    rocks: [],
    cursors: [],
    hull: null,
    mousePrev: null,
    selectedRock: null,

    joinRoom() {
      connectToRoom(this.roomInput)
      this.roomInput = ''
    },
    deleteRock(rock) {
      socket.send(JSON.stringify({ type: "deleteRock", id: rock.id, }))
    },
    addRock(pos) {
      socket.send(JSON.stringify({ type: "addRock", pos: pos, }));
    },
    leaveRoom() {
      socket.close();
      console.log('leave room')
      this.rocks = [];
      this.cursors = [];
      this.hull = null;
      this.room = null;
      lobby.send(JSON.stringify({ type: "playerUpdate", room: this.room }))
    }
  });
  window.store = Alpine.store("data");
});

function setup() {
  colorMode(HSL);
  const c = createCanvas(windowWidth, windowHeight);
  c.parent('canvasWrapper')
  noStroke();
  COLORS.base = color(240, 8, 75);
  COLORS.overlap = color(0, 100, 50, 0.2);
  COLORS.selected = color(240, 8, 0, 0.2);
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
  if (store.hull) {
    store.hull.draw();
  }
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
  store.hull.update(store.rocks);
}

function handleWheel(e) {
  e.preventDefault();
  if (store.selectedRock) { store.selectedRock.rotate(e.deltaY * SETTINGS.rotSpeedWheel * SETTINGS.mult); }

}
function handleMouseMove(e) {
  let delta = createVector(e.clientX, e.clientY).sub(store.mousePrev);
  if (store.selectedRock) {
    store.selectedRock.move(delta);
  }
  store.mousePrev = createVector(e.clientX, e.clientY);
  if (socket){
    socket.send(JSON.stringify({ type: "cursorUpdate", pos: { x: e.clientX, y: e.clientY } }));
  }
}

function handleMouseDown(e) {
  if (e.button == 0) {
    if (store.selectedRock) {
      // PLACE ROCK
      if (!store.selectedRock.checkOverlap(store.rocks)) {
        placeRock()
        return;
      }
    }
    if (!store.selectedRock) {
      // PICK ROCK
      for (let rock of store.rocks) {
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
      for (let rock of store.rocks) {
        if (rock.collidePoint(createVector(mouseX, mouseY))) {
          store.deleteRock(rock)
          return;
        }
      }
      // OTHERWISE ADD NEW ROCK IF NO ROCK CLICKED
      store.addRock(createVector(mouseX, mouseY))
    }
  }
}