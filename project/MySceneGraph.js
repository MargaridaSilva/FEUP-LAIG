// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
        /*
        Assincrono
        Não espera que o ficheiro seja carregado
        */


        this.tagNames = ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "primitives", "components"];
        this.functionVect = [this.parseScene, this.parseViews, this.parseAmbient, this.parseLights, this.parseTextures, this.parseMaterials, this.parseTransformations, this.parsePrimitives, this.parseComponents];
    }

        /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        console.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }


/**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

       

        // Processes each node, verifying errors.

       for(let index = 0; index < this.tagNames.length; index++){
           this.processNode(index, nodeNames,nodes);
       }
    }

    processNode(tagIndex, nodeNames, nodes){
        
        var error;
        var index;
        if ((index = nodeNames.indexOf(this.tagNames[tagIndex])) == -1)
            return "tag <" + this.tagNames[tagIndex] + "> missing";
        else {
            if (index != tagIndex + 1)
                console.log("tag <" + this.tagNames[tagIndex] + "> out of order");

            //Parse block
            if ((error = this.functionVect[tagIndex](nodes[index])) != null)
                return error;
        }

    }

    parseScene(sceneNode){
        console.log("Parse Scene");
    }



    parseViews(viewsNode){
        console.log("Parse Views");
    }


    parseAmbient(ambientNode){
        console.log("Parse Ambient");
    }


    parseLights(lightsNode){
        console.log("Parse Lights");
    }


    parseTextures(texturesNode){
        console.log("Parse Textures");
    }


    parseMaterials(materialsNode){
        console.log("Parse Materials");
    }


    parseTransformations(transformationsNode){
        console.log("Parse Transformations");
    }


    parsePrimitives(primitivesNode){
        console.log("Parse Primitives");
    }


    parseComponents(componentsNode){
        console.log("Parse Components");
    }

        /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
    }
}