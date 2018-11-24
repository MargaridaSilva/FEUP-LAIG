class LinearAnimation extends Animation {

	constructor(scene, points, span) {
		super(scene);
		this.points = points;
		this.span = span * SEC_TO_MSEC;

		let direction = this.calculateDirections();
		let pathSize = this.calculatePathSize(direction);
		let speed = pathSize / this.span;

		this.speed = [];
		this.tLimitPath = [];
		this.t = 0;

		for (let i = 0; i < direction.length; i++) {
			let vec = direction[i].vec;
			let norm = direction[i].norm;

			let tpath = norm / speed;
			this.t += tpath;
			this.speed[i] = vec.div(tpath);
			this.tLimitPath[i] = this.t;
		}

		this.position = [0, 0, 0];
		this.t = 0;
		this.currentPath = 0;

	}

	update(dt) {
		if (this.t < this.span) {
			this.t += dt;

			let speed = this.getSpeed();
			this.position = this.position.add([speed[0] * dt, speed[1] * dt, speed[2] * dt]);
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

		for (let i = 0; i < this.points.length - 1; i++) {
			let vec = this.points[i + 1].minus(this.points[i]);
			direction[i] = [];
			direction[i].vec = vec;
			direction[i].norm = vec.norm();
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