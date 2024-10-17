class Hull {
  constructor(rocks = []) {
    this.allPoints = [];
    this.show = false;
    this.update(rocks);
  }

  get area() {
    let area = 0;
    let n = this.hullPoints.length;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n;
      area += this.hullPoints[i].x * this.hullPoints[j].y;
      area -= this.hullPoints[j].x * this.hullPoints[i].y;
    }
    return Math.abs(area) / 2;
  }
  get hullPoints() {
    let points = this.allPoints.slice(); // Copy the points array
    points.sort((a, b) => a.x - b.x || a.y - b.y);

    let lower = [];
    for (let point of points) {
      while (lower.length >= 2 && this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    let upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
      let point = points[i];
      while (upper.length >= 2 && this.cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }
  update(rocks) {
    this.allPoints = [];
    for (let rock of rocks) {
      for (point of rock.points) {
        this.allPoints.push(createVector(point.x, point.y));
      }
    }
  }
  cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
  toggle(e) {
    this.show = e.target.checked;
  }
  draw() {
    if (this.show) {
      push();
      noFill();
      stroke(0, 100, 50);
      strokeWeight(4);
      beginShape();
      hull.hullPoints.forEach((point) => vertex(point.x, point.y));
      endShape(CLOSE);
      pop();
    }
  }
  static test(){
    console.log('testing')
  }
}
