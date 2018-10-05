class SceneGraph{
    
    constructor(root, components){
        this.nodes = [];

        for(let key in components){
            let node = new Node(components[key]);
            this.nodes[key] = node;
        }

        this.rootNode = this.nodes[root];

        this.fillChildren();
        this.fillProperties();
    }

    display(){
        this.rootNode.display();
    }

    fillChildren(){
        for(let key in this.nodes){
            this.nodes[key].fillChildren(this.nodes);
        }
    }

    fillProperties(){
        this.rootNode.fillProperties(texture, materials, tMatrix);
    }
}