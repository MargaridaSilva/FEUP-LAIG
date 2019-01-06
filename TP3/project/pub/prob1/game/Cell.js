class Cell extends CGFobject {

    constructor(scene, row, col, div, id){
        super(scene);
        this.pos = {row: row, col: col};
        this.state = 'empty';
        this.object = new MyPlane(scene, div, div);
        this.id = id;

        Cell.boardMaterial = new CGFappearance(this.scene);
        Cell.boardMaterial.setSpecular(1, 1, 1, 1);
        Cell.boardMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        Cell.boardMaterial.setDiffuse(0.6, 0.6, 0.6, 1);
        Cell.boardMaterial.setTexture(this.scene.graph.game.board.cell);
    }

    setState(newState){
        this.state = newState;
    }

    getState(){
        return this.state;
    }
    
    display(dim){
        
        this.piece = Piece.pieces[this.state];
        
        let row = this.pos.row;
        let col = this.pos.col;

        /* Display board cell */
        this.scene.pushMatrix();

        this.scene.translate(col, 0, row);
        this.scene.registerForPick(this.id, this.object);

        Cell.boardMaterial.apply();
        this.object.display();

        this.scene.popMatrix();

        /* Display board piece */
        
        let info = [[col, 0, row], this.id];

        if(this.state != 'empty'){
            Piece.registerForDisplay(this.state, info);
        } 
        
    }

    toString(){
        return `cell(${this.pos.row},${this.pos.col},${this.state})`;
    }

    updateCoords(s, t){
    }

    update(){
        let piece = Piece.pieces[this.state];
        if (piece != undefined){
            let stop = piece.update();
            if (stop)
             this.changeState('');
        }
    }
    changeState(state){
        if (this.state == 'empty')
            this.state = state;
        else if (this.state == 'bAliv' || this.state == 'rAliv')
            this.state = this.state[0] + 'DeadProg';
        else this.state = this.state[0] + 'Dead';
    }

    setState(state){
        this.state = state;
    }

    revertState(){
        if (this.state == 'bAliv' || this.state == 'rAliv')
            this.state = 'empty';
        if (this.state == 'bDead')
            this.state = 'bAliv';
        if (this.state == 'rDead')
            this.state = 'rAliv';
    }
}

