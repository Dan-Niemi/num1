class Rock {
  constructor(data) {
    this.pos = createVector(data.pos.x, data.pos.y);
    this.points = data.points.map((p) => createVector(p.x, p.y));
    this.rot = data.rot || 0;
    this.rad = data.rad;
    this.radMax = data.radMax;
    this.updateGlobalPoints();
    this.id = data.id
    this.g = createGraphics(this.radMax * 2, this.radMax * 2);
    this.g.noStroke();
    this.drawSpeckles();
    colorMode(HSL)
    this.lightness = random(70, 85);
    this.color = color(240,8,this.lightness)
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

  draw() {
    beginShape();
    this.globalPoints.forEach((p) => vertex(p.x, p.y));
    endShape(CLOSE);
  }
  animate(progress = 0){
    push()
    translate(this.pos)
    rotate(this.rot)
    scale(progress*1)
    beginShape();
    this.points.forEach((p) => {vertex(p.x, p.y)});
    endShape(CLOSE);
    beginClip();
    beginShape();
    this.points.forEach((p) => {vertex(p.x, p.y)});
    endShape(CLOSE);
    endClip()
    image(this.g, -this.rad, -this.rad);
    pop()
  }
  updateSpeckles() {
    push();
    beginClip();
    this.draw();
    endClip();
    translate(this.pos);
    rotate(this.rot);
    image(this.g, -this.rad, -this.rad);
    pop();
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
        id: this.id
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
        id: this.id
      })
    );
  }

  updateGlobalPoints() {
    this.globalPoints = this.points.map((p) => p5.Vector.rotate(p, this.rot).add(this.pos));
  }
  
}
