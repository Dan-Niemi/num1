const sketch = (p) => {
  let w, g;
  p.setup = () => {
    p.colorMode(p.HSB)
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noStroke()
    w = p.createGraphics(store.world.width, store.world.height)
    w.colorMode(p.HSB)
    w.noStroke()
    w.imageMode(p.CENTER)
    g = p.createGraphics(250, 250)
    g.colorMode(p.HSB)
    g.noStroke()
    for (let i = 0; i < 200; i++) {
      g.fill(240, p.random(20), p.random(50), p.random(0.02));
      g.ellipse(p.random(g.width), p.random(g.height), p.random(60), p.random(60));
      g.fill(240, p.random(20), p.random(50), p.random(0.2));
      g.ellipse(p.random(g.width), p.random(g.height), p.random(5), p.random(5));
    }
  }
  p.draw = () => {
    p.background(0, 0, 90);
    w.clear();
    drawRocks();
    getInput();
    store.hull.draw(w);
    p.image(w, 0, 0, p.width, p.height, store.world.pos.x, store.world.pos.y, p.width, p.height);
  }
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
  function drawRocks() {
    store.rocks.forEach(rock => drawRock(rock, 'base'));
    if (store.selectedRock) {
      drawRock(store.selectedRock, 'selected');
      let overlapping = store.selectedRock.getOverlapping(store.rocks);
      if (overlapping) {
        overlapping.forEach(rock => drawRock(rock, 'overlapping'))
      }
    }
  }

  function drawRock(rock, type) {
    if (type === 'base') {
      w.fill(220, 10, rock.lightness)
      drawBase(rock)
      drawSpeckles(rock)
    }
    if (type === 'selected') {
      w.fill(220, 10, 0, 0.2)
      drawBase(rock)
    }
    if (type === 'overlapping') {
      w.fill(350, 100, 100, 0.3)
      drawBase(rock)
    }
  }

  function drawBase(rock) {
    w.beginShape()
    rock.globalPoints.forEach(point => w.vertex(point.x, point.y))
    w.endShape(p.CLOSE)
  }
  function drawSpeckles(rock) {
    w.push()
    w.beginClip();
    drawBase(rock)
    w.endClip();
    let c = rock.center
    c.add(rock.pos)
    w.translate(c.x, c.y);
    w.scale(rock.scale);
    w.rotate(rock.rot);
    w.image(g, 0, 0);
    w.pop();
  }
}

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
    roomInput: '',
    players: [],
    id: null,
    room: null,
    sketchInstance: null,
    world: {
      width:null,
      height:null,
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
      document.addEventListener("mouseup", e => {KEYS["m" + e.button] = false;store.world.grabbed = false});
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
      this.sketchInstance = new p5(sketch, 'sketch-wrapper')
      window.p = this.sketchInstance
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
      console.log('leave room')
      this.rocks = [];
      this.cursors = [];
      this.hull = null;
      this.room = null;
      this.sketchInstance.remove()
      lobby.send(JSON.stringify({ type: "playerUpdate", room: this.room }))
    }
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
  e.preventDefault();
  if (store.selectedRock) {
    store.selectedRock.rotate(e.deltaY * SETTINGS.rotSpeedWheel * SETTINGS.mult);
  }
  if (!store.selectedRock) {
    // MOVE WINDOW
    store.world.pos.x = p.constrain(store.world.pos.x + e.deltaX, 0, store.world.width - store.sketchInstance.width);
    store.world.pos.y = p.constrain(store.world.pos.y + e.deltaY, 0, store.world.height - store.sketchInstance.height);
  }

}
function handleMouseMove(e) {
  let delta = new Vector2(e.clientX, e.clientY)
  delta.sub(store.mousePrev);

  if (store.selectedRock) {
    store.selectedRock.move(delta);
  }else if (KEYS["m0"] && store.world.grabbed) {
    // MOVE WINDOW
    
    store.world.pos.x = p.constrain(store.world.pos.x - delta.x, 0, store.world.width - store.sketchInstance.width);
    store.world.pos.y = p.constrain(store.world.pos.y - delta.y, 0, store.world.height - store.sketchInstance.height);
  }
  store.mousePrev = new Vector2(e.clientX, e.clientY);
  if (socket) {
    socket.send(JSON.stringify({ type: "cursorUpdate", pos: { x: e.clientX + store.world.pos.x, y: e.clientY + store.world.pos.y} }));
  }
}

function handleMouseDown(e) {
  if (!store.sketchInstance) { return }
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
        if (rock.isPointInPolygon(new Vector2(e.clientX + store.world.pos.x,e.clientY + store.world.pos.y))) {
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
        if (rock.isPointInPolygon(new Vector2(e.clientX + store.world.pos.x,e.clientY + store.world.pos.y))) {
          store.deleteRock(rock)
          return;
        }
      }
      // OTHERWISE ADD NEW ROCK IF NO ROCK CLICKED
      store.addRock(new Vector2(e.clientX - store.world.pos.x,e.clientY -store.world.pos.y))
    }
  }
}

