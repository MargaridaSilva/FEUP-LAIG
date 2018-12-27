


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

		this.position = this.points[0];
		this.currentSpeed = [0, 0, 0];
		this.t = 0;
		this.currentPath = 0;

	}

	update(dt) {
		let newTime = this.t + dt;
		if (newTime < this.span) {
			this.t = newTime;
			this.currentSpeed = this.getSpeed();
			this.position = this.position.add(this.currentSpeed.mult(dt));
		}
		else {
			this.position = this.points[this.points.length - 1];
			return 0;
		}
	}

	apply() {
		let angle = Math.atan2(1, 0) -  Math.atan2(this.currentSpeed[2], this.currentSpeed[0]);
		this.scene.translate(this.position[0], this.position[1], this.position[2]);
		this.scene.rotate(angle, 0, 1, 0);
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