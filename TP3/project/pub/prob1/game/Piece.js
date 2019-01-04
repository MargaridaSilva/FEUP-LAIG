class Piece extends CGFobject {

    constructor(scene, object, player, type){
        super(scene);
        this.object = object;
        this.id = 0;
        this.material = this.scene.graph.materials[player];
        this.type = type;
        this.state = type;
        if (this.state == 3)
            this.state = 1;
    }

    static initPieces(scene){
        let virus = new Virus(scene);
        Piece.pieces['bAliv'] =  new Piece(scene, virus, 'blue', 1);
        Piece.pieces['bDead'] =  new Piece(scene, virus, 'blue', 2);
        Piece.pieces['bDeadProg'] =  new Piece(scene, virus, 'blue', 3);
        Piece.pieces['rAliv'] =  new Piece(scene, virus, 'red', 1);
        Piece.pieces['rDead'] =  new Piece(scene, virus, 'red', 2);
        Piece.pieces['rDeadProg'] =  new Piece(scene, virus, 'red', 3);

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
    update(){
        if (this.type == 3)
            if (this.state < 2){
            this.state += 0.2;
                return false;
            }
            else {
                this.state = 1;
                return true;
            }
        else return false;
    }
}
Piece.pieces = [];
