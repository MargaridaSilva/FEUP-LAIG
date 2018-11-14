class MyCylinder extends CGFobject {

    constructor(scene, base, top, height, slices, stacks){
        this.scene = scene;
        this.height = height;
        this.lateral = new MyCylinderLateral(scene, base, top, height, slices, stacks);
        this.base1 = new MyCylinderBase(scene, slices, base);
        this.base2 = new MyCylinderBase(scene, slices, top);
    }

    display(){
        this.lateral.display();
        
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        this.base2.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.base1.display();
        this.scene.popMatrix();
    }
    updateCoords(s, t){
        this.lateral.updateCoords(s, t);
        this.base1.updateCoords(s, t);
        this.base2.updateCoords(s, t);
    }

}