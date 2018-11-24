class MyWater extends CGFobject{
    constructor(scene, texture, heightmap, parts, heightscale, texscale){
        super(scene);
        this.water = new MyPlane(scene, parts, parts);        
        this.heightmap = heightmap;
        this.texture = texture;
        this.time = 0;
        this.shader = new CGFshader(this.scene.gl, "shaders/water_vert.glsl", "shaders/water_frag.glsl");
        this.normal = new CGFtexture(scene, "scenes/images/normal.jpg");
        this.shader.setUniformsValues({uWaterTexture: 1, uNormalTexture: 2, uHeightScale: heightscale, uTexScale: texscale, uTimeFactor: this.time});
        
    }

    display(){
        this.scene.pushMatrix();

        this.heightmap.bind(0);
        this.texture.bind(1);
        this.normal.bind(2);
        
        this.scene.setActiveShader(this.shader);
        this.water.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }

    update(dT){
        this.time += dT;
        this.shader.setUniformsValues({uTimeFactor: this.time});
    }


    updateCoords(){
        
    }
}