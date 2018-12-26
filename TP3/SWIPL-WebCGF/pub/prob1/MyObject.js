/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyObject(scene) {
	CGFobject.call(this,scene);

	this.initBuffers();
};

MyObject.prototype = Object.create(CGFobject.prototype);
MyObject.prototype.constructor=MyObject;

MyObject.prototype.initBuffers = function () {
	this.vertices = [
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            -0.5, 0.5, 0,
            0.5, 0.5, 0
			];

	this.indices = [
            0, 1, 2, 
			3, 2, 1
        ];
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
