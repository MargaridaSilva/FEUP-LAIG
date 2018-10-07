var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;

        this.lightValues = {};
        this.viewValues = [];
        this.cameras = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.lights = [];
        
        this.sceneInited = false;

        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(100,150,150), vec3.fromValues(0,0,0));

        this.enableTextures(true);


        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);        
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {

        var i = 0;

        for(var key in this.graph.perspectiveViews){

            if(this.graph.perspectiveViews.hasOwnProperty(key)){
                var view = this.graph.perspectiveViews[key];
                var position = vec3.fromValues(view.from.x, view.from.y, view.from.z);
                var target = vec3.fromValues(view.to.x, view.to.y, view.to.z);
                this.cameras[key] = new CGFcamera(view.angle, view.near, view.far, position, target);
            }

        }

        //Falta alterar
        /*
        for(var key in this.graph.orthoViews){

            if(this.graph.orthoViews.hasOwnProperty(key)){
                var view = this.graph.orthoViews[key];
                var position = vec3.fromValues(view.from.x, view.from.y, view.from.z);
                var target = vec3.fromValues(view.to.x, view.to.y, view.to.z);
                this.cameras[key] = new CGFcamera(view.angle, view.near, view.far, position, target);
            }

        }*/
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.omniLights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.omniLights.hasOwnProperty(key)) {
                var light = this.graph.omniLights[key];
                //lights are predefined in cgfscene
                this.lights[i] = new CGFlight(this, i);
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);

                this.lights[i].setVisible(true);
                
                if (light.enabled)
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }

            if (this.graph.spotLights.hasOwnProperty(key)) {
                var light = this.graph.spotLights[key];
                //lights are predefined in cgfscene
                this.lights[i] = new CGFlight(this, i);
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
                this.lights[i].setSpotDirection(light.target.x, light.target.y, light.target.z);
                this.lights[i].setSpotCutOff(light.angle);
                this.lights[i].setSpotExponent(light.exponent);

                this.lights[i].setVisible(true);
                
                if (light.enabled)
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
       
        this.axis = new CGFaxis(this, this.graph.values.scene.axis_length);

        var background = this.graph.ambient.background;
        this.gl.clearColor(background.r, background.g, background.b, background.a);
        
        var ambient = this.graph.ambient.ambient;
        this.setGlobalAmbientLight(ambient.r, ambient.g, ambient.b, ambient.a);
        
        //this.sceneGraph = new SceneGraph(this.graph.values.scene.root, this.graph.components);

        this.interfaceValues = {
            view: this.graph.views_default
        }

        this.initCameras();
        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.omniLights);
        this.interface.addViewsGroup(this.graph.perspectiveViews);

        
        this.sceneInited = true;
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
        
        this.pushMatrix();

        if (this.sceneInited) {
            // Draw axis
                this.axis.display();

            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }


            // if(this.interfaceValues.view != this.currentView){
            //     console.log("Enter");
            //     this.camera = this.cameras[this.interfaceValues.view];
            //     this.currentView = this.interfaceValues.view;
            // }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            //this.sceneGraph.display();
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}