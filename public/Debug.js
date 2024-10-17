class Debug{
	constructor(renderLocation){
		this.parent = renderLocation;
		this.hullAreaEl = this.parent.appendChild(document.createElement('div'));
		this.polyAreaEl = this.parent.appendChild(document.createElement('span'));
		this.efficiencyEl = this.parent.appendChild(document.createElement('span'));
		this.update();
	}
	get polyArea(){
		if (data.rocks){
			return data.rocks.map((rock) => rock.area).reduce((a, b) => a + b, 0)
		}
		
	}
	update(){
		this.polyAreaEl.textContent = `Poly Area: ${Math.round(this.polyArea / 1000)}`
		this.hullAreaEl.textContent = `Area: ${Math.round(hull.area / 1000)}`
		this.efficiencyEl.textContent = `Efficiency: ${((this.polyArea / hull.area) * 100).toFixed(0)}%`;
	}
}