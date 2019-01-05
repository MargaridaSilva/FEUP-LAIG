class Piece extends CGFobject {

    constructor(scene, object, player, type){
        super(scene);
        Piece.scene = scene;
        this.object = object;
        this.material = this.scene.graph.materials[player];
        this.type = type;
        this.state = type;
        if (this.state == 3)
            this.state = 1;
        
        /* shader */
        Piece.shader = new CGFshader(this.scene.gl, "shaders/piece_vert.glsl", "shaders/piece_frag.glsl");
        Piece.shader.setUniformsValues({zombieLevel: 1});
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

    static registerForDisplay(type, pos){
        if (Piece.piecesToDisplay.hasOwnProperty(type)){
            Piece.piecesToDisplay[type].push(pos);
        }
        else {
            Piece.piecesToDisplay[type] = [];
            Piece.piecesToDisplay[type].push(pos);
        }
    }

    static cleanRegisteredPiecesForDisplay(){
        Piece.piecesToDisplay = [];
    }

    static displayRegisteredPieces(){
        if (Piece.scene != undefined){

            /* Change shader */
            Piece.scene.setActiveShader(Piece.shader);

            for(let state in Piece.piecesToDisplay){
                if (Piece.piecesToDisplay.hasOwnProperty(state)){

                    /* Change state if different */
                    let zombieLevel = Piece.pieces[state].state;
                    if (zombieLevel != Piece.shader.uniforms.zombieLevel)
                        Piece.shader.setUniformsValues({zombieLevel: zombieLevel});
                    console.log(zombieLevel, state);
                    
                    for (let j = 0; j < Piece.piecesToDisplay[state].length; j++){
                        let piece = Piece.pieces[state];
                        let info = Piece.piecesToDisplay[state][j];
                        piece.display(info[0], info[1]);
                    }
                
                }     
            }

            /* Restore shader */
            Piece.scene.setActiveShader(Piece.scene.defaultShader);
        }
    }

    display(pos, id){        
        this.material.apply();
        this.scene.pushMatrix();

        this.scene.translate(0,0,0);
        this.scene.translate(0, 0.3, 0);
        this.scene.registerForPick(id, this.object);
        this.object.display();
        this.scene.popMatrix();
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

Piece.piecesToDisplay = [];
