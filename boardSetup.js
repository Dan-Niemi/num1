const POINTS_MIN = 5;
const POINTS_MAX = 12;
const RAD_MIN = 20;
const RAD_MAX = 100;

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static zero() {
    return new Vector2(0, 0);
  }

  static one() {
    return new Vector2(1, 1);
  }
  static random() {
    const angle = Math.random() * Math.PI * 2;
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
  static sortClockwise(vectors) {
    // Find the center point
    const center = vectors.reduce((sum, v) => new Vector2(sum.x + v.x, sum.y + v.y), new Vector2(0, 0));
    center.x /= vectors.length;
    center.y /= vectors.length;

    // Sort the vectors
    return vectors.sort((a, b) => {
      const aRelative = new Vector2(a.x - center.x, a.y - center.y);
      const bRelative = new Vector2(b.x - center.x, b.y - center.y);
      return Math.atan2(bRelative.y, bRelative.x) - Math.atan2(aRelative.y, aRelative.x);
    });
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
}
class Rock {
  constructor(pos, id) {
    this.numPoints = randomInt(POINTS_MIN, POINTS_MAX);
    this.rad = random(RAD_MIN, RAD_MAX);
    this.radMax = RAD_MAX;
    this.points = [];
    this.pos = pos;
    this.rot = 0;
    this.id = id;
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(Vector2.random().multiply(this.rad));
    }
    Vector2.sortClockwise(this.points);
  }
  get globalPoints() {
    let gPoints = [];
    for (let point of this.points) {
      gPoints.push(new Vector2(this.pos.x, this.pos.y).add(point));
    }
    return gPoints;
  }
  checkOverlap(rocks) {
    for (let otherRock of rocks) {
      if (otherRock !== this) {
        if (polygonsOverlap(this.globalPoints, otherRock.globalPoints)) {
          return true;
        }
      }
    }
    return false;
  }
}
function random(min, max) {
  let rand = Math.random();

  if (typeof min === "undefined") {
    return rand;
  } else if (typeof max === "undefined") {
    if (Array.isArray(min)) {
      return min[Math.floor(rand * min.length)];
    } else {
      return rand * min;
    }
  } else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return rand * (max - min) + min;
  }
}
function randomInt(min, max) {
  let rand = Math.random();
  if (typeof min === "undefined") {
    return 1;
  } else if (typeof max === "undefined") {
    return Math.floor(rand * min);
  } else {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(rand * (max - min + 1)) + min;
  }
}
function polygonsOverlap(polygon1, polygon2) {
  // Check if any vertex of polygon1 is inside polygon2
  for (let vertex of polygon1) {
    if (isPointInPolygon(vertex, polygon2)) {
      return true;
    }
  }

  // Check if any vertex of polygon2 is inside polygon1
  for (let vertex of polygon2) {
    if (isPointInPolygon(vertex, polygon1)) {
      return true;
    }
  }

  // Check if any edges intersect
  for (let i = 0; i < polygon1.length; i++) {
    let edge1 = [polygon1[i], polygon1[(i + 1) % polygon1.length]];
    for (let j = 0; j < polygon2.length; j++) {
      let edge2 = [polygon2[j], polygon2[(j + 1) % polygon2.length]];
      if (edgesIntersect(edge1, edge2)) {
        return true;
      }
    }
  }

  return false;
}
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x,
      yi = polygon[i].y;
    let xj = polygon[j].x,
      yj = polygon[j].y;

    let intersect = yi > point.y != yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function edgesIntersect(edge1, edge2) {
  let [a, b] = edge1;
  let [c, d] = edge2;

  let denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (denominator === 0) return false;

  let ua = ((c.y - a.y) * (d.x - c.x) - (c.x - a.x) * (d.y - c.y)) / denominator;
  let ub = ((c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y)) / denominator;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

export default function generateSet(numRocks = 10, boardSize = 1200) {
  let fails = 0;
  let rocks = [];
  for (let id = 0; id < numRocks; id++) {
    let pos = new Vector2(random(RAD_MAX, boardSize - RAD_MAX), random(RAD_MAX, boardSize - RAD_MAX));
    let newRock = new Rock(pos, id);
    if (!newRock.checkOverlap(rocks)) {
      rocks.push(newRock);
    } else {
      id--;
      fails++;
      if (fails > 50) return;
    }
  }
  return { rocks: rocks, boardSize: boardSize };
}
