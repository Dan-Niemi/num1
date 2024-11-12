const KEYS = {}
const SETTINGS = {
  rotSpeed: 0.075,
  rotSpeedWheel: 0.002,
  //multiplier for fine control
  get mult() {
    return KEYS["s"] ? 0.1 : 1;
  },
};

document.addEventListener("alpine:init", () => {
  Alpine.store("data", {
    roomInput: '',
    players: [],
    id: null,
    room: null,
    world: {
      width: null,
      height: null,
      grabbed: false,
      pos: new Vector2()
    },
    rocks: [],
    cursors: [],
    hull: null,
    mousePrev: new Vector2(0, 0),
    selectedRock: null,

    init() {
      document.addEventListener("keydown", e => KEYS[e.key] = true);
      document.addEventListener("keyup", e => KEYS[e.key] = false);
      document.addEventListener("mousedown", e => KEYS["m" + e.button] = true);
      document.addEventListener("mouseup", e => { KEYS["m" + e.button] = false; store.world.grabbed = false });
      document.addEventListener("contextmenu", e => e.preventDefault());
      document.addEventListener("mousedown", e => { handleMouseDown(e) });
      document.addEventListener("mousemove", e => { handleMouseMove(e) });
      document.addEventListener("wheel", e => { handleWheel(e) }, { passive: false });
    },
    joinRoom() {
      connectToRoom(this.roomInput)
      this.roomInput = ''
    },
    setupRoom(data) {
      this.rocks = data.rocks.map(rock => new Rock(rock))
      this.room = data.room
      this.world.width = data.worldWidth
      this.world.height = data.worldHeight
      this.world.pos = new Vector2(this.world.width/2-window.innerWidth/2,this.world.height/2 - window.innerHeight/2)
      window.p = new p5(sketch, 'sketch-wrapper')
      this.hull = new Hull(store.rocks)
    },
    deleteRock(rock) {
      socket.send(JSON.stringify({ type: "deleteRock", id: rock.id, }))
    },
    addRock(pos) {
      socket.send(JSON.stringify({ type: "addRock", pos: pos }));
    },
    leaveRoom() {
      socket.close();
      this.rocks = [];
      this.cursors = [];
      this.room = null;
      p.remove()
      window.p = null
      lobby.send(JSON.stringify({ type: "playerUpdate", room: this.room }))
    },
  });
  window.store = Alpine.store("data");
});


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
  if (!p) { return }
  e.preventDefault();
  if (store.selectedRock) { //ROTATE ROCK
    store.selectedRock.rotate(e.deltaY * SETTINGS.rotSpeedWheel * SETTINGS.mult);
  }
  if (!store.selectedRock) {// MOVE WINDOW
    store.world.pos.x = p.constrain(store.world.pos.x + e.deltaX, 0, store.world.width - p.width);
    store.world.pos.y = p.constrain(store.world.pos.y + e.deltaY, 0, store.world.height - p.height);
  }

}
function handleMouseMove(e) {
  if (!p) { return }
  let mousePos = new Vector2(e.clientX,e.clientY)
  let delta = Vector2.sub(mousePos,store.mousePrev)
  if (store.selectedRock) {//MOVE ROCK
    store.selectedRock.move(delta);
  } else if (KEYS["m0"] && store.world.grabbed) {// MOVE WINDOW
    store.world.pos.sub(delta).clampVector(new Vector2(0, 0), new Vector2(store.world.width - p.width, store.world.height - p.height))
  }
  store.mousePrev = new Vector2(e.clientX, e.clientY);
  socket.send(JSON.stringify({ type: "cursorUpdate", pos: { x: e.clientX + store.world.pos.x, y: e.clientY + store.world.pos.y } }));
  // throttledCursorUpdate(e)
}

function handleMouseDown(e) {
  if (!p) { return }
  if (e.button == 0) {
    if (store.selectedRock) {
      // PLACE ROCK
      if (!store.selectedRock.getOverlapping(store.rocks)) {
        placeRock()
        return;
      }
    }
    if (!store.selectedRock) {
      // PICK ROCK
      for (let rock of store.rocks) {
        if (rock.isPointInPolygon(new Vector2(e.clientX + store.world.pos.x, e.clientY + store.world.pos.y))) {
          store.selectedRock = rock;
          return;
        }
      }
    }
    store.world.grabbed = true;
  }
  if (e.button == 2) {
    // DELETE ROCK IF CLICKED
    if (!store.selectedRock) {
      for (let rock of store.rocks) {
        if (rock.isPointInPolygon(new Vector2(e.clientX + store.world.pos.x, e.clientY + store.world.pos.y))) {
          store.deleteRock(rock)
          return;
        }
      }
      // OTHERWISE ADD NEW ROCK IF NO ROCK CLICKED
      store.addRock(new Vector2(e.clientX + store.world.pos.x, e.clientY + store.world.pos.y))
    }
  }
}





// function throttle(callback, wait) {
//   var timeout
//   return function(e) {
//     if (timeout) return;
//     timeout = setTimeout(() => (callback(e), timeout=undefined), wait)
//   }
// }
// const throttledCursorUpdate = throttle((e) => {
//   socket.send(JSON.stringify({
//     type: "cursorUpdate",
//     pos: { x: e.clientX + store.world.pos.x, y: e.clientY + store.world.pos.y }
//   }));
// }, 100);