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
        this.graphs = [];
        this.graphIndex = 0;

        this.lastTime = null;
        this.dt = null;

    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.axis = new CGFaxis(this);

        this.enableTextures(true);
        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendEquation(this.gl.FUNC_ADD);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {

        for (var key in this.graph.perspectiveViews) {

            if (this.graph.perspectiveViews.hasOwnProperty(key)) {
                let view = this.graph.perspectiveViews[key];
                let position = vec3.fromValues(view.from.x, view.from.y, view.from.z);
                let target = vec3.fromValues(view.to.x, view.to.y, view.to.z);
                this.cameras[key] = new CGFcamera(view.angle, view.near, view.far, position, target);
            }

        }

        for (var key in this.graph.orthoViews) {

            if (this.graph.orthoViews.hasOwnProperty(key)) {
                var view = this.graph.orthoViews[key];
                var position = vec3.fromValues(view.from.x, view.from.y, view.from.z);
                var target = vec3.fromValues(view.to.x, view.to.y, view.to.z);
                var up = vec3.fromValues(0, 1, 0);
                this.cameras[key] = new CGFcameraOrtho(view.left, view.right, view.bottom, view.top, view.near, view.far, position, target, up);
            }
        }


        this.camera = this.cameras[this.graph.views_default];
        this.interface.setActiveCamera(this.camera);
        this.cameraAnimation = new CameraAnimation(this, this.camera);
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
        }

        for (var key in this.graph.spotLights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.spotLights.hasOwnProperty(key)) {
                var light = this.graph.spotLights[key];

                this.lights[i] = new CGFlight(this, i);
                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
                this.lights[i].setSpotDirection(light.target.x - light.location.x, light.target.y - light.location.y, light.target.z - light.location.z);
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
        this.changeGraph(this.graphIndex);
        this.eventEmitter =  new EventEmitter(); 

        this.time = 0;

        this.axis = new CGFaxis(this, this.graph.values.scene.axis_length);

        var background = this.graph.ambient.background;
        this.gl.clearColor(background.r, background.g, background.b, background.a);

        var ambient = this.graph.ambient.ambient;
        this.setGlobalAmbientLight(ambient.r, ambient.g, ambient.b, ambient.a);

        

        this.initCameras();

        this.lights = [];

        this.initLights();  
        
        this.scoreboard = new Scoreboard(this);
        this.game = new Game(this, 9, 1);
        let game = this.game;

        this.interfaceValues = {
            realisticPieces: false,
            highlightTiles: false,
            graphIndex: this.graphIndex,
            camera: 0,
            automaticCamera: true,
            turnTime: 10,
            gameMode: 0,
            difficulty: 0,
            player: 0,
            boardDim: 7,
            startGame: function(){game.start(this.boardDim, this.player, this.gameMode, this.difficulty, this.turnTime)},
            undoMove: function(){game.backToPreviousState()},
            watchMovie: function(){game.watchMovie()}
        }

        if (!this.sceneInited){
            this.interface.addGameButtons();
            this.interface.addLightsGroup(Array.prototype.merge(this.graph.omniLights, this.graph.spotLights));
        }

        this.setUpdatePeriod(60);

        this.sceneInited = true;
    }


    logPicking(){
        if (this.pickMode == false) {
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (var i=0; i< this.pickResults.length; i++) {
                    var obj = this.pickResults[i][0];
                    if (obj)
                    {
                        var customId = this.pickResults[i][1];				
                        console.log("Picked object: " + obj + ", with pick id " + customId);
                    }
                }
                this.pickResults.splice(0,this.pickResults.length);
            }		
        }
    }


    pickedElementsFunc(){
        if (this.pickMode == false) {
            if (this.pickResults != null && this.pickResults.length > 0)
                return this.pickResults;
        }

        return null;
    }


    changeCamera(){
        let global = Array.prototype.slice.call(this.cameras['global'].position, 0, -1);
        let player1 = Array.prototype.slice.call(this.cameras['Player1'].position, 0, -1);
        let player2 = Array.prototype.slice.call(this.cameras['Player2'].position, 0, -1);

        switch(parseInt(this.interfaceValues.camera)){
            case 0: this.cameraAnimation.animate(global,  [0, 0, 0]); break;
            case 1: this.cameraAnimation.animate(player1, [0, 0, 0]); break;
            case 2: this.cameraAnimation.animate(player2, [0, 0, 0]); break;
            default: break;
        }
    }

    changeGraph(graphIndex){
        this.graphIndex = graphIndex;
        this.graph = this.graphs[this.graphIndex];
    }

    /**
     * Displays the scene.
     */
    display() {
        let pickedElements = this.pickedElementsFunc();

        if(pickedElements){
            this.game.handlePicking(pickedElements);
        }
        this.pickResults.splice(0,this.pickResults.length);

        this.clearPickRegistration();

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
        this.axis.display();

        if (this.sceneInited) {
            let position = this.cameraAnimation.getPostition();
            this.lights[1].setPosition(position[0], position[1], position[2], position[3]);
            this.lights[1].setVisible(false);

            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        // this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        // this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }
            this.graph.displayScene();

            this.pushMatrix();
            this.scale(1.4, 1.4, 1.4);
            this.game.display();
            this.popMatrix();

            this.pushMatrix();
            this.translate(-9, 2.5, 0);
            this.rotate(Math.PI/2, 0, 1, 0);
            this.scale(1.5, 1.5, 0.5);
            this.scoreboard.display();
            this.popMatrix();

        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    update(currTime) {
        if (this.lastTime == null) {
            this.lastTime = currTime;
            return;
        }

        let dt = currTime - this.lastTime;
        this.lastTime = currTime;

        this.graph.update(dt);

        this.scoreboard.update(dt);

        this.cameraAnimation.update(dt);

        this.game.update(dt);
    }
}