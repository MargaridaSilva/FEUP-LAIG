class Piece extends CGFobject {

    constructor(scene, object, type){
        super(scene);
        this.object = object;
        this.id = 0;
        this.material = this.scene.graph.materials[type];
    }

    static initPieces(scene){
        Piece.pieces['bAliv'] =  new Piece(scene, new Virus(scene), 'bAliv');
        Piece.pieces['bDead'] =  new Piece(scene, new Virus(scene), 'bDead');
        Piece.pieces['rAliv'] =  new Piece(scene, new Virus(scene), 'rAliv');
        Piece.pieces['rDead'] =  new Piece(scene, new Virus(scene), 'rDead');

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
Piece.pieces = [];
