class MovingPiece extends CGFobject {

    constructor(scene, row, col, state){
        super(scene);
        this.originalpos = [row, col]
        this.pos = this.originalpos;
        this.height = 0;

        this.state = state;

        this.span = 1500;
        this.t = this.span;
        this.v = [0,0];

        this.end = true;
    }
    
    display(){        
        this.piece = Piece.pieces[this.state];

        let row = this.pos[0];
        let col = this.pos[1];


        this.scene.pushMatrix();
        this.scene.translate(col, this.height, row);

        if(this.piece != undefined){
            this.piece.setId(this.id);
            this.piece.display();
        } 

        this.scene.popMatrix();

    }

    updateCoords(s, t){
    }

    move(cell){
        if(this.scene.fastMode){
            this.span = 500;
        }
        else{
            this.span = 1100;
        }
        this.cell = cell;
        let row = cell.pos.row;
        let col = cell.pos.col;
        let vec = [row - this.pos[0], col - this.pos[1]];
        this.v = vec.div(this.span);
        this.t = 0;

        this.end = false;
    }

    easeInOutCubic(t) {
        return t<.5 ? 3*4*t*t : (2*t-2)*(2*t-2)+4*(t-1)*(2*t-2);
    }

    update(dt){
        if(!this.end){
            if(this.t < this.span){
                this.t += dt;
                this.pos = this.pos.add(this.v.mult(dt).mult(this.easeInOutCubic(this.t/this.span)));
                this.height += 0.01*(0.5 - this.t/this.span)*dt*this.easeInOutCubic(this.t/this.span);
            }
            else{
                this.end = true;
                this.cell.changeState(this.state);
                this.pos = this.originalpos;
            }
        }
        
    }
}