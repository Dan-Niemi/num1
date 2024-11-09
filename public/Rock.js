
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  // Add two vectors
  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }
  // Subtract v2 from v1
  static sub(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }
  // Multiply a vector by a scalar
  static mult(v, scalar) {
    return new Vector2(v.x * scalar, v.y * scalar);
  }
  static div(v, scalar) {
    if (scalar === 0) {
      console.error("Division by zero!");
      return new Vector2(v.x, v.y);
    }
    return new Vector2(v.x / scalar, v.y / scalar);
  }
  static rotate(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(
      v.x * cos - v.y * sin,
      v.x * sin + v.y * cos
    );
  }
  // Instance methods
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  mult(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  div(scalar) {
    if (scalar === 0) {
      console.error("Division by zero!");
      return this;
    }
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
  // Utility method to create a copy of the vector
  clone() {
    return new Vector2(this.x, this.y);
  }
  // Utility method to set the vector's values
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}


class Rock {
  constructor(data) {
    this.points = data.points.map((p) => new Vector2(p.x, p.y));
    this.pos = new Vector2(data.pos.x, data.pos.y);
    this.rot = data.rot || 0;
    this.scale = 0
    this.rad = data.rad;
    this.id = data.id;
    this.globalPoints = [];
    this.updateGlobalPoints()
    // VISUALS
    this.lightness = Math.floor(Math.random() * 15) + 70;
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
    let sum = this.points.reduce((acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    }, new Vector2(0, 0));
    return new Vector2(sum.x / this.points.length, sum.y / this.points.length);
  }

  move(deltaVec) {
    this.pos = Vector2.add(this.pos, deltaVec);
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
    this.globalPoints = this.points.map((p) => p.clone().sub(c).rotate(this.rot).mult(this.scale).add(this.pos).add(c));
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

  getOverlapping(rockArr) {
    let res = new Set();
    rockArr.forEach(other => {
      if (other.id !== this.id) {
        // Check if any vertex of polygon1 is inside polygon2
        for (let point of this.globalPoints) {
          if (this.isPointInPolygon(point, other.globalPoints)) {
            res.add(this)
            res.add(other)
          }
        }
        // Check if any vertex of polygon2 is inside polygon1
        for (let point of other.globalPoints) {
          if (this.isPointInPolygon(point, this.globalPoints)) {
            res.add(this)
            res.add(other)
          }
        }
      }
    });
    return res.size ? Array.from(res) : false;
  }

  isPointInPolygon(point, polygon = this.globalPoints) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].x,yi = polygon[i].y;
      let xj = polygon[j].x,yj = polygon[j].y;
      let intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  edgesIntersect(edge1, edge2) {
    let [a, b] = edge1;
    let [c, d] = edge2;
    let denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    if (denominator === 0) return false;
    let ua = ((c.y - a.y) * (d.x - c.x) - (c.x - a.x) * (d.y - c.y)) / denominator;
    let ub = ((c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y)) / denominator;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

}
