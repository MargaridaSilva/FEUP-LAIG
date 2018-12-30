
class MyPiece extends CGFobject {

    constructor(scene, object, type){
        super(scene);
        this.object = object;
        this.id = 0;
        this.material = this.scene.graph.materials[type];
    }

    static initPieces(scene){
        MyPiece.pieces['bAliv'] =  new MyPiece(scene, new MySphere(scene, 0.3, 10, 10), 'bAliv');
        MyPiece.pieces['bDead'] =  new MyPiece(scene, new MySphere(scene, 0.3, 10, 10), 'bDead');
        MyPiece.pieces['rAliv'] =  new MyPiece(scene, new MySphere(scene, 0.3, 10, 10), 'rAliv');
        MyPiece.pieces['rDead'] =  new MyPiece(scene, new MySphere(scene, 0.3, 10, 10), 'rDead');

    }

    display(){        
        this.material.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0);
        this.scene.registerForPick(this.id, this.object);
        this.object.display();
        this.scene.popMatrix();

        this.id = 0;
 
    }

    setId(id){
        this.id = id;
    }

    updateCoords(s, t){
    }
}
MyPiece.pieces = [];
