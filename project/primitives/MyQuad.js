/**
 * MyQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyQuad extends CGFobject {
	constructor(scene, bottomLeftX, bottomLeftY, topRightX, topRightY) {
		super(scene);
		this.bottomLeftX = bottomLeftX;
		this.bottomLeftY = bottomLeftY;
		this.topRightX = topRightX;
		this.topRightY = topRightY;
		
		this.dx = topRightX - bottomLeftX;
		this.dy = topRightY - bottomLeftY;

		this.initBuffers();

		this.originaltexCoords = this.texCoords.slice();
	};

	updateCoords(s, t) {
		let sRatio =  this.dx / s;
		let tRatio = this.dy / t ;

		for (let i = 0; i < this.texCoords.length; i += 2) {
			this.texCoords[i] = this.originaltexCoords[i] * sRatio;
			this.texCoords[i + 1] = this.originaltexCoords[i + 1] * tRatio;
		}

		this.updateTexCoordsGLBuffers();
	}

	initBuffers() {
		this.vertices = [
			this.bottomLeftX, this.bottomLeftY, 0,
			this.topRightX, this.bottomLeftY, 0,
			this.bottomLeftX, this.topRightY, 0,
			this.topRightX, this.topRightY, 0
		];

		this.indices = [
			0, 1, 2,
			3, 2, 1
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};