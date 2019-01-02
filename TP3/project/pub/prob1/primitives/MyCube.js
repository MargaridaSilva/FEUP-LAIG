/**
 * MyCube
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCube extends CGFobject
{
	constructor(scene, div)
	{
		super(scene);
        this.quad = new MyPlane(this.scene, div, div);
  };


  display(){

    //Z = +0.5
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.5);
    this.scene.rotate(Math.PI/2, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();

    //Z = -0.5
    this.scene.pushMatrix();
    this.scene.translate(0, 0, -0.5);
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();

    //X = +0.5
    this.scene.pushMatrix();
    this.scene.translate(0.5, 0, 0);
    this.scene.rotate(-Math.PI/2, 0, 0, 1);
    this.quad.display();
    this.scene.popMatrix();

    //X = -0.5
    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0, 0);
    this.scene.rotate(Math.PI/2, 0, 0, 1);
    this.quad.display();
    this.scene.popMatrix();

    //Y = +0.5
    this.scene.pushMatrix();
    this.scene.translate(0, 0.5, 0);
    this.quad.display();
    this.scene.popMatrix();

    //Y = -0.5
    this.scene.pushMatrix();
    this.scene.translate(0, -0.5, 0);
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();
    }

};