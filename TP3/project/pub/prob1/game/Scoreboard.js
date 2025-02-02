class Scoreboard extends CGFobject {

    constructor(scene){
        super(scene);

        this.timeMs = 0;
        this.countdownTimeMs = 0;

        this.score1 = 0;
        this.score2 = 0;

        this.square = new MyQuad(scene, -1, -1.676470588, 1, 1.676470588);
        this.scoreboard = new MyQuad(scene, -1, -1, 1, 1);

        this.initMaterial();
        this.textures = this.scene.graph.textures;

        this.enable = false;
        this.countdownEnable = false;
    }

    start(){
        this.enable = true;
    }

    reset(){
        this.timeMs = 0;
        this.countdownTimeMs = 0;

        this.score1 = 0;
        this.score2 = 0;
    }

    stop(){
        this.enable = false;
    }

    stopCountdown(){
        this.countdownEnable = false;
    }

    startCountdown(){
        this.countdownEnable = true;
    }

    initMaterial(){
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.material.setSpecular(0.2, 0.2, 0.2, 1);
    }

    display(){
        this.material.setTexture(this.textures.glass);
        this.material.apply();

        this.scene.pushMatrix();
        this.scene.scale(3.5, 2.5, 2);
        this.scoreboard.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 1.3, 0.01);
        this.scene.scale(0.3, 0.3, 0.3);
        let timeS = Math.floor(this.timeMs / 1000);
        this.displayTime(timeS);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, -1.3, 0.01);
        this.scene.scale(0.3, 0.3, 0.3);
        let countdownTimeS = Math.floor(this.countdownTimeMs / 1000);
        this.displayTime(countdownTimeS);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-2, 0, 0.01);
        this.scene.scale(0.5, 0.5, 0.5);
        this.displayScore(this.score1);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(2, 0, 0.01);
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

            if(this.countdownEnable){
                if(this.countdownTimeMs > 0){
                    this.countdownTimeMs -= dt;
                }
                if(this.countdownTimeMs < 0){
                    this.countdownTimeMs = 0;
                    this.scene.eventEmitter.emit('zeroCountDown');
                }
            }           
        }
    }
}