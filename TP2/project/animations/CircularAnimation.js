class CircularAnimation extends Animation {

	constructor(scene, center, radius, angle0, angle, span) {
		super(scene);
		this.center = center;
		this.radius = radius;
		this.angle0 = angle0;
		this.angle = angle;
		this.span = span * SEC_TO_MSEC;

		this.omega = this.angle*DEG_TO_RAD / this.span;
		this.t = 0;
		this.currentAngle = this.angle0*DEG_TO_RAD;


	}

	config(angle){
		let initAngle = this.angle0 - angle;
		this.scene.rotate(initAngle, 0, 1, 0);
	}

	update(dt) {
		if (this.t < this.span) {
			this.t += dt;
			this.currentAngle += this.omega * dt;
		}
		else return this.currentAngle;
	}

	apply() {
		this.scene.translate(this.center[0], this.center[1], this.center[2]);
		this.scene.rotate(this.currentAngle, 0, 1, 0);
		this.scene.translate(0, 0, this.radius);
		this.scene.translate(-this.center[0], -this.center[1], -this.center[2]);
	}
}