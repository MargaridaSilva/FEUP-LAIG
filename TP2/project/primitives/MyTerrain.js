class MyTerrain extends CGFobject{

    constructor(scene, texture, heightmap, parts, heightscale){
        super(scene);
        this.terrain = new MyPlane(scene, parts, parts);
        
        this.heightmap = heightmap; //new CGFtexture(this, "textures/grass01_h.jpg");    
        this.texture = texture; //= new CGFtexture(this, "textures/grass01.jpg");

        this.shader = new CGFshader(this.scene.gl, "shaders/terrain_vert.glsl", "shaders/terrain_frag.glsl");
        this.shader.setUniformsValues({uSampler2: 1, normScale: heightscale});
    
        



    }

    display(){
        this.scene.pushMatrix();

        this.heightmap.bind(0);
        this.texture.bind(1);
        
        this.scene.setActiveShader(this.shader);
        this.terrain.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }

}