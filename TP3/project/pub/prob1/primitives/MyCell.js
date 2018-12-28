class MyCell extends CGFobject {

    constructor(scene, row, col, div, id){
        super(scene);
        this.pos = {row: row, col: col};
        this.state = 'empty';
        this.object = new MyPlane(scene, div, div);
        this.id = id;

    }

    setState(newState){
        this.state = newState;
    }
  
    
    display(){        
        this.piece = MyPiece.pieces[this.state];

        let row = this.pos.row;
        let col = this.pos.col;


        if((row + col) % 2){
            this.scene.graph.materials.white.apply();
        }
        else{
            this.scene.graph.materials.black.apply();
        }

        this.scene.pushMatrix();

        this.scene.translate(col, 0, row);
        this.scene.registerForPick(this.id, this.object);

        if(this.scene.pickMode == true){
            this.object.display();
        }

        if(this.piece != undefined){
            this.piece.setId(this.id);
            this.piece.display();
        } 
        this.scene.popMatrix();

    }

    toString(){
        return `cell(${this.pos.row}, ${this.pos.col}, ${this.state})`;
    }

    updateCoords(s, t){
    }

    changeState(){
        console.log("Change state");
        if(this.state == 'empty')
            this.state = 'bAliv';
        else{
            this.state = 'empty';
        }

    }
}