/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();
        this.initKeys();

        // add a group of controls (and open/expand by defult)

        return true;
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                this.scene.lightValues[key] = Boolean(lights[key].enabled);
                group.add(this.scene.lightValues, key);
            }
        }
    }

    /**
    * Adds a folder containing the IDs of the views passed as parameter.
    * @param {array} views
    */
    addViewsGroup(views) {

        for (var key in views) {
            if (views.hasOwnProperty(key)) {
                this.scene.viewValues.push(key);
            }
        }

        var scene = this.scene;

        this.gui.add(this.scene.interfaceValues, 'view', this.scene.viewValues).onChange(function(view){
            scene.camera = scene.cameras[view];
            scene.interface.setActiveCamera(scene.camera);
        });
    }

    /**
	 * initKeys
	 */
    initKeys() {
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
        if (event.code == "KeyM")
            this.scene.graph.displayIndex++;
    };
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}