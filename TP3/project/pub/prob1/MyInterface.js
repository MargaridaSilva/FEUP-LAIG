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
     * initKeys
     */
    initKeys() {
        this.processKeyboard = function () {};
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
    addGameButtons(filenames) {
        let options = this.gui.addFolder('Scenario');
        options.open();

        var self = this;
        let obj = {};
        
        for (let id in filenames){
            obj[filenames[id]] = id;
        }

        options.add(this.scene.interfaceValues, 'graphIndex', {
            'Bar': 0,
            'Home': 1
        }).name('Scenario').onChange(function (v) {
            self.scene.changeGraph(v);
        });

        /*options.add(this.scene.interfaceValues, 'graphIndex', obj).name('Scenario').onChange(function (v) {
            self.scene.onGraphLoaded();
        });
        */

        let cameraGroup = this.gui.addFolder('Camera settings');
        cameraGroup.open();

        cameraGroup.add(this.scene.interfaceValues, 'camera', {
            'Global'  : 0,
            'Player 1': 1,
            'Player 2': 2
        }).name('Camera').onChange(function (v) {
            self.scene.changeCamera();
        });

        cameraGroup.add(this.scene.interfaceValues, 'automaticCamera').name('Adjust camera to player').onChange(function (v){
            self.scene.eventEmitter.emit('automaticCamera');
        });

        let optionsGroup = this.gui.addFolder("Game Properties");
        optionsGroup.open();

        optionsGroup.add(this.scene.interfaceValues, 'boardDim', 5, 10).name('Board Dimension').step(1);
        optionsGroup.add(this.scene.interfaceValues, 'turnTime', 30, 300).name('Turn Timeout');
        optionsGroup.add(this.scene.interfaceValues, 'gameMode', {
            'Single Player': 0,
            'Multiplayer': 1,
            'AI vs AI': 2
        }).name('Game Mode');
        optionsGroup.add(this.scene.interfaceValues, 'difficulty', {
            'Easy': 0,
            'Medium': 1,
            'Hard': 2
        }).name('Difficulty');
        optionsGroup.add(this.scene.interfaceValues, 'player', {
            'Player 1': 0,
            'Player 2': 1
        }).name('Player');

        let gameActionsGroup = this.gui.addFolder('Game Actions');
        gameActionsGroup.open();

        gameActionsGroup.add(this.scene.interfaceValues, 'startGame').name('Start game');
        gameActionsGroup.add(this.scene.interfaceValues, 'undoMove').name('Undo move');
        gameActionsGroup.add(this.scene.interfaceValues, 'watchMovie').name('Watch movie');
    }

    changeCamera(value) {
        this.gui.__folders["Camera settings"].__controllers[0].setValue(value);
    }
}