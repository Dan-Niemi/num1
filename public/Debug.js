class Debug{
	constructor(renderLocation){
		this.parent = renderLocation;
		this.polyAreaEl = this.parent.appendChild(document.createElement('div'));
		this.hullAreaEl = this.parent.appendChild(document.createElement('div'));
		this.efficiencyEl = this.parent.appendChild(document.createElement('div'));
		this.update();
	}
	get polyArea(){
		if (store.rocks){
			let total = 0
			store.rocks.forEach((val) => total+=val.area)
			return total
		}
		
	}
	update(){
		this.polyAreaEl.textContent = `Rock Area: ${Math.round(this.polyArea / 1000)}`
		this.hullAreaEl.textContent = `Container Area: ${Math.round(hull.area / 1000)}`
		this.efficiencyEl.textContent = `Efficiency: ${((this.polyArea / hull.area) * 100).toFixed(0)}%`;
	}
}