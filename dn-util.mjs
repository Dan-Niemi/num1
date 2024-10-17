export class Vector2 {
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

  static lerp(v1, v2, t) {
    if (!(v1 instanceof Vector2) || !(v2 instanceof Vector2)) {
      throw new Error("Both arguments must be Vector2 instances");
    }

    t = Math.max(0, Math.min(1, t)); // Clamp t between 0 and 1
    return new Vector2(v1.x + (v2.x - v1.x) * t, v1.y + (v2.y - v1.y) * t);
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    return mag > 0 ? this.divide(mag) : Vector2.zero();
  }

  distance(v) {
    return this.subtract(v).magnitude();
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  lerp(v, t) {
    return Vector2.lerp(this, v, t);
  }

 
}

export function random(min, max) {
  let rand = Math.random();
  
  if (typeof min === 'undefined') {
    return rand;
  } else if (typeof max === 'undefined') {
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
};

export function randomInt(min, max) {
  let rand = Math.random();
	if (typeof min === 'undefined'){
		return 1
	} else if (typeof max === 'undefined'){
		return Math.floor(rand * min)
	} else{
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(rand * (max - min + 1)) + min;
	}
	
}

export function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function polygonsOverlap(polygon1, polygon2) {
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
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;
    
    let intersect = ((yi > point.y) != (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function edgesIntersect(edge1, edge2) {
  let [a, b] = edge1;
  let [c, d] = edge2;
  
  let denominator = ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
  if (denominator === 0) return false;
  
  let ua = ((c.y - a.y) * (d.x - c.x) - (c.x - a.x) * (d.y - c.y)) / denominator;
  let ub = ((c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y)) / denominator;
  
  return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}