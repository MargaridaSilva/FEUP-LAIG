class Scoreboard extends CGFobject {

    constructor(scene){
        super(scene);

        this.timeMs = 0;
        this.countdownTimeMs = 0;

        this.score1 = 0;
        this.score2 = 0;

        this.square = new MyQuad(scene, -1, -1.676470588, 1, 1.676470588);
        this.scoreboard = new MyCylinder(this.scene, 1, 1, 1, 4, 1);

        this.initMaterial();
        this.initTextures();

        this.enable = false;
    }

    start(){
        this.enable = true;
    }
    
    initMaterial(){
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.material.setSpecular(0.5, 0.5, 0.5, 1);

        this.scoreBoardMaterial = new CGFappearance(this.scene);
        this.scoreBoardMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.scoreBoardMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.scoreBoardMaterial.setSpecular(0.5, 0.5, 0.5, 1);
    }

    initTextures(){
        this.textures = [];

        for(let i = 0; i < 10; i++){
            this.textures[i] = new CGFtexture(this.scene, `scenes/images/numbers/tile00${i}.png`);
        }
        this.textures[':'] = new CGFtexture(this.scene, `scenes/images/numbers/tile010.png`);
    }

    display(){
        this.scoreBoardMaterial.apply();
        this.scene.pushMatrix();
        this.scene.scale(5, 3, 2);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.translate(0, 0, -0.5);
        this.scoreboard.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 1.3, 1.01);
        this.scene.scale(0.3, 0.3, 0.3);
        let timeS = Math.floor(this.timeMs / 1000);
        this.displayTime(timeS);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, -1.3, 1.01);
        this.scene.scale(0.3, 0.3, 0.3);
        let countdownTimeS = Math.floor(this.countdownTimeMs / 1000);
        this.displayTime(countdownTimeS);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-2, 0, 1.01);
        this.scene.scale(0.5, 0.5, 0.5);
        this.displayScore(this.score1);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(2, 0, 1.01);
        this.scene.scale(0.5, 0.5, 0.5);
        this.displayScore(this.score2);
        this.scene.popMatrix();
    }


    displayTime(timeS){
        this.min = Math.floor(timeS / 60);
        this.sec = timeS % 60;

        let numbers = [];

        numbers[0] = this.sec % 10;
        numbers[1] = Math.floor(this.sec / 10);
        numbers[2] = ':';
        numbers[3] = this.min % 10;
        numbers[4] = Math.floor(this.min / 10);

        for(let i = 0; i < numbers.length; i++){
            this.scene.pushMatrix();
            this.scene.translate(-2*i + 4, 0, 0);
            this.displayNumber(numbers[i]);
            this.scene.popMatrix();
        }
    }

    displayScore(score){
        let digU = score % 10;
        let digD = Math.floor(score / 10);

        this.scene.pushMatrix();
        this.scene.translate(1, 0, 0);
        this.displayNumber(digU);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1, 0, 0);
        this.displayNumber(digD);
        this.scene.popMatrix();
    }

    displayNumber(number){
        if((number >= 0 && number <= 9) || number == ":"){
            this.material.setTexture(this.textures[number])
            this.material.apply();
            this.square.display();
        }
    }

    updateCoords(s, t){

    }

    setCountdownTime(timeMs){
        this.countdownTimeMs = timeMs;
    }

    incrementScorePlayer1(){
        this.score1++;
    }

    incrementScorePlayer2(){
        this.score2++;
    }

    update(dt){

        if(this.enable){
            this.timeMs += dt;
        
            if(this.countdownTimeMs > 0){
                this.countdownTimeMs -= dt;
            }
            if(this.countdownTimeMs < 0){
                this.countdownTimeMs = 0;
            }
        }
    }
}