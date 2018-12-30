class PieceHolder extends CGFobject {

    constructor(scene){
        super(scene);
        this.cube = new MyCube(this.scene);
        this.cylinder = new MyCylinder(this.scene,  1, 1, 1, 20, 1)
    }

    display(){

        this.scene.pushMatrix();
        this.scene.translate(0, 0.1, 0);
        this.scene.scale(0.3, 0.1, 0.3);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.scale(1, 0.1, 0.5);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();
    }


    update(dt){
    }
}