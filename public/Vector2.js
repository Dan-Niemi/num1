
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
  static clamp(v, minX, maxX, minY, maxY) {
    return new Vector2(
      Math.min(Math.max(v.x, minX), maxX),
      Math.min(Math.max(v.y, minY), maxY)
    );
  }
  static clampVector(v, min, max) {
    return new Vector2(
      Math.min(Math.max(v.x, min.x), max.x),
      Math.min(Math.max(v.y, min.y), max.y)
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
  clamp(minX, maxX, minY, maxY) {
    this.x = Math.min(Math.max(this.x, minX), maxX);
    this.y = Math.min(Math.max(this.y, minY), maxY);
    return this;
  }

  clampVector(min, max) {
    this.x = Math.min(Math.max(this.x, min.x), max.x);
    this.y = Math.min(Math.max(this.y, min.y), max.y);
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
