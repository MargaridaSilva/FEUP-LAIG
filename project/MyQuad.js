/**
 * MyQuad
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyQuad extends CGFobject
{
	constructor(scene, bottomLeftX, bottomLeftY, topRightX, topRightY, minS=0, maxS=1, minT=0, maxT=1)
	{
		super(scene);

		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
        this.maxT = maxT;
        
        this.bottomLeftX = bottomLeftX;
        this.bottomLeftY = bottomLeftY;
        this.topRightX = topRightX;
		this.topRightY = topRightY;
		
		this.dimS= 1;
		this.dimT= 1;


		this.initBuffers();
	};

	updateTexCoords(lengthS, lengthT){
		this.maxS = this.dimS/lengthS;
		this.maxT = this.dimT/lengthT;

		this.texCoords = [
			this.minS, this.maxT,
			this.maxS, this.maxT,
			this.minS, this.minT,
			this.maxS, this.minT
		];
		this.updateTexCoordsGLBuffers();
	}

	initBuffers()
	{
		this.vertices = [
				this.bottomLeftX, this.bottomLeftY, 0,
				this.topRightX , this.bottomLeftY, 0,
				this.bottomLeftX, this.topRightY,  0,
				this.topRightX, this.topRightY,  0
				];

		//Regra da mão direita -> define o sentido visivel
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

			this.updateTexCoords(this.maxS, this.maxT);

		this.primitiveType=this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};