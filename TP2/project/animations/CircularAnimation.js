class CircularAnimation extends Animation {

	constructor(scene, center, radius, angle0, angle, span) {
		super();
		this.scene = scene;
		this.center = center,
			this.radius = radius;
		this.angle0 = angle0;
		this.angle = angle;
		this.span = span * SEC_TO_MSEC;


		this.omega = this.angle*DEG_TO_RAD / this.span;
		this.t = 0;
		this.currentAngle = this.angle0*DEG_TO_RAD;


	}

	update(dt) {

		if (this.t < this.span) {
			this.t += dt;
			this.currentAngle += this.omega * dt;
		}
	}

	apply() {

		this.scene.translate(this.center[0], this.center[1], this.center[2]);
		this.scene.rotate(this.currentAngle, 0, 1, 0);
		this.scene.translate(this.radius, 0, 0);
		this.scene.translate(-this.center[0], -this.center[1], -this.center[2]);
	}
}