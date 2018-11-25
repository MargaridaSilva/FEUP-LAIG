/**
    * MyTerrain
    * @constructor
*/
class MyTerrain extends CGFobject{
    /**
     * Constructs an object of type MyTerrain
     * @param {CGFscene} scene 
     * @param {CGFtexture} texture 
     * @param {CGFtexture} heightmap 
     * @param {Number} parts 
     * @param {Number} heightscale 
     */
    constructor(scene, texture, heightmap, parts, heightscale){
        super(scene);
        this.terrain = new MyPlane(scene, parts, parts);
        
        this.heightmap = heightmap;
        this.texture = texture;

        this.shader = new CGFshader(this.scene.gl, "shaders/terrain_vert.glsl", "shaders/terrain_frag.glsl");
        this.shader.setUniformsValues({uSampler2: 1, normScale: heightscale});
    }

    /**
    * Displays terrain with appropriate shaders
    */

    display(){
        this.scene.pushMatrix();

        this.heightmap.bind(0);
        this.texture.bind(1);
        
        this.scene.setActiveShader(this.shader);
        this.terrain.display();
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
    }


    updateCoords(){
        
    }
}