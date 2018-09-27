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
        this.log("XML Loading finished.");
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
            var error;   
        
            if((error = this.processNode(index, nodeNames, nodes)) != null){
                this.log(error);
                return;
            }
        }
    }

    processNode(tagIndex, nodeNames, nodes){
        var error;
        var index;
        if ((index = nodeNames.indexOf(this.tagNames[tagIndex])) == -1)
            return "tag <" + this.tagNames[tagIndex] + "> missing";
        else {
            if (index != tagIndex)
                this.onXMLMinorError("tag <" + this.tagNames[tagIndex] + "> out of order");

            //Parse block

            /*
             *Muda o this da função para o scope da classe e não do vector
             */
            this.parseFunction = this.functionVect[tagIndex];
            if ((error = this.parseFunction(nodes[index])) != null)
                return error;
        }

    }

    

    parseScene(sceneNode){
        this.scene_root = this.reader.getString(sceneNode, 'root');
        this.scene_axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        this.log("Parsed Scene");

        return null;
    }

    


    parseViews(viewsNode){

        this.views_default = this.reader.getString(viewsNode, 'default');


        var children = viewsNode.children;
        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        
        var indexView = nodeNames.indexOf("ortho");

        if (indexView == -1) {
            indexView = nodeNames.indexOf("perspective");
        }

        this.views = [];
        
        this.log("Parse Views");
    }


    parseAmbient(ambientNode){
        this.log("Parse Ambient");

        var children = ambientNode.children;

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        //ambient::ambient
        let ambientIndex = nodeNames.indexOf("ambient");
        if (ambientIndex != 0)
        this.log("problem in ambient definition");
        else this.ambientAmbient = this.parseRGB(children[0]);

        //ambient::background
        let backgroundIndex = nodeNames.indexOf("background");
        if (backgroundIndex != 1)
        this.log("problem in background definition");
        else this.backgroundAmbient = this.parseRGB(children[1]);

    }


    parseLights(lightsNode){
        this.log("Enter lights");
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "omni") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";


            // Light enable/disable
            var lightEnable = true;
            
            var lightEnable = this.reader.getInteger(children[i], 'enable');
            if (lightEnable == null) {
                this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
            }

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // Gets indices of each element.
            var locationIndex = nodeNames.indexOf("location");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");

            
            // Retrieves the light position.
            var locationLight = [];
            if (locationIndex != -1) {
                // x
                var x = this.reader.getFloat(grandChildren[locationIndex], 'x');
                if (!(x != null && !isNaN(x)))
                    return "unable to parse x-coordinate of the light position for ID = " + lightId;
                else
                    locationLight.push(x);

                // y
                var y = this.reader.getFloat(grandChildren[locationIndex], 'y');
                if (!(y != null && !isNaN(y)))
                    return "unable to parse y-coordinate of the light position for ID = " + lightId;
                else
                    locationLight.push(y);

                // z
                var z = this.reader.getFloat(grandChildren[locationIndex], 'z');
                if (!(z != null && !isNaN(z)))
                    return "unable to parse z-coordinate of the light position for ID = " + lightId;
                else
                    locationLight.push(z);

                // w
                var w = this.reader.getFloat(grandChildren[locationIndex], 'w');
                if (!(w != null && !isNaN(w) && w >= 0 && w <= 1))
                    return "unable to parse x-coordinate of the light position for ID = " + lightId;
                else
                    locationLight.push(w);
            }
            else
                return "light position undefined for ID = " + lightId;

            
            // Retrieves the ambient component.
            var ambientIllumination = [];
            if (ambientIndex != -1) {
                // R
                var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
                if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
                    return "unable to parse R component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(r);

                // G
                var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
                if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
                    return "unable to parse G component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(g);

                // B
                var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
                if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
                    return "unable to parse B component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(b);

                // A
                var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
                if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
                    return "unable to parse A component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(a);
            }
            else
                return "ambient component undefined for ID = " + lightId;

            // TODO: Retrieve the diffuse component
            var diffuseIllumination = ambientIllumination;
            // TODO: Retrieve the specular component
            var specularIllumination = ambientIllumination;
            // TODO: Store Light global information.
            //this.lights[lightId] = ...           
            

            this.lights[lightId] = [[lightEnable], locationLight, ambientIllumination, diffuseIllumination, specularIllumination];

            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }


    parseTextures(texturesNode){
        this.log("Parse Textures");
    }


    parseMaterials(materialsNode){
        this.log("Parse Materials");
    }


    parseTransformations(transformationsNode){
        this.log("Parse Transformations");
    }


    parsePrimitives(primitivesNode){
        this.log("Parse Primitives");
    }


    parseComponents(componentsNode){
        this.log("Parse Components");
    }

    /**
     * Parses the RGB components
     * 
     */
    parseRGB(rgbNode){
        let rgb = [];

        // R
        var r = this.reader.getFloat(rgbNode, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            log("unable to parse R component");
        else
            rgb.push(r);

        // G
        var g = this.reader.getFloat(rgbNode, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            log("unable to parse G component");
        else
            rgb.push(g);

        // B
        var b = this.reader.getFloat(rgbNode, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            log("unable to parse B component");
        else
            rgb.push(b);

        // A
        var a = this.reader.getFloat(rgbNode, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            log("unable to parse A component");
        else
            rgb.push(a);

        
        return rgb;

    }

    /**
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
    }
}