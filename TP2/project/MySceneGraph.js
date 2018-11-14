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

        this.tagNames = ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "animations", "primitives", "components"];
        this.functionVect = [this.parseScene, this.parseViews, this.parseAmbient, this.parseLights, this.parseTextures, this.parseMaterials, this.parseTransformations, this.parseAnimations, this.parsePrimitives, this.parseComponents];

        this.primitiveParse = {
            "rectangle": this.parseRectangle,
            "triangle" : this.parseTriangle,
            "sphere": this.parseSphere,
            "torus": this.parseTorus,
            "plane":this.parsePlane,
            "patch": this.parsePatch,
            "vehicle": this.parseVehicle,
            "cylinder2": this.parseCylinder2,
            "terrain": this.parseTerrain,
            "water": this.parseWater
        }
        
        this.values = [];
        this.deg2rad = Math.PI / 180;

        this.displayIndex = 0;

        this.materialStack = [];
        this.textureStack = [];
        this.sStack = [];
        this.tStack = [];
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
        let info = this.parseFields(sceneNode, ["single", ["root", "ss", undefined], ["axis_length", "ff", 3]], "scene");

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
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <views> block was ignored");
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

        //OTHER INFO
        let info = this.parseFields(orthoNode, ["single", ["near", "ff", 0.5], ["far", "ff", 500], ["left", "ff", 0], ["right", "ff", 0], ["top", "ff", 0], ["bottom", "ff", 0]], "views > ortho id = " + orthoId);

        let children = orthoNode.children;
        let processFrom, processTo = false;
        let coordsF, coordsT;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "from") {
                if (!processFrom) {
                    coordsF = this.parseFields(children[i], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "views > ortho id = " + orthoId + " > from");
                    processFrom = true;
                }
                else this.onXMLMinorError("more than one <from> definitions in view id=" + orthoId + " ; only the first was considered");
            }
            else if (children[i].nodeName == "to") {
                if (!processTo) {
                    coordsT = this.parseFields(children[i], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "views > ortho id = " + orthoId + " > to");
                    processTo = true;
                }
                else this.onXMLMinorError("more than one <to> definitions in view id=" + orthoId + " ; only the first was considered");
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in view id=" + orthoId + "was ignored");
        }
        this.orthoViews[orthoId] = {
            near: info.near,
            far: info.far,
            left: info.left,
            right: info.right,
            top: info.top,
            bottom: info.bottom,
            from: coordsF,
            to: coordsT
        }

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

        if (this.viewIds.indexOf(perspectiveId) != -1)
            return "ID must be unique for each view (conflict: ID = " + perspectiveId + ")";

        this.viewIds.push(perspectiveId);

        //OTHER INFO
        let info = this.parseFields(perspectiveNode, ["single", ["near", "ff", 0.5], ["far", "ff", 500], ["angle", "ff", 0]], "views > perspective id = " + perspectiveId);

        let children = perspectiveNode.children;
        let processFrom, processTo = false;
        let coordsF, coordsT;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "from") {
                if (!processFrom) {
                    coordsF = this.parseFields(children[i], ["all", ["x", "ff", 150], ["y", "ff", 150], ["z", "ff", 150]], "views > perspective id = " + perspectiveId + " > from");
                    processFrom = true;
                }
                else this.onXMLMinorError("more than one <from> definitions in view id=" + perspectiveId + " ; only the first was considered");
            }
            else if (children[i].nodeName == "to") {
                if (!processTo) {
                    coordsT = this.parseFields(children[i], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "views > perspective id = " + perspectiveId + " > to");
                    processTo = true;
                }
                else this.onXMLMinorError("more than one <to> definitions in view id=" + perspectiveId + " ; only the first was considered");
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in view id=" + perspectiveId + "was ignored");
        }

        this.perspectiveViews[perspectiveId] = {
            near: info.near,
            far: info.far,
            angle: info.angle * this.deg2rad,
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

        if (ambientIndex != 0) {
            this.log("problem in ambient definition");
        }
        else {
            ambient = this.parseFields(children[0], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 1]], "ambient > ambient");
        }

        //Parse background
        let backgroundIndex = nodeNames.indexOf("background");

        if (backgroundIndex != 1) {
            this.log("problem in background definition");
        }
        else {
            background = this.parseFields(children[1], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 1]], "ambient > background");
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

    parseOmni(omniNode) {
        //ID
        let omniId = this.reader.getString(omniNode, 'id');
        if (omniId == null)
            return "no ID defined for light";

        if (this.lightIds.indexOf(omniId) != -1)
            return "ID must be unique for each light (conflict: ID = " + omniId + ")";

        this.lightIds.push(omniId);

        //OTHER INFO
        let info = this.parseFields(omniNode, ["single", ["enabled", "tt", 0]], "lights > omni id = " + omniId);
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
            location = this.parseFields(children[locationIndex], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0], ["w", "ff", 0]], "lights > omni id = " + omniId + " > location");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + omniId;
        }
        else {
            if (ambientIndex != 1) {
                this.onXMLMinorError("light ambient out of order for ID =" + omniId);
            }
            ambient = this.parseFields(children[ambientIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + omniId;
        }
        else {
            if (diffuseIndex != 2) {
                this.onXMLMinorError("light diffuse out of order for ID =" + omniId);
            }
            diffuse = this.parseFields(children[diffuseIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + omniId;
        }
        else {
            if (specularIndex != 3) {
                this.onXMLMinorError("light specular out of order for ID =" + omniId);
            }
            specular = this.parseFields(children[specularIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > omni id = " + omniId + " > specular");
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


        if (this.lightIds.indexOf(spotId) != -1)
            return "ID must be unique for each light (conflict: ID = " + spotId + ")";

        this.lightIds.push(spotId);

        //OTHER INFO
        let info = this.parseFields(spotNode, ["single", ["enabled", "tt", true], ["angle", "ff", 0], ["exponent", "ff", 0]], "lights > spot id = " + spotId);
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
            location = this.parseFields(children[locationIndex], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0], ["w", "ff", 0]], "lights > spot id = " + spotId + " > location");
        }


        if (targetIndex == -1) {
            return "light target undefined for ID = " + spotId;
        }
        else {
            if (targetIndex != 1) {
                this.onXMLMinorError("light target out of order for ID =" + spotID);
            }
            target = this.parseFields(children[targetIndex], ["all", ["x", "ff", 5], ["y", "ff", 5], ["z", "ff", 5]], "lights > spot id = " + spotId + " > target");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + spotId;
        }
        else {
            if (ambientIndex != 2) {
                this.onXMLMinorError("light ambient out of order for ID =" + spotID);
            }
            ambient = this.parseFields(children[ambientIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + spotId;
        }
        else {
            if (diffuseIndex != 3) {
                this.onXMLMinorError("light diffuse out of order for ID =" + spotID);
            }
            diffuse = this.parseFields(children[diffuseIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + spotId;
        }
        else {
            if (specularIndex != 4) {
                this.onXMLMinorError("light specular out of order for ID =" + spotID);
            }
            specular = this.parseFields(children[specularIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > spot id = " + spotId + " > specular");
        }

        this.spotLights[spotId] = {
            enabled: enabled,
            angle: angle,
            exponent: exponent,
            location: location,
            target: target,
            ambient: ambient,
            diffuse: diffuse,
            specular: specular
        };
    }

    parseTextures(texturesNode) {
        let children = texturesNode.children;
        this.textures = [];
        this.textureIds = [];
        let error;

        this.textures["warning"] = new CGFtexture(this.scene, "scenes/images/warning.jpg");

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

        //OTHER INFO

        let file = this.reader.getString(textureNode, 'file');
        if (file == null)
            return "no file defined for texture id = " + textureId;

        this.textureIds.push(textureId);
        this.textures[textureId] = new CGFtexture(this.scene, file);
    }

    parseMaterials(materialsNode) {
        let children = materialsNode.children;
        this.materials = [];
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

        //OTHER INFO
        let info = this.parseFields(materialNode, ["single", ["shininess", "ff", 0]], "lights > material id = " + materialId + " > shininess");

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
            emission = this.parseFields(children[emissionIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > emission");
        }

        if (ambientIndex == -1) {
            return "light ambient undefined for ID = " + materialId;
        }
        else {
            if (ambientIndex != 1) {
                this.onXMLMinorError("light ambient out of order for ID =" + materialId);
            }
            ambient = this.parseFields(children[ambientIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > ambient");
        }

        if (diffuseIndex == -1) {
            return "light diffuse undefined for ID = " + materialId;
        }
        else {
            if (diffuseIndex != 2) {
                this.onXMLMinorError("light diffuse out of order for ID =" + materialId);
            }
            diffuse = this.parseFields(children[diffuseIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > diffuse");
        }
        if (specularIndex == -1) {
            return "light specular undefined for ID = " + materialId;
        }
        else {
            if (specularIndex != 3) {
                this.onXMLMinorError("light specular out of order for ID =" + materialId);
            }
            specular = this.parseFields(children[specularIndex], ["single", ["r", "ff", 0], ["g", "ff", 0], ["b", "ff", 0], ["a", "ff", 0]], "lights > material id = " + materialId + " > specular");
        }

        let material = new CGFappearance(this.scene);
        material.setEmission(emission.r, emission.g, emission.b, emission.a);
        material.setAmbient(ambient.r, ambient.g, ambient.b, ambient.a);
        material.setDiffuse(diffuse.r, diffuse.g, diffuse.b, diffuse.a);
        material.setSpecular(specular.r, specular.g, specular.b, specular.a);
        material.setShininess(info.shininess);


        this.materials[materialId] = material;

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

        //OTHER INFO
        let info;
        let children = transformationNode.children;
        this.scene.pushMatrix();
        this.scene.loadIdentity();

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "translate") {
                info = this.parseFields(children[i], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "transformations > transformation id = " + transformationId);
                this.scene.translate(info.x, info.y, info.z);
            }
            else if (children[i].nodeName == "rotate") {
                info = this.parseFields(children[i], ["single", ["axis", "cc", 0], ["angle", "ff", 0]], "transformations > transformation id = " + transformationId);
                let radAngle = info.angle * this.deg2rad;
                switch (info.axis) {
                    case "x":
                        this.scene.rotate(radAngle, 1, 0, 0);
                        break;
                    case "y":
                        this.scene.rotate(radAngle, 0, 1, 0);
                        break;
                    case "z":
                        this.scene.rotate(radAngle, 0, 0, 1);
                        break;
                }
            }
            else if (children[i].nodeName == "scale") {
                info = this.parseFields(children[i], ["all", ["x", "ff", 1], ["y", "ff", 1], ["z", "ff", 1]], "transformations > transformation id = " + transformationId);
                this.scene.scale(info.x, info.y, info.z);
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in transformation id = " + transformationId);
        }
        let finalMatrix = this.scene.getMatrix();
        this.scene.popMatrix();

        this.transformations[transformationId] = finalMatrix;
    }


    parseAnimations(animationsNode) {
        let children = animationsNode.children;
        this.linearAnimations = [];
        this.circularAnimations = [];

        for (let i = 0; i < children.length; i++) {

            //ID
            let animationId = this.reader.getString(children[i], 'id');
            if (animationId == null)
                return "no ID defined for animation";

            if (children[i].nodeName == "linear") {

                if (this.linearAnimations.hasOwnProperty(animationId))
                    return "ID must be unique for each primitive (conflict: ID = " + animationId + ")";

                let grandchildren = children[i].children;
                let controlpoint, controlpoints = [];

                for (let j = 0; j < grandchildren.length; j++) {
                    if (grandchildren[j].nodeName == "controlpoint") {
                        controlpoint = this.parseFields(grandchildren[j], ["all", ["xx", "ff", 0], ["yy", "ff", 0], ["zz", "ff", 0]], "animations > linear animation id =" + animationId);
                        controlpoints.push(controlpoint);
                    }
                    else this.onXMLMinorError("inappropriate tag <" + grandchildren[j].nodeName + "> in linear animation id = " + animationId + " was ignored");
                }
                if (controlpoints.length < 2)
                    return "Unsufficient controlpoints for linear animation id =" + animationId;

                console.log(animationId);
                this.linearAnimations[animationId] = controlpoints;

            }
            else if (children[i].nodeName == "circular") {
                let circularAnimation;

                if (this.circularAnimations.hasOwnProperty(animationId))
                    return "ID must be unique for each primitive (conflict: ID = " + animationId + ")";

                circularAnimation = this.parseFields(children[i], ["single", ["span", "ff", 0], ["center", "ff", 0], ["radius", "ff", 0], ["startang", "ff", 0], ["rotang", "ff", 0]], "animations > circular animation id =" + animationId);
                this.circularAnimations[animationId] = circularAnimation;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in animations node was ignored");
        }
        this.log("Parsed Animations");
    }

    parsePrimitives(primitivesNode) {

        let children = primitivesNode.children;
        this.primitiveIds = [];
        this.primitives = [];

        let error;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "primitive") {
                //ID
                let primitiveId = this.reader.getString(children[i], 'id');
                if (primitiveId == null)
                    return "no ID defined for primitive";

                if (this.primitiveIds.indexOf(primitiveId) != -1)
                    return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

                this.primitiveIds.push(primitiveId);

                if ((error = this.parsePrimitive(children[i], primitiveId)) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <primitives> block was ignored");
        }

        this.log("Parsed Primitives");
    }

    parsePrimitive(primitiveNode, primitiveId) {
        let children = primitiveNode.children;
        let error;

        for (let i = 0; i < children.length; i++) {
            if (this.primitiveParse.hasOwnProperty(children[i].nodeName)) {
                console.log(children[i].nodeName);
                this.primitiveFunction = this.primitiveParse[children[i].nodeName];
                error = this.primitiveFunction(children[i], primitiveId);
                if (error != null)
                    return error;
                
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <primitives> block was ignored")
        }

        //There has to be at least one primitive
        if (this.primitiveIds.length == 0) {
            return "at least one primitive must be defined in <primitives> block";
        }
    }

    parseRectangle(rectangleNode, primitiveId) {

        //INFO
        let info;
        console.log(this);
        info = this.parseFields(rectangleNode, ["all", ["x1", "ff", -0.5], ["y1", "ff", -0.5], ["x2", "ff", 0.5], ["y2", "ff", 0.5]], "primitives > rectangle id = " + primitiveId);
        this.primitives[primitiveId] = new MyQuad(this.scene, info.x1, info.y1, info.x2, info.y2);
    }

    parseTriangle(triangleNode, primitiveId) {

        //INFO
        let info;
        info = this.parseFields(triangleNode, ["all", ["x1", "ff", -0.5], ["y1", "ff", -0.288], ["z1", "ff", 0], ["x2", "ff", 0.5], ["y2", "ff", -0.288], ["z2", "ff", 0], ["x3", "ff", 0], ["y3", "ff", 0.577], ["z3", "ff", 0]], "primitives > triangle id = " + primitiveId);

        this.primitives[primitiveId] = new MyTriangle(this.scene, info.x1, info.y1, info.z1, info.x2, info.y2, info.z2, info.x3, info.y3, info.z3);
    }

    parseCylinder(cylinderNode, primitiveId) {

        //INFO
        let info;
        info = this.parseFields(cylinderNode, ["all", ["base", "ff", 1], ["top", "ff", 1], ["height", "ff", 3], ["slices", "ii", 100], ["stacks", "ii", 10]], "primitives > cylinder id = " + primitiveId);

        this.primitives[primitiveId] = new MyCylinder(this.scene, info.base, info.top, info.height, info.slices, info.stacks);
    }

    parseSphere(sphereNode, primitiveId) {

        //INFO
        let info;
        info = this.parseFields(sphereNode, ["all", ["radius", "ff", 1], ["slices", "ii", 100], ["stacks", "ii", 100]], "primitives > sphere id = " + primitiveId);

        this.primitives[primitiveId] = new MySphere(this.scene, info.radius, info.slices, info.stacks);
    }

    parseTorus(torusNode, primitiveId) {

        //INFO
        let info;
        info = this.parseFields(torusNode, ["all", ["inner", "ff", 1], ["outer", "ff", 2], ["slices", "ii", 100], ["loops", "ii", 100]], "primitives > torus id = " + primitiveId);

        this.primitives[primitiveId] = new MyTorus(this.scene, info.inner, info.outer, info.slices, info.loops);
    }
    parsePlane(planeNode, primitiveId) {
        //INFO
        let info;
        info = this.parseFields(planeNode, ["all", ["npartsU", "ii", 1], ["npartsV", "ff", 1]], "primitives > plane id = " + primitiveId);

        this.primitives[primitiveId] = new MyPlane(this.scene, info.npartsU, info.npartsV);
    }
    parsePatch(patchNode, primitiveId) {
        //INFO
        let info;
        info = this.parseFields(planeNode, ["all", ["npartsU", "ii", 1], ["npartsV", "ff", 1]], "primitives > patch id = " + primitiveId);

        let children = patchNode.children;
        let controlpoint, controlpoints = [];

        for (let j = 0; j < children.length; j++) {
            if (children[j].nodeName == "controlpoint") {
                controlpoint = this.parseFields(children[j], ["all", ["xx", "ff", 0], ["yy", "ff", 0], ["zz", "ff", 0]], "primitives > patch id =" + animationId);
                controlpoints.push(controlpoint);
            }
            else this.onXMLMinorError("inappropriate tag <" + children[j].nodeName + "> in patch  id = " + primitiveId + " was ignored");
        }
        if (controlpoints.length < 2)
            return "Unsufficient controlpoints for patch id =" + animationId;

        this.primitives[primitiveId] = new MyPatch(this.scene, info.npartsU, info.npartsV, controlpoints);
    }

    parseVehicle(vehicleNode, primitiveId) {
        this.primitives[primitiveId] = new MyVehicle(this.scene);
    }

    parseCylinder2(cylinder2Node, primitiveId) {
        //INFO
        let info;
        info = this.parseFields(cylinder2Node, ["all", ["base", "ff", 1], ["top", "ff", 1], ["height", "ff", 1], ["slices", "ii", 1], ["stacks", "ii", 1]], "primitives > cylinder2 id = " + primitiveId);

        this.primitives[primitiveId] = new MyCylinder2(this.scene, info.base, info.top, info.height, info.slices, info.stacks);
    }
    parseTerrain(terrainNode, primitiveId) {
        //IDS
        let idtexture = this.reader.getString(children[i], 'idtexture');
        if (idtexture == null)
            return "no idtexture defined for terrain in primitive id = " + primitiveId;

        if (!this.textures.hasOwnProperty(idtexture))
            return "texture not found for idtexture of terrain in primitive id = " + primitiveidID;

        let idheightmap = this.reader.getString(children[i], 'idheightmap');
        if (idheightmap == null)
            return "no idheight defined for terrain in primitive id = " + primitiveId;

        if (!this.textures.hasOwnProperty(idheightmap))
            return "texture not found for idheightmap of terrain in primitive id = " + primitiveidID;

        //INFO
        let info;
        info = this.parseFields(terrainNode, ["all", ["parts", "ii", 1], ["heightscale", "ff", 1]], "primitives > terrain id = " + primitiveId);

        this.primitives[primitiveId] = new MyTerrain(this.scene, idtexture, idheightmap, info.parts, info.heightscale);
    }

    parseWater(waterNode, primitiveId) {
        //IDS
        let idtexture = this.reader.getString(children[i], 'idtexture');
        if (idtexture == null)
            return "no idtexture defined for water in primitive id = " + primitiveId;

        if (!this.textures.hasOwnProperty(idtexture))
            return "texture not found for idtexture of water in primitive id = " + primitiveidID;

        let idwavemap = this.reader.getString(children[i], 'idwavemap');
        if (idwavemap == null)
            return "no idwavemap defined for water in primitive id = " + primitiveId;

        if (!this.textures.hasOwnProperty(idwavemap))
            return "texture not found for idwavemap of water in primitive id = " + primitiveid;

        //INFO
        let info;
        info = this.parseFields(terrainNode, ["all", ["parts", "ii", 1], ["heightscale", "ff", 1], ["texscale", "ff", 1]], "primitives > water id = " + primitiveId);

        this.primitives[primitiveId] = new MyWater(this.scene, idtexture, idwavemap, info.parts, info.heightscale, info.texscale);
    }

    parseComponents(componentsNode) {

        let children = componentsNode.children;
        this.components = [];
        this.componentIds = [];
        let error;
        this.childComponentIds = [];

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "component") {
                if ((error = this.parseComponent(children[i])) != null)
                    return error;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in <components> block");
        }

        //There has to be at least one component
        if (this.componentIds.length == 0) {
            return "at least one component must be defined in <components> block";
        }

        for (let i = 0; i < this.childComponentIds.length; i++) {
            if (this.componentIds.indexOf(this.childComponentIds[i]) == -1)
                return "unreferenced component child with ID = " + this.childComponentIds[i];
        }

        let rootMaterials = this.components[this.values.scene.root].materials;
        this.rootTexture = this.components[this.values.scene.root].texture.id;
        this.rootTS = this.components[this.values.scene.root].texture.length_s;
        this.rootTT = this.components[this.values.scene.root].texture.length_t;
        let nMaterials = Object.keys(rootMaterials).length;
        this.rootMaterial = this.components[this.values.scene.root].materials[this.displayIndex % nMaterials];

        if (this.rootMaterial == "inherit") {
            for (let key in this.materials) {
                this.rootMaterial = key;
                break;
            }
        }

        if (this.rootTexture == "none" || this.rootTexture == "inherit") {
            this.onXMLMinorError("the root component should have a defined texture, instead of being " + this.rootTexture + "; warning texture was applied");
            this.rootTexture = this.textures[0];
            this.rootTS = 1.0;
            this.rootTT = 1.0;
        }
        if (this.rootMaterial == "inherit") {
            this.onXMLMinorError("the root component should have a defined material, instead of being inherit; first material was assumed");
            for (let key in this.materials) {
                this.rootMaterial = key;
                break;
            }
        }

        this.log("Parsed Components");

    }

    parseComponent(componentNode) {
        let error = null;
        //ID
        let componentId = this.reader.getString(componentNode, 'id');
        if (componentId == null)
            return "no ID defined for component";

        if (this.componentIds.indexOf(componentId) != -1)
            return "ID must be unique for each component (conflict: ID = " + componentId + ")";

        this.componentIds.push(componentId);


        //OHTER INFO
        let children = componentNode.children;
        let nodeNames = [];
        for (var j = 0; j < children.length; j++) {
            nodeNames.push(children[j].nodeName);
        }

        let transfIndex = nodeNames.indexOf("transformation");
        let materialIndex = nodeNames.indexOf("materials");
        let textureIndex = nodeNames.indexOf("texture");
        let animationIndex = nodeNames.indexOf("animations");
        let childrenIndex = nodeNames.indexOf("children");

        this.components[componentId] = {
            transformation: null,
            animations: [],
            materials: [],
            texture: null,
            children: []
        };


        //Transformation
        if (transfIndex == -1) {
            return "component transformation undefined for ID = " + componentId;
        }
        else {
            if (transfIndex != 0) {
                this.onXMLMinorError("component transformation out of order for ID =" + componentId);
            }
            error = this.parseComponentTransf(children[transfIndex], componentId);
            if (error != null)
                return (error);
        }


        //Animations
        if (animationIndex != -1) {
            if (animationIndex != 1) {
                this.onXMLMinorError("component animation out of order for ID =" + componentId);
            }
            error = this.parseComponentAnimation(children[animationIndex], componentId);
            if (error != null)
                return (error);
        }

        //Material
        if (materialIndex == -1) {
            return "component materials undefined for ID = " + componentId;
        }
        else {
            if (materialIndex != 1 || (materialIndex != 2 && animationIndex != -1)) {
                this.onXMLMinorError("component materials out of order for ID =" + componentId);
            }
            error = this.parseComponentMaterials(children[materialIndex], componentId);
            if (error != null)
                return (error);
        }

        //Texture
        if (textureIndex == -1) {
            return "component texture undefined for ID = " + componentId;
        }
        else {
            if (textureIndex != 2 || (textureIndex != 2 && animationIndex != -1)) {
                this.onXMLMinorError("component texture out of order for ID =" + componentId);
            }
            error = this.parseComponentTexture(children[textureIndex], componentId);
            if (error != null)
                return (error);
        }


        //Children
        if (childrenIndex == -1) {
            return "component children undefined for ID = " + componentId;
        }
        else {
            if ((childrenIndex != 3) || (childrenIndex != 4 && animationIndex != -1)) {
                this.onXMLMinorError("component children out of order for ID =" + componentId);
            }
            error = this.parseComponentChildren(children[childrenIndex], componentId);
            if (error != null)
                return (error);
        }

        this.componentIds.push(componentId);

    }

    parseComponentTransf(compTransfNode, id) {
        let children = compTransfNode.children;
        let reference = null;
        this.scene.pushMatrix();
        this.scene.loadIdentity();
        let info;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "transformationref") {
                //ID
                let transfId = this.reader.getString(children[i], 'id');
                if (transfId == null)
                    return "no ID defined for transformationref in component id = " + id;

                if (this.transformationIds.indexOf(transfId) == -1)
                    return "transformationref ID not found for in component id = " + id;

                if (reference == null)
                    reference = true;

                else if (reference == false) {
                    this.onXMLMinorError("there cannot be a referenced transformation alon with explicit transformations in component definition; only the reference definition will be considered");
                }
                this.components[id].transformation = this.transformations[transfId];
            }
            else if (children[i].nodeName == "translate" || children[i].nodeName == "rotate" || children[i].nodeName == "scale") {
                if (reference == true) {
                    this.onXMLMinorError("there cannot be a referenced transformation alon with explicit transformations in component definition; only the reference definition will be considered");
                    return null;
                }
                if (reference == null)
                    reference = false;

                if (children[i].nodeName == "translate") {
                    info = this.parseFields(children[i], ["all", ["x", "ff", 0], ["y", "ff", 0], ["z", "ff", 0]], "components > component id = " + id);
                    this.scene.translate(info.x, info.y, info.z);

                } else if (children[i].nodeName == "rotate") {
                    info = this.parseFields(children[i], ["single", ["axis", "cc", 0], ["angle", "ff", 0]], "components > component id = " + id);
                    let radAngle = info.angle * this.deg2rad;
                    switch (info.axis) {
                        case "x":
                            this.scene.rotate(radAngle, 1, 0, 0);
                            break;
                        case "y":
                            this.scene.rotate(radAngle, 0, 1, 0);
                            break;
                        case "z":
                            this.scene.rotate(radAngle, 0, 0, 1);
                            break;
                    }

                } else if (children[i].nodeName == "scale") {
                    info = this.parseFields(children[i], ["all", ["x", "ff", 1], ["y", "ff", 1], ["z", "ff", 1]], "components > component id = " + id);
                    this.scene.scale(info.x, info.y, info.z);
                }

            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in transformations of component id = " + id + " was ignored");

        }

        let matrix = this.scene.getMatrix();
        this.scene.popMatrix();
        if (!reference) {
            this.components[id].transformation = matrix;
        }
    }

    parseComponentMaterials(compMaterialsNode, id) {
        let children = compMaterialsNode.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "material") {
                //ID
                let materialId = this.reader.getString(children[i], 'id');
                if (materialId == null)
                    return "no ID defined for material in component id = " + id;

                if (this.materialIds.indexOf(materialId) == -1 && materialId != "inherit")
                    return "material ID not found for in component id = " + id;
                this.components[id].materials.push(materialId);
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in materials of component id = " + id + " was ignored");
        }
        //There has to be at least one material
        if (children.length == 0) {
            return "at least one material must be defined in component id = " + id;
        }
    }

    parseComponentTexture(compTextureNode, id) {
        //ID
        let textureId = this.reader.getString(compTextureNode, 'id');
        if (textureId == null)
            return "no ID defined for texture in component id = " + id;

        if (this.textureIds.indexOf(textureId) == -1 && textureId != "none" && textureId != "inherit")
            return "texture ID not found for in component id = " + id;

        this.components[id].texture = textureId;

        let info = this.parseFields(compTextureNode, ["ignore", ["length_s", "ff", 1.0], ["length_t", "ff", 1.0]], "components > component id = " + id + " > texture");

        this.components[id].texture = {
            id: textureId,
            length_s: info.length_s,
            length_t: info.length_t
        };
    }

    parseComponentAnimation(compAnimationsNode, id) {
        let children = compAnimationsNode;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "animationref") {
                //ID
                let animationId = this.reader.getString(children[i], 'id');
                if (materialId == null)
                    return "no ID defined for material in component id = " + id;

                if (this.linearAnimations.hasOwnProperty(animationId) || this.circularAnimations.hasOwnProperty(animationId))
                    this.components[id].animations.push(animationId);
                else return "animation ID not found for in component id = " + id;
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in animatios of component id = " + id);
        }

    }

    parseComponentChildren(compChildrenNode, id) {
        let children = compChildrenNode.children;
        this.components[id].children.components = [];
        this.components[id].children.primitives = [];

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName == "componentref") {
                //ID
                let componentId = this.reader.getString(children[i], 'id');
                if (componentId == null)
                    return "no ID defined for component child in component id = " + id;

                if (componentId == id)
                    return "child component id must not be equal to parent component id = " + id;

                this.childComponentIds.push(componentId);
                this.components[id].children.components.push(componentId);
            }
            else if (children[i].nodeName == "primitiveref") {
                //ID
                let primitiveId = this.reader.getString(children[i], 'id');
                if (primitiveId == null)
                    return "no ID defined for primitive child in component id = " + id;

                if (this.primitiveIds.indexOf(primitiveId) == -1)
                    return "primitive child ID not found for in component id = " + id;
                this.components[id].children.primitives.push(primitiveId);
            }
            else this.onXMLMinorError("inappropriate tag <" + children[i].nodeName + "> in children of component id = " + id);
        }

        if (children.length == 0)
            return "at least one child must be defined in children of component id = " + id


    }
    parseFields(node, especificationArray, XMLsection) {
        let result = [];
        let flag = especificationArray[0];
        let setAllDefaults = false;
        for (let i = 1; i < especificationArray.length; i++) {
            if (especificationArray[i][TYPE] == "ff") {
                let float;
                if (flag == "ignore")
                    float = this.reader.getFloat(node, especificationArray[i][NAME], false);
                else
                    float = this.reader.getFloat(node, especificationArray[i][NAME], true);
                if (isNaN(float) || float == null) {
                    if (flag == "all") {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection);
                        setAllDefaults = true;
                        break;
                    }
                    else if (flag == "single" || (flag == "ignore" && isNaN(float))) {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                        float = especificationArray[i][DEFAULT_VALUE];
                    }
                }
                result[especificationArray[i][NAME]] = float;
            }
            else if (especificationArray[i][TYPE] == "ss") {
                let string = this.reader.getString(node, especificationArray[i][NAME]);
                if (string == null) {
                    if (flag == "all") {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection);
                        setAllDefaults = true;
                        break;
                    }
                    else {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                        string = especificationArray[i][DEFAULT_VALUE];
                    }
                }
                result[especificationArray[i][NAME]] = string;
            }
            else if (especificationArray[i][TYPE] == "tt") {
                let float = this.reader.getFloat(node, especificationArray[i][NAME]);
                if (float == null || isNaN(float) || (float != 0 && float != 1)) {
                    if (flag == "all") {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection);
                        setAllDefaults = true;
                        break;
                    }
                    else {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                        float = especificationArray[i][DEFAULT_VALUE];
                    }
                }
                result[especificationArray[i][NAME]] = float;
            }
            else if (especificationArray[i][TYPE] == "cc") {
                let string = this.reader.getString(node, especificationArray[i][NAME]);
                if (string == null || (string != "x" && string != "y" && string != "z")) {
                    if (flag == "all") {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection);
                        setAllDefaults = true;
                        break;
                    }
                    else {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                        string = especificationArray[i][DEFAULT_VALUE];
                    }
                }
                result[especificationArray[i][NAME]] = string;
            }
            else if (especificationArray[i][TYPE] == "ii") {
                let float = this.reader.getFloat(node, especificationArray[i][NAME]);
                if (float == null || isNaN(float) || ((float % 1) != 0)) {
                    if (flag == "all") {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection);
                        setAllDefaults = true;
                        break;
                    } else {
                        this.onXMLMinorError("unable to parse " + especificationArray[i][NAME] + " value from section " + XMLsection + "; assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
                        float = especificationArray[i][DEFAULT_VALUE];
                    }
                }
                result[especificationArray[i][NAME]] = float;
            }

        }

        if (setAllDefaults) {
            for (let i = 1; i < especificationArray.length; i++) {
                result[especificationArray[i][NAME]] = especificationArray[i][DEFAULT_VALUE];
                this.onXMLMinorError("assuming " + especificationArray[i][NAME] + " = " + especificationArray[i][DEFAULT_VALUE]);
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
        this.materialStack.push(this.rootMaterial);
        this.textureStack.push(this.rootTexture);
        this.sStack.push(this.rootTS);
        this.tStack.push(this.rootTT);
        this.displayRecursive(this.values.scene.root);
        this.sStack.pop();
        this.tStack.pop();
        this.materialStack.pop();
        this.textureStack.pop();
    }


    displayRecursive(idNode) {

        let node = this.components[idNode];


        if (node.transformation != undefined)
            this.scene.multMatrix(node.transformation);

        let info = this.adaptTextureAndMaterial(idNode);

        for (let i = 0; i < node.children.primitives.length; i++) {
            let s = info.s;
            let t = info.t;
            this.primitives[node.children.primitives[i]].updateCoords(s, t);
            this.primitives[node.children.primitives[i]].display();
        }

        for (let i = 0; i < node.children.components.length; i++) {
            this.materialStack.push(info.mId);
            this.textureStack.push(info.tId);
            this.sStack.push(info.s);
            this.tStack.push(info.t);
            this.scene.pushMatrix();

            this.displayRecursive(node.children.components[i]);

            this.scene.popMatrix();
            this.textureStack.pop();
            this.materialStack.pop();
            this.sStack.pop();
            this.tStack.pop();
        }

    }

    adaptTextureAndMaterial(idNode) {
        let textureId = this.components[idNode].texture.id;
        let s = this.components[idNode].texture.length_s;
        let t = this.components[idNode].texture.length_t;
        let nMaterials = Object.keys(this.components[idNode].materials).length;
        let materialId = this.components[idNode].materials[this.displayIndex % nMaterials];
        let material, texture;

        if (materialId == "inherit") {
            materialId = this.materialStack.peek();
        }

        material = this.materials[materialId];

        if (textureId == "inherit") {
            textureId = this.textureStack.peek();

            if (textureId == "none") {
                texture = null;
            }
            else {
                s = this.sStack.peek();
                t = this.tStack.peek();
                texture = this.textures[textureId];
            }
        }

        else if (textureId == "none") {
            texture = null;
        }
        else {
            texture = this.textures[textureId];
        }


        if (texture != null) {
            if (isPowerOfTwo(texture.image.width) && isPowerOfTwo(texture.image.height)) {
                material.setTextureWrap('REPEAT', 'REPEAT');
            }
            else {
                material.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
            }
        }

        material.setTexture(texture);
        material.apply();
        return {
            mId: materialId,
            tId: textureId,
            s: s,
            t: t
        };
    }

}