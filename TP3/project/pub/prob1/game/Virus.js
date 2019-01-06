class Virus extends CGFobject {
    constructor(scene) {
        super(scene);
        this.virus = this.scene.graph.game.pieces.model;
        this.scaleFactor = 0.015;
        
    }
    display(){
        this.scene.pushMatrix();
        this.scene.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
        this.scene.translate(15, 10, 0);
        this.virus.display();
        this.scene.popMatrix();
    }

}