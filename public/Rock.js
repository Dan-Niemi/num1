
class Rock {
  constructor(data) {
    this.points = data.points.map((p) => createVector(p.x, p.y));
    this.pos = createVector(data.pos.x, data.pos.y);
    this.rot = data.rot || 0;
    this.scale = 0
    this.rad = data.rad;
    this.id = data.id;
    this.globalPoints = [],
      this.updateGlobalPoints()

    // DRAWING
    colorMode(HSL);
    imageMode(CENTER)
    this.lightness = random(70, 85);
    this.color = color(240, 8, this.lightness);
    this.g = createGraphics(this.rad * 2.5, this.rad * 2.5);
    this.g.colorMode(HSL);
    this.g.noStroke();
    this.createSpeckles();

    // ANIMATION
    this.animEasing = BezierEasing(0.25, 0.1, 0.0, 1.5) //using bezier-easing library
    this.animDuration = 300;
    this.animStartTime = Date.now();
    let animStart = setInterval(() => {
      let progress = (Date.now() - this.animStartTime) / this.animDuration;
      this.scale = this.animEasing(progress)
      this.updateGlobalPoints()
      if (store.hull) {
        store.hull.update(store.rocks)
      }
    }, 16.67);
    setTimeout(() => {
      clearInterval(animStart);
      this.scale = 1;
    }, this.animDuration);
  }

  get area() {
    let area = 0;
    let n = this.points.length;
    let p = this.points;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n;
      area += p[i].x * p[j].y;
      area -= p[j].x * p[i].y;
    }
    return Math.abs(area) / 2;
  }
  get center() {
    return this.points.reduce((a, b) => p5.Vector.add(a, b)).div(this.points.length);
  }
  collidePoint(mouseVec) {
    return collidePointPoly(mouseVec.x, mouseVec.y, this.globalPoints);
  }
  checkOverlap(rockArr) {
    // check for collision
    let res = [];
    rockArr.forEach(other => {
      if (other !== this) {
        // if lines collide
        if (collidePolyPoly(this.globalPoints, other.globalPoints)) {
          res.push(...[this, other]);
        }
        // if this is entirely inside another
        this.globalPoints.forEach(point => {
          if (collidePointPoly(point.x, point.y, other.globalPoints)) {
            res.push(...[this, other]);
          }
        })
        // if another is entirely inside this
        other.globalPoints.forEach(point => {
          if (collidePointPoly(point.x, point.y, this.globalPoints)) {
            res.push(...[this, other]);
          }
        })
      }
    })
    return res.length ? [...new Set(res)] : false;
  }
  draw(color) {
    push()
    fill(color)
    this.drawBase()
    pop()
    this.drawSpeckles()
  }
  drawBase() {
    beginShape();
    this.globalPoints.forEach((p) => vertex(p.x, p.y));
    endShape(CLOSE);
  }
  drawSpeckles() {
    push()
    beginClip();
    this.drawBase()
    endClip();
    let c = this.center
    translate(c.add(this.pos));
    scale(this.scale);
    rotate(this.rot);
    image(this.g, 0, 0);
    pop();
  }
  createSpeckles() {
    for (let i = 0; i < 200; i++) {
      this.g.fill(240, random(20), random(50), random(0.02));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(60), random(60));
      this.g.fill(240, random(20), random(50), random(0.2));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(5), random(5));
    }
  }
  move(deltaVec) {
    this.pos = p5.Vector.add(this.pos, deltaVec);
    this.updateGlobalPoints();
    this.updateServer()
  }
  rotate(angle) {
    this.rot += angle;
    this.updateGlobalPoints();
    this.updateServer()
  }
  updateGlobalPoints() {
    let c = this.center;
    this.globalPoints = this.points.map((p) => p5.Vector.sub(p, c).rotate(this.rot).mult(this.scale).add(this.pos).add(c));
  }
  updateServer() {
    socket.send(
      JSON.stringify({
        type: "updateRock",
        pos: this.pos,
        rot: this.rot,
        id: this.id,
      })
    );
  }
}
