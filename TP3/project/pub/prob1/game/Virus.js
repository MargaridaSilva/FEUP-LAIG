class Virus extends CGFobject {
    constructor(scene) {
        super(scene);
        this.virus = new CGFOBJModel(scene, 'game/modelling/models/virus.obj');
        this.scaleFactor = 0.015;
    }
    display(){
        this.scene.pushMatrix();
        this.scene.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
        this.virus.display();
        this.scene.popMatrix();
    }

}