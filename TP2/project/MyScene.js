/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class MyScene extends CGFscene {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.initCameras();

        this.axis = new CGFaxis(this);

        this.setAmbient(1.0, 1.0, 1.0, 1.0);

        this.appearance = new CGFappearance(this);
        this.appearance.setAmbient(0.1, 0.1, 0.1, 1);
        this.appearance.setDiffuse(0.9, 0.9, 0.9, 1);
        this.appearance.setSpecular(0.6, 0.6, 0.6, 1);	
        this.appearance.setShininess(5);
        
        this.heightMap = new CGFtexture(this, "textures/grass01_h.jpg");
        this.texture = new CGFtexture(this, "textures/grass01.jpg");

        this.terrain = new MyTerrain(this, this.texture, this.heightMap, 100, 30);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
  
    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.axis.display();    
    }

    onGraphLoaded(){

    }
}