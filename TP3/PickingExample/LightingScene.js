
function LightingScene() {
    CGFscene.call(this);
    this.texture = null;
   	this.appearance = null;
   	this.surfaces = [];
   	this.translations = [];
}

LightingScene.prototype = Object.create(CGFscene.prototype);
LightingScene.prototype.constructor = LightingScene;

LightingScene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);


	this.player1Position = {x: -20, y: 15, z:0};
	this.player2Position = {x: 20, y: 15, z:0};
	this.initCameras();

    this.initLights();

    this.gl.clearColor(0,0,0, 1.0);
    this.gl.clearDepth(10000.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    
	this.axis=new CGFaxis(this);
	
	this.appearance = new CGFappearance(this);
	this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
	this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);	
	this.appearance.setShininess(120);


		
	this.white_appearance = new CGFappearance(this);
	this.white_appearance.setAmbient(0.1, 0.1, 0.1, 1);
	this.white_appearance.setDiffuse(1, 1, 1, 1);
	this.white_appearance.setSpecular(0.7, 0.7, 0.7, 1);	
	this.white_appearance.setShininess(120);


	this.black_appearance = new CGFappearance(this);
	this.black_appearance.setAmbient(0.1, 0.1, 0.1, 1);
	this.black_appearance.setDiffuse(0, 0, 0, 1);
	this.black_appearance.setSpecular(0.7, 0.7, 0.7, 1);	
	this.black_appearance.setShininess(120);
	
	this.object = new CGFplane(this);

	this.setPickEnabled(true);

	// this.cameraAxis = new CGFcameraAxis(0, 1, 0);
	this.gl.clearColor(115/255, 148/255, 181/255, 1);


};

LightingScene.prototype.initLights = function () {
	this.lights[0].setPosition(0,5,0,1);
	this.lights[0].setAmbient(0.1,0.1,0.1,1);
	this.lights[0].setDiffuse(0.9,0.9,0.9,1);
	this.lights[0].setSpecular(0,0,0,1);
	this.lights[0].enable();		
	this.lights[0].update();
};


LightingScene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(this.player2Position.x, this.player2Position.y, this.player2Position.z), vec3.fromValues(0, 0, 0));
};

LightingScene.prototype.logPicking = function ()
{
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

LightingScene.prototype.rotateCamera = function(camera, position1, position2, span) {

	// this.camera.rotate(CGFcameraAxis.X, )

}


LightingScene.prototype.display = function () 
{
	this.logPicking();
	this.clearPickRegistration();
	let position = this.camera.position;

	// this.camera.setPosition([position[0] + 0.01, position[1] + 0.01, position[2] + 0.01]);
	// console.log(this.camera.position);

	// this.camera.orbit(this.object, 0.05);

	// Clear image and depth buffer every time we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	//this.scale(5,5,5);
	
	// Update all lights used
	this.lights[0].update();

	// Draw axis
	this.axis.display();	
	
	this.appearance.apply();

	this.rotate(Math.PI/2.0,1,0,0);

	this.dim = 8;


	this.translate(-this.dim/2, -this.dim/2, 0);
	this.translate(0.5, 0.5, 0);

	// draw objects
	for (i =0; i< this.dim; i++) {
		for(j = 0; j < this.dim; j++){
			this.pushMatrix();

			// console.log(i*this.dim + j);

			if((j + i) % 2){
				this.white_appearance.apply();
			}
			else{
				this.black_appearance.apply();
			}

			this.translate(i, j, 0);

			this.registerForPick(i*this.dim + j + 1, this.object);
			
			this.rotate(-Math.PI/2, 1, 0, 0);
			this.object.display();
			this.popMatrix();
		}
	}
}
