class LinearAnimation extends Animation {

	constructor(scene, points, span) {
		super(scene);
		this.points = points;
		this.span = span * SEC_TO_MSEC;
		this.startPosition = [0,0,0];
        this.position = this.startPosition;

		let direction = this.calculateDirections();
		let pathSize = this.calculatePathSize(direction);
		console.log("directions" , direction);
		let speed = pathSize / this.span;

		this.speed = [];
		this.tLimitPath = [];
		this.t = 0;

		for (let i = 0; i < direction.length; i++) {
			let vec = direction[i].vec;
			let norm = direction[i].norm;

			let tpath = norm / speed;
			this.t += tpath;
			this.speed[i] = [vec[0] / tpath, vec[1]/tpath, vec[2] /tpath];
			this.tLimitPath[i] = this.t;
		}

		this.t = 0;
		this.currentPath = 0;

	}

	update(dt) {
		if (this.t < this.span) {
			this.t += dt;

			let speed = this.getSpeed();
			this.position = this.position.add(speed.mult(dt));
			console.log(this.position);
		}

	}

	apply() {
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
	}


	getSpeed() {
		if (this.t > this.tLimitPath[this.currentPath] && this.currentPath < this.tLimitPath.length - 1) {
			this.currentPath++;
		}
		return this.speed[this.currentPath];
	}

	calculateDirections() {
		let direction = [];

		for (let i = 0; (i +1) < this.points.length; i++) {
			let vec = this.points[i + 1].minus(this.points[i]);
			direction[i] = {
				vec: vec,
				norm: vec.norm()
			};
		}

		return direction;
	}

	calculatePathSize(direction){

		let pathSize = 0;

		for (let i = 0; i < direction.length; i++) {
			pathSize += direction[i].norm;
		}

		return pathSize;
	}

}