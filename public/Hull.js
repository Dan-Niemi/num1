class Hull {
  constructor(rocks = []) {
    this.rocks = rocks;
    this.allPoints = [];
    this.hullPoints = [];
    this.hullArea = 0;
    this.rockArea = 0
    this.show = false;
    this.update(rocks);
  }
  update(rocks) {
    this.allPoints = [];
    this.rocks = rocks;
    for (let rock of this.rocks) {
      for (let point of rock.globalPoints) {
        this.allPoints.push(new Vector2(point.x, point.y));
      }
    }
    this.allPoints.sort((a, b) => a.x - b.x || a.y - b.y);
    this.updateHullPoints()
    this.updateHullArea()
    this.updateRockArea()
  }

  updateHullPoints() {
    let lower = [];
    for (let point of this.allPoints) {
      while (lower.length >= 2 && this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }
    let upper = [];
    for (let i = this.allPoints.length - 1; i >= 0; i--) {
      let point = this.allPoints[i];
      while (upper.length >= 2 && this.cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    upper.pop();
    lower.pop();
    this.hullPoints = lower.concat(upper);
  }

  updateHullArea() {
    let area = 0;
    let n = this.hullPoints.length;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n;
      area += this.hullPoints[i].x * this.hullPoints[j].y;
      area -= this.hullPoints[j].x * this.hullPoints[i].y;
    }
    this.hullArea = Math.abs(area) / 2;
  }
  updateRockArea(){
    this.rockArea = this.rocks.reduce((tot,rock) => tot + rock.area,0)
  }

  cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  draw(canvas) {
    if (this.show) {
      canvas.push();
      canvas.noFill();
      canvas.stroke(0, 100, 50);
      canvas.strokeWeight(4);
      canvas.beginShape();
      this.hullPoints.forEach((point) => canvas.vertex(point.x, point.y));
      canvas.endShape(p.CLOSE);
      canvas.pop();
    }
  }
}
