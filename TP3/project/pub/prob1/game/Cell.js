class Cell extends CGFobject {

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

    getState(){
        return this.state;
    }
    
    display(shader){
               
        this.piece = Piece.pieces[this.state];
        
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
            console.log(this.piece.state);
            shader.setUniformsValues({zombieLevel: this.piece.state}); 
            this.piece.display();
        } 
        this.scene.popMatrix();
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

    revertState(){
        if (this.state == 'bAliv' || this.state == 'rAliv')
            this.state = 'empty';
        if (this.state == 'bDead')
            this.state = 'bAliv';
        if (this.state == 'rDead')
            this.state = 'rAliv';
    }
}