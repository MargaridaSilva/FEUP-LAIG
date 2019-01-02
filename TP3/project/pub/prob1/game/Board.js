class Board extends CGFobject {

    constructor(scene, dim, div) {
        super(scene);
        this.scene = scene;
        this.dim = dim;
        this.div = div;
        this.cells = [];
        this.pieces = [];

        this.initMaterials();
        this.initTextures();

        this.initCells();
        Piece.initPieces(this.scene);

        this.quad = new MyPlane(this.scene, 50, 50);
        this.cube = new MyCube(this.scene, 50);

        let middle = Math.floor(this.dim / 2);

        this.piecesHolder = {
            bAliv: new MovingPiece(this.scene, this.dim + 2, middle, 'bAliv'),
            bDead: new MovingPiece(this.scene, this.dim + 2, middle + 2, 'bDead'),

            rAliv: new MovingPiece(this.scene, -1, middle, 'rAliv'),
            rDead: new MovingPiece(this.scene, -1, middle + 2, 'rDead')
        };
    }


    initMaterials() {
        this.boardMaterial = new CGFappearance(this.scene);
        this.boardMaterial.setSpecular(1, 1, 1, 1);
        this.boardMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.boardMaterial.setDiffuse(0.6, 0.6, 0.6, 1);

        this.coverMaterial = new CGFappearance(this.scene);
        this.coverMaterial.setSpecular(1, 1, 1, 1);
        this.coverMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.coverMaterial.setDiffuse(0.6, 0.6, 0.6, 1);
    }

    initTextures() {
        this.boardTexture = new CGFtexture(this.scene, "scenes/images/board2.png");
        this.boardMaterial.setTexture(this.boardTexture);

        this.coverTexture = new CGFtexture(this.scene, "scenes/images/stone3.jpg");
        this.coverMaterial.setTexture(this.coverTexture);
        this.coverMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

    initCells() {
        for (let row = 1; row <= this.dim; row++) {
            this.cells[row] = [];
            for (let col = 1; col <= this.dim; col++) {
                this.cells[row][col] = new Cell(this.scene, row, col, this.div, (row - 1) * this.dim + (col - 1) + 1);
            }
        }
    }


    initCellsState(board) {
        let noSpaceBoard = board.replace(/ +?/g, '');
        let reg = /cell\((\d),(\d),(\w+)\)/g;
        let match;

        while (match = reg.exec(noSpaceBoard)) {
            let row = parseInt(match[1]);
            let col = parseInt(match[2]);
            let state = match[3];
            this.cells[row][col].changeState(state);
        }
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(-this.dim / 2, 0, -this.dim / 2);
        this.scene.translate(-0.5, 0, -0.5);
        this.scene.translate(0, 0.01, 0);

        // draw objects
        for (let row = 1; row <= this.dim; row++) {
            for (let col = 1; col <= this.dim; col++) {
                this.cells[row][col].display();
            }
        }
        this.piecesHolder.rAliv.display();
        this.piecesHolder.rDead.display();
        this.piecesHolder.bAliv.display();
        this.piecesHolder.bDead.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
        this.boardMaterial.apply();
        this.scene.scale(this.dim, 1, this.dim);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.coverMaterial.apply();
        this.scene.scale(this.dim + this.dim * 0.2, 0.5, this.dim + this.dim * 0.2);
        this.scene.translate(0, -0.51, 0);
        this.cube.display();
        this.scene.popMatrix();
    }


    updateCoords(s, t) {}

    toString() {
        let board = "[ ";

        for (let row = 1; row <= this.dim; row++) {
            for (let col = 1; col <= this.dim; col++) {
                board += this.cells[row][col].toString() + ', ';
            }
        }

        board = board.substr(0, board.length - ', '.length);

        board += " ]";

        return board;
    }

    handlePicking(pickedElements) {
        console("Picking");
        this.cells.forEach(function (cell) {
            cell.handlePicking(pickedElements);
        });
    }

    movePieceToCell(row, col, symbol) {
        this.piecesHolder[symbol].move(this.cells[row][col]);
    }

    revertStateAt(row, col) {
        console.log(parseInt(row) - 1);
        return this.cells[parseInt(row)][parseInt(col)].revertState();
    }

    update(dt) {
        this.piecesHolder.rAliv.update(dt);
        this.piecesHolder.rDead.update(dt);
        this.piecesHolder.bAliv.update(dt);
        this.piecesHolder.bDead.update(dt);

        this.movementOccuring = !(this.piecesHolder.rAliv.end && this.piecesHolder.rDead.end && this.piecesHolder.bAliv.end && this.piecesHolder.bDead.end);
    }
}