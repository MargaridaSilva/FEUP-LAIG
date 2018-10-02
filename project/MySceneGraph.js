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
var R_INDEX = 0;
var G_INDEX = 1;
var B_INDEX = 2;
var A_INDEX = 3;
var MAX_NUM_LIGHTS = 8;
var NAME = 0;
var TYPE = 1;
var DEFAULT_VALUE = 2;

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
    
        this.values = [];
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

        for (let index = 0; index < this.tagNames.length; index++) {
            var error;

            if ((error = this.processNode(index, nodeNames, nodes)) != null) {
                this.onXMLError(error);
                return;
            }
        }
    }

    processNode(tagIndex, nodeNames, nodes) {
        let error;
        let index;
        if ((index = nodeNames.indexOf(this.tagNames[tagIndex])) == -1)
            return "tag <" + this.tagNames[tagIndex] + "> missing";
        else {
            if (index != tagIndex)
                this.onXMLMinorError("tag <" + this.tagNames[tagIndex] + "> out of order");

            //Parse block

            /*
             * Muda o this da função para o scope da classe e não do vector
             */
            this.parseFunction = this.functionVect[tagIndex];
            if ((error = this.parseFunction(nodes[index])) != null)
                return error;
        }

    }

    /**
     * Parses the scene block
     * @param {XML scene element} sceneNode
     */
    parseScene(sceneNode) {
        let info = this.parseFields(sceneNode, [ ["root", "ss", undefined], ["axis_length", "ff", 3] ], "scene");
        
        this.values.scene = {
            root: info.root,
            axis_length: info.axis_length
        }
        this.log("Parsed Scene");
        return null;
    }


    /**
     * Parses the views block
     * @param {XML views element} viewsNode
     */
    parseViews(viewsNode) {
        this.views_default = this.reader.getString(viewsNode, 'default');

        let children = viewsNode.children;
        this.orthoViews = [];
        this.perspectiveViews = [];
        this.viewIds = [];
        let error = 0;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "perspective") {
                if ((error = this.parsePerspective(children[i])) != null)
                    return error;
            }
            else if (children[i].nodeName == "ortho") {
                if ((error = this.parseOrtho(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <views> block was ignored")
        }

        //There has to be at least one view
        if (this.viewIds.length == 0) {
            return "at least one view must be defined in <views> block";
        }

        this.log("Parsed Views");
        return null;
    }

    /**
     * Parses ortho views
     * @param {XML ortho element} orthoNode
     */
    parseOrtho(orthoNode) {
        //ID
        let orthoId = this.reader.getString(orthoNode, 'id');
        if (orthoId == null)
            return "no ID defined for view";        

        if (this.viewIds.indexOf(orthoId) != -1)
            return "ID must be unique for each view (conflict: ID = " + orthoId + ")";

        this.viewIds.push(orthoId);

        this.orthoViews[orthoId] = this.parseFields(orthoNode, [["near", "ff", 0.5], ["far", "ff", 500], ["left", "ff", 0], ["right", "ff", 0], ["top", "ff", 0], ["bottom", "ff", 0]], "views > ortho id = " + orthoId);

    }

    /**
     * Parses perspective views
     * @param {XML perspective element} perspectiveNode
     */
    parsePerspective(perspectiveNode) {
        //ID
        let perspectiveId = this.reader.getString(perspectiveNode, 'id');
        if (perspectiveId == null)
            return "no ID defined for light";


        for(let key in this.perspectiveViews){
            if(key == perspectiveId){
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";
            }
        }

        if (this.viewIds.indexOf(perspectiveId) != -1)
            return "ID must be unique for each view (conflict: ID = " + perspectiveId + ")";

        this.viewIds.push(perspectiveId);

        let info = this.parseFields(perspectiveNode, [["near", "ff", 0.5], ["far", "ff", 500], ["angle", "ff", 0]], "views > perspective id = " + perspectiveId);

        let children = perspectiveNode.children;
        let processFrom, processTo = false;
        let coordsF, coordsT;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "from") {
                if (!processFrom) {
                    coordsF = this.parseFields(children[i], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "views > perspective id = " + perspectiveId + " > from");
                    processFrom = true;
                }
                else this.onXMLMinorError("more than one <from> definitions in view id=" + perspectiveId + " ; only the first was considered");
            }
            else if (children[i].nodeName == "to") {
                if (!processTo) {
                    coordsT = this.parseFields(children[i], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "views > perspective id = " + perspectiveId + " > to");
                    processTo = true;
                }
                else this.onXMLMinorError("more than one <to> definitions in view id=" + perspectiveId + " ; only the first was considered");
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in view id=" + perspectiveId + "was ignored");
        }

        this.perspectiveViews[perspectiveId]={
            near: info.near,
            far: info.far,
            angle: info.angle,
            from: coordsF,
            to: coordsT
        }
    }

    /**
     * Parses the ambient block
     * @param {XML ambient element} ambientNode
     */

    parseAmbient(ambientNode) {

        let children = ambientNode.children;

        let nodeNames = [];
        let ambient, background;

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        //Parse ambient
        let ambientIndex = nodeNames.indexOf("ambient");

        if (ambientIndex != 0){
            this.log("problem in ambient definition");
        }
        else{
            ambient = this.parseFields(children[0], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 1]], "ambient > ambient");
        }

        //Parse background
        let backgroundIndex = nodeNames.indexOf("background");

        if (backgroundIndex != 1){
            this.log("problem in background definition");
        }
        else{
            background = this.parseFields(children[1], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 1]], "ambient > background");
        }

        this.ambient = {
            ambient: ambient,
            background: background
        }

        this.log("Parse Ambient");
        return null;
    }

    parseLights(lightsNode) {
        let children = lightsNode.children;
        this.omniLights = [];
        this.spotLights = [];
        this.lightIds = [];
        let error;

        for (let i = 0; i < children.length && i < MAX_NUM_LIGHTS; i++) {
            if (children[i].nodeName == "omni") {
                if ((error = this.parseOmni(children[i])) != null)
                    return error;
            }
            else if (children[i].nodeName == "spot") {
                if ((error = this.parseSpot(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <lights> block");
        }

        //There has to be at least one view
        if (this.lightIds.length == 0) {
            return "at least one light must be defined in <lights> block";
        }
        else if (this.lightIds.length >= MAX_NUM_LIGHTS) {
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights; Only the first were read");
        }
    }

    //TO DO
    parseOmni(omniNode) {
        //ID
        let omniId = this.reader.getString(omniNode, 'id');
        if (omniId == null)
            return "no ID defined for light";

        if (this.lightIds.indexOf(omniId) != -1)
            return "ID must be unique for each light (conflict: ID = " + omniId + ")";

        this.lightIds.push(omniId);

        let info = this.parseFields(omniNode, [["enabled", "tt", 0]], "lights > omni id = " + omniId);
        let enabled = info.enabled;

        let children = omniNode.children;

        let nodeNames = [];
        for (var j = 0; j < children.length; j++) {
            nodeNames.push(children[j].nodeName);
        }

        let locationIndex = nodeNames.indexOf("location");
        let ambientIndex = nodeNames.indexOf("ambient");
        let diffuseIndex = nodeNames.indexOf("diffuse");
        let specularIndex = nodeNames.indexOf("specular");
        let location, ambient, diffuse, specular;

        if (locationIndex == -1) {
            return "light location undefined for ID = " + omniId;
        }
        else {
            if (locationIndex != 0) {
                this.onXMLMinorError("light location out of order for ID =" + omniId);
            }
            location = this.parseFields(children[locationIndex], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0], ["w", "ff", 0]], "lights > omni id = " + omniId + " > location");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + omniId;
        }
        else {
            if (ambientIndex != 1) {
                this.onXMLMinorError("light ambient out of order for ID =" + omniId);
            }
            ambient = this.parseFields(children[ambientIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + omniId;
        }
        else {
            if (diffuseIndex != 2) {
                this.onXMLMinorError("light diffuse out of order for ID =" + omniId);
            }
            diffuse = this.parseFields(children[diffuseIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + omniId;
        }
        else {
            if (specularIndex != 3) {
                this.onXMLMinorError("light specular out of order for ID =" + omniId);
            }
            specular = this.parseFields(children[specularIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > specular");
        }

        this.omniLights[omniId] = {
            enabled: enabled,
            location: location,
            ambient: ambient,
            diffuse: diffuse,
            specular: specular
        }
    }


    parseSpot(spotNode) {
        //ID
        let spotId = this.reader.getString(spotNode, 'id');
        if (spotId == null)
            return "no ID defined for light";


        if (this.viewIds.indexOf(spotId) != -1)
            return "ID must be unique for each light (conflict: ID = " + spotId + ")";

        this.viewIds.push(spotId);

        let info = this.parseFields(spotNode, [["enabled", "tt", true], ["angle", "ff", 0], ["exponent", "ff", 0]], "lights > spot id = " + spotId);
        let enabled = info.enabled;
        let angle = info.angle;
        let exponent = info.exponent;

        let children = spotNode.children;

        let nodeNames = [];
        for (var j = 0; j < children.length; j++) {
            nodeNames.push(children[j].nodeName);
        }

        let locationIndex = nodeNames.indexOf("location");
        let targetIndex = nodeNames.indexOf("target");
        let ambientIndex = nodeNames.indexOf("ambient");
        let diffuseIndex = nodeNames.indexOf("diffuse");
        let specularIndex = nodeNames.indexOf("specular");
        let location, target, ambient, diffuse, specular;

        if (locationIndex == -1) {
            return "light location undefined for ID = " + spotId;
        }
        else {
            if (locationIndex != 0) {
                this.onXMLMinorError("light location out of order for ID =" + spotID);
            }
            location = this.parseFields(children[locationIndex], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0], ["w", "ff", 0]], "lights > spot id = " + spotId + " > location");
        }

        
        if (targetIndex == -1) {
            return "light target undefined for ID = " + spotId;
        }
        else {
            if (targetIndex != 1) {
                this.onXMLMinorError("light target out of order for ID =" + spotID);
            }
            target = this.parseFields(children[targetIndex], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "lights > spot id = " + spotId + " > target");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + spotId;
        }
        else {
            if (ambientIndex != 2) {
                this.onXMLMinorError("light ambient out of order for ID =" + spotID);
            }
            ambient = this.parseFields(children[ambientIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + spotId;
        }
        else {
            if (diffuseIndex != 3) {
                this.onXMLMinorError("light diffuse out of order for ID =" + spotID);
            }
            diffuse = this.parseFields(children[diffuseIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + spotId;
        }
        else {
            if (specularIndex != 4) {
                this.onXMLMinorError("light specular out of order for ID =" + spotID);
            }
            specular = this.parseFields(children[specularIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > specular");
        }

        this.spotLights[spotId] = {
            enabled: enabled,
            angle: angle,
            exponent: exponent,
            location: location,
            target: target,
            ambient: ambient,
            diffuse: diffuse,
            specular: specular};
    }

    parseTextures(texturesNode) {
        let children = texturesNode.children;
        this.textures = [];
        this.textureIds = [];
        let error;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "texture") {
                if ((error = this.parseTexture(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <textures> block")
        }

        //There has to be at least one texture
        if (this.textureIds.length == 0) {
            return "at least one texture must be defined in <textures> block";
        }
        this.log("Parsed Textures");
    }

    parseTexture(textureNode) {
        //ID
        let textureId = this.reader.getString(textureNode, 'id');
        if (textureId == null)
            return "no ID defined for texture";

        if (this.textureIds.indexOf(textureId) != -1)
            return "ID must be unique for each texture (conflict: ID = " + textureId + ")";
        
            this.textureIds.push(textureId);
    }
    
    parseMaterials(materialsNode) {
        let children = materialsNode.children;
        this.materials=[];
        this.materialIds = [];
        let error;
        
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                if ((error = this.parseMaterial(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <materials> block")
        }

        //There has to be at least one material
        if (this.materialIds.length == 0) {
            return "at least one material must be defined in <materials> block";
        }
        this.log("Parsed Materials");
    }

    parseMaterial(materialNode) {
        //ID
        let materialId = this.reader.getString(materialNode, 'id');
        if (materialId == null)
            return "no ID defined for material";

        if (this.materialIds.indexOf(materialId) != -1)
            return "ID must be unique for each material (conflict: ID = " + materialId + ")";

        this.materialIds.push(materialId);

        let info = this.parseFields(materialNode, [["shininess", "ff", 0]], "lights > material id = " + materialId + " > shininess");
       
        let children = materialNode.children;

        let nodeNames = [];
        for (var j = 0; j < children.length; j++) {
            nodeNames.push(children[j].nodeName);
        }

        let emissionIndex = nodeNames.indexOf("emission");
        let ambientIndex = nodeNames.indexOf("ambient");
        let diffuseIndex = nodeNames.indexOf("diffuse");
        let specularIndex = nodeNames.indexOf("specular");
        let emission, ambient, diffuse, specular;

        if (emissionIndex == -1) {
            return "material emission undefined for ID = " + materialId;
        }
        else {
            if (emissionIndex != 0) {
                this.onXMLMinorError("material emission out of order for ID =" + materialId);
            }
            emission = this.parseFields(children[emissionIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > emission");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + materialId;
        }
        else {
            if (ambientIndex != 1) {
                this.onXMLMinorError("light ambient out of order for ID =" + materialId);
            }
            ambient = this.parseFields(children[ambientIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + materialId;
        }
        else {
            if (diffuseIndex != 2) {
                this.onXMLMinorError("light diffuse out of order for ID =" + materialId);
            }
            diffuse = this.parseFields(children[diffuseIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + materialId;
        }
        else {
            if (specularIndex != 3) {
                this.onXMLMinorError("light specular out of order for ID =" + materialId);
            }
            specular = this.parseFields(children[specularIndex], [["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > specular");
        }

        this.materials[materialId] = {
            shininess: info.shininess,
            emission: emission, 
            ambient: ambient,
            diffuse: diffuse,
            specular: specular
        };
    }

    parseTransformations(transformationsNode) {
        let children = transformationsNode.children;
        let error;
        this.transformations = [];
        this.transformationIds = [];

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformation") {
                if ((error = this.parseTransformation(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <transformations> block")
        }

        //There has to be at least one transformation
        if (this.transformationIds.length == 0) {
            return "at least one transformation must be defined in <transformations> block";
        }

        this.log("Parsed Transformations");
    }

    parseTransformation(transformationNode) {
        //ID
        let transformationId = this.reader.getString(transformationNode, 'id');
        if (transformationId == null)
            return "no ID defined for transformation";

        if (this.transformationIds.indexOf(transformationId) != -1)
            return "ID must be unique for each transformation (conflict: ID = " + transformationId + ")";
            
        this.transformationIds.push(transformationId);

        let info;
        let children = transformationNode.children;
        this.scene.loadIdentity();

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "translate") {
                info = this.parseFields(children[i], [["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "tranformations > tranformation id = " + transformationId);
                this.scene.translate(info[0], info[1], info[2]);
            }
            else if (children[i].nodeName == "rotate") {
                info = this.parseFields(children[i], [["axis", "cc", 0], ["angle", "ff", 0]], "tranformations > tranformation id = " + transformationId);
                let radAngle = (info[1]*Math.PI)/180;
                switch(info[0]){
                    case "x":
                    this.scene.rotate(1, 0, 0, radAngle);
                    break;
                    case "y":
                    this.scene.rotate(0, 1, 0, radAngle);
                    break;
                    case "z":
                    this.scene.rotate(0, 0, 1, radAngle);
                    break;
                }
            }
            else if (children[i].nodeName == "scale") {
                info = this.parseFields(children[i], [["x", "ff", 1], ["y", "ff", 1], ["z", "ff", 1]], "tranformations > tranformation id = " + transformationId);
                this.scene.scale(info[0], info[1], info[2]);
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in transformation id = " + transformationId);
        }
        let finalMatrix;
        this.scene.getMatrix(finalMatrix);

        this.transformations[transformationId] = finalMatrix;
    }

    parsePrimitives(primitivesNode) {
        this.log("Parsed Primitives");
    }


    parseComponents(componentsNode) {
        this.log("Parsed Components");
    }

    parseFields(node, especificationArray, XMLsection) {
        let result = [];
        for (let i = 0; i < especificationArray.length; i++) {
            if (especificationArray[i][TYPE] == "ff") {
                let float = this.reader.getFloat(node, especificationArray[i][NAME]);
                if (float == null || isNaN(float)) {
                    this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                    float = especificationArray[i][DEFAULT_VALUE];
                }
                result[especificationArray[i][NAME]] = float;
            }
            else if (especificationArray[i][TYPE] == "ss") {
                let string = this.reader.getString(node, especificationArray[i][NAME]);
                if (string == null) {
                    this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                    string = especificationArray[i][DEFAULT_VALUE];
                }
                result[especificationArray[i][NAME]] = string;
            }
            else if (especificationArray[i][TYPE] == "tt") {
                let float = this.reader.getFloat(node, especificationArray[i][NAME]);
                if (float == null || (float != 0 && float != 1)) {
                    this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                    float = especificationArray[i][DEFAULT_VALUE];
                }
                result[especificationArray[i][NAME]] = float;
            }
            else if (especificationArray[i][TYPE] == "cc") {
                let string = this.reader.getString(node, especificationArray[i][NAME]);
                if (string == null || (string != "x" && string != "y" && string != "z")) {
                    this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                    string = especificationArray[i][DEFAULT_VALUE];
                }
                result[especificationArray[i][NAME]] = string;
            }

        }

        return result;
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