/**
    * MyWater
    * @constructor
*/
class MyWater extends CGFobject{
    /**
     * Constructs an object of type MyWater
     * @param {CGFscene} scene 
     * @param {CGFtexture} texture 
     * @param {CGFtexture} heightmap 
     * @param {Number} parts 
     * @param {Number} heightscale 
     * @param {number} texscale 
     */
    constructor(scene, texture, heightmap, parts, heightscale, texscale){
        super(scene);
        this.water = new MyPlane(scene, parts, parts);        
        this.heightmap = heightmap;
        this.texture = texture;
        this.time = 0;
        this.shader = new CGFshader(this.scene.gl, "shaders/water_vert.glsl", "shaders/water_frag.glsl");
        this.shader.setUniformsValues({uWaterTexture: 1, uHeightScale: heightscale, uTexScale: texscale, uTimeFactor: this.time});
        
    }
    /**
    * Displays water with appropriate shaders
    */

    display(){
        this.scene.pushMatrix();

        this.heightmap.bind(0);
        this.texture.bind(1);
        
        this.scene.setActiveShader(this.shader);
        this.water.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }
    /**
    * Displays shaders state according with time
    */
    update(dT){
        this.time += dT;
        this.shader.setUniformsValues({uTimeFactor: this.time});
    }


    updateCoords(){
        
    }
}