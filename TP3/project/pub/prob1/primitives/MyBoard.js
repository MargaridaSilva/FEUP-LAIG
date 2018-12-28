class MyBoard extends CGFobject {

    constructor(scene, dim, div){
        super(scene);
        this.scene = scene;
        this.dim = dim;
        this.div = div;
        this.cells = [];
        this.pieces = [];

        this.initCells();
        MyPiece.initPieces(this.scene);
    }

    initCells(){
        for(let row = 0; row < this.dim; row++){
            this.cells[row] = [];
            for(let col = 0; col < this.dim; col++){
                this.cells[row][col] = new MyCell(this.scene, row, col, this.div, row*this.dim + col + 1);
            }
        }
    }

    display(){        
        this.scene.pushMatrix();
        this.scene.translate(-this.dim/2, 0, -this.dim/2);
        this.scene.translate(0.5, 0, 0.5);

        // draw objects
        for(let row = 0; row < this.dim; row++){
            for(let col = 0; col < this.dim; col++){
                this.cells[row][col].display();
            }
        }
        this.scene.popMatrix();
    }


    updateCoords(s, t){
    }

    toString(){
        //Not working yet
        let board = "[ ";

        this.cells.forEach(function(cell){
            board += cell.toString() + ', ';
        });

        board = board.substr(0, board.length - ', '.length);

        board += " ]";

        return board;
    }

    handlePicking(pickedElements){
        this.cells.forEach(function(cell){
            cell.handlePicking(pickedElements);
        });
    }

    movePieceToCell(row, col){
        this.cells[row - 1][col - 1].changeState();
    }
}