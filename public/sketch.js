window.p = null;
const sketch = (p) => {
  let w, g;

  p.setup = () => {
    // VIEWPORT
    p.colorMode(p.HSB)
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noStroke()
    // WORLD
    w = p.createGraphics(store.world.width, store.world.height)
    w.colorMode(p.HSB)
    w.noStroke()
    w.imageMode(p.CENTER)
    // SPECKLES
    g = p.createGraphics(250, 250)
    g.colorMode(p.HSB)
    g.noStroke()
    createSpeckles()
  }

  p.draw = () => {
    w.clear();
    w.background(0, 0, 95);
    drawRocks();
    getInput();
    store.hull.draw(w);
    p.image(w, 0, 0, p.width, p.height, store.world.pos.x, store.world.pos.y, p.width, p.height);
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  function createSpeckles() {
    for (let i = 0; i < 300; i++) {
      g.fill(240, p.random(20), p.random(50), p.random(0.02));
      g.ellipse(p.random(g.width), p.random(g.height), p.random(60), p.random(60));
      g.fill(240, p.random(20), p.random(50), p.random(0.2));
      g.ellipse(p.random(g.width), p.random(g.height), p.random(5), p.random(5));
    }
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
}
