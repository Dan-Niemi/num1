class Rock {
  constructor(data) {
    this.pos = createVector(data.pos.x, data.pos.y);
    this.points = data.points.map((p) => createVector(p.x, p.y));
    this.rotation = 0;
    this.rad = data.rad;
    this.radMax = data.radMax
    this.updateGlobalPoints();
    
    this.g = createGraphics(this.radMax * 2, this.radMax * 2);
    this.g.noStroke();
    this.drawSpeckles();
    this.lightness = random(70,85)
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

  collidePoint(mouseVec){
    return collidePointPoly(mouseVec.x,mouseVec.y,this.globalPoints)
  }
  checkOverlap(rockArr) {
    // check for collision
    let res = [];
    for (let other of rockArr) {
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

  draw() {
    beginShape();
    this.globalPoints.forEach((p) => vertex(p.x, p.y));
    endShape(CLOSE);
  }
  updateSpeckles() {
    push();
    beginClip();
    this.draw();
    endClip();
    translate(this.pos);
    rotate(this.rotation);
    image(this.g, -this.rad, -this.rad);
    pop();
  }

  drawSpeckles() {
    this.g.colorMode(HSL);
    for (let i = 0; i < 100; i++) {
      this.g.fill(240, random(10), random(50), random(0.02));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(50),random(50));
    }
  }
  move() {
    let mouseDelta = createVector(mouseX - pmouseX, mouseY - pmouseY);
    this.pos.add(mouseDelta);
    this.updateGlobalPoints()
  }

  rotate(angle) {
    this.rotation += angle;
    this.updateGlobalPoints()
  }

  updateGlobalPoints() {
    this.globalPoints = this.points.map((p) => p5.Vector.rotate(p, this.rotation).add(this.pos));
  }
}
