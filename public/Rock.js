class Rock {
  constructor(id,data) {
    this.pos = createVector(data.pos.x, data.pos.y);
    this.points = data.points.map((p) => createVector(p.x, p.y));
    this.rot = data.rot || 0;
    this.rad = data.rad;
    this.radMax = data.radMax;
    this.updateGlobalPoints();
    this.id = id;
    colorMode(HSL);
    this.g = createGraphics(this.radMax * 2, this.radMax * 2);
    this.g.noStroke();
    this.drawSpeckles();
    this.lightness = random(70, 85);
    this.color = color(240, 8, this.lightness);
    
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
    for (let [id, other] of rockArr) {
      if (other !== this) {
        // if lines collide
        if (collidePolyPoly(this.globalPoints, other.globalPoints)) {
          res.push(...[this, other]);
        }
        // if this is entirely inside another
        for (let point of this.globalPoints) {
          if (collidePointPoly(point.x, point.y, other.globalPoints)) {
            res.push(...[this, other]);
          }
        }
        // if another is entirely inside this
        for (let point of other.globalPoints) {
          if (collidePointPoly(point.x, point.y, this.globalPoints)) {
            res.push(...[this, other]);
          }
        }
      }
    }
    return res.length ? [...new Set(res)] : false;
  }

  draw(s = 1) {
    beginShape();
    this.globalPoints.forEach((p) => vertex(p.x, p.y));
    endShape(CLOSE);
    // Do Speckles
    push()
    beginClip();
    beginShape();
    this.globalPoints.forEach((p) => vertex(p.x, p.y));
    endShape(CLOSE);
    endClip();
    let c = this.center
    translate(c.add(this.pos));
    scale(s);
    rotate(this.rot);
    image(this.g, -this.radMax, -this.radMax);
    pop();
    
  }
  animate(progress = 0) {
    let scale = progress * 1;
    this.updateGlobalPoints(scale);
    this.draw(scale);    
  }

  drawSpeckles() {
    this.g.colorMode(HSL);
    for (let i = 0; i < 200; i++) {
      this.g.fill(240, random(20), random(50), random(0.02));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(60), random(60));
      this.g.fill(240, random(20), random(50), random(0.2));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(5), random(5));
    }
  }
  move() {
    let mouseDelta = createVector(mouseX - pmouseX, mouseY - pmouseY);
    this.pos = p5.Vector.add(this.pos, mouseDelta);
    this.updateGlobalPoints();
    socket.send(
      JSON.stringify({
        type: "rockUpdate",
        pos: this.pos,
        rot: this.rot,
        id: this.id,
      })
    );
  }
  rotate(angle) {
    this.rot += angle;
    this.updateGlobalPoints();
    socket.send(
      JSON.stringify({
        type: "rockUpdate",
        pos: this.pos,
        rot: this.rot,
        id: this.id,
      })
    );
  }
  updateGlobalPoints(scale = 1) {
    let c = this.center;
    this.globalPoints = this.points.map((p) => p5.Vector.sub(p, c).rotate(this.rot).mult(scale).add(this.pos).add(c));
  }
}
