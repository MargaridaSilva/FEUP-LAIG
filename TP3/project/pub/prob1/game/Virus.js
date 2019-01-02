class Virus extends CGFobject {

    constructor(scene, isZombie) {
        super(scene);
        /* model */
        this.virus = new CGFOBJModel(scene, 'game/modelling/models/virus.obj');
        
        /* scale */
        this.scaleFactor = 0.014;

        /* zombied */
        this.isZombie = isZombie;
        this.zombieLevel = 1;
        this.zombieThreshold = 10;

        /* shaders */
        this.shader = new CGFshader(this.scene.gl, "shaders/zombie_vert.glsl", "shaders/zombie_frag.glsl");
        this.shader.setUniformsValues({zombieLevel: this.zombieLevel});
    }

    display() {
        
        this.scene.pushMatrix();
        
        this.scene.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

        
        //this.scene.setActiveShader(this.shader);
        //this.shader.setUniformsValues({zombieLevel: this.zombieLevel});
        
        this.virus.display();
        
        //this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }

    update(){
        
        if (this.isZombie && (this.zombieLevel < this.zombieThreshold)){
            console.log('updating!!!' + this.zombieLevel);
            this.zombieLevel++;
        }
    }

}