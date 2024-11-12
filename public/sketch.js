window.p = null;
const sketch = (p) => {
	let w, s; //p = viewport, w = world, s = speckles
	let colorPicker

	p.setup = () => {
		// VIEWPORT
		p.colorMode(p.HSB)
		colorPicker = p.createColorPicker('#abb0ba')
		colorPicker.size(100, 40)
		colorPicker.position(8, 8)
		p.pixelDensity(1)
		p.createCanvas(p.windowWidth, p.windowHeight)
		p.noStroke()
		// WORLD
		w = p.createGraphics(store.world.width, store.world.height)
		w.colorMode(p.HSB)
		w.noStroke()
		w.imageMode(p.CENTER)
		// SPECKLE BASE IMAGE
		s = p.createGraphics(250, 250)
		s.colorMode(p.HSB)
		s.noStroke()
		for (let i = 0; i < 400; i++) {
			s.fill(0, 0, 0, p.random(0.02));
			s.ellipse(p.random(s.width), p.random(s.height), p.random(60), p.random(60));
			s.fill(0, 0, 0, p.random(0.2));
			s.ellipse(p.random(s.width), p.random(s.height), p.random(5), p.random(5));
		}
	}

	p.draw = () => {
		w.clear();
		w.background(0, 0, 95);
		drawRocks();
		getInput();
		store.hull.draw(w);
		p.image(w, 0, 0, p.width, p.height, store.world.pos.x, store.world.pos.y, p.width, p.height);
	}

	p.windowResized = () => {
		p.resizeCanvas(p.windowWidth, p.windowHeight)
	}

	p.createSpeckles = (rock) => {
		let c = rock.center
		let buffer = p.createGraphics(250, 250)
		buffer.beginClip();
		buffer.beginShape()
		rock.points.forEach(point => buffer.vertex(point.x + buffer.width / 2 - c.x, point.y + buffer.height / 2 - c.y))
		buffer.endShape(p.CLOSE)
		buffer.endClip();
		buffer.image(s, 0, 0)
		return buffer
	}

	function drawRocks() {
		store.rocks.forEach(rock => drawRock(rock, 'base'));
		if (store.selectedRock) {
			drawRock(store.selectedRock, 'selected');
			let overlapping = store.selectedRock.getOverlapping(store.rocks);
			if (overlapping) {
				overlapping.forEach(rock => drawRock(rock, 'overlapping'))
			}
		}
	}

	function drawRock(rock, type) {
		if (type === 'base') {
			let col = colorPicker.color();
			w.fill(p.hue(col), p.saturation(col), p.lightness(col) + rock.lightness)
			drawBase(rock)
			drawSpeckles(rock)
		}
		if (type === 'selected') {
			w.fill(0, 0, 0, 0.2)
			drawBase(rock)
		}
		if (type === 'overlapping') {
			w.fill(350, 100, 100, 0.3)
			drawBase(rock)
		}

		function drawBase(rock) {
			w.beginShape()
			rock.globalPoints.forEach(point => w.vertex(point.x, point.y))
			w.endShape(p.CLOSE)
		}
		function drawSpeckles(rock) {
			let c = rock.center
			c.add(rock.pos)
			w.push();
			w.translate(c.x, c.y);
			w.rotate(rock.rot);
			w.scale(rock.scale);
			w.image(rock.speckles, 0, 0);
			w.pop();
		}
	}
}
