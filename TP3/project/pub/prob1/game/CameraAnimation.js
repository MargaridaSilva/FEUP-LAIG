class CameraAnimation {

    constructor(scene, camera){
        this.scene = scene;
        this.camera = camera;
        this.initialPos = [0, 0, 0];
        this.finalPos = [0, 0, 0];
        this.center = [0, 0, 0];
        this.end = true;
        
        
        this.span = 2000;
        this.t = this.span;
        this.w = 0;
    }

    easeInOutCubic(t) {
        return t<.5 ? 3*4*t*t : (2*t-2)*(2*t-2)+4*(t-1)*(2*t-2);
    }

    animate(finalPos, centerPos){
        if(this.scene.fastMode){
            this.span = 500;
        }
        else{
            this.span = 1600;
        }

        let initial = [this.camera.position[0], 0, this.camera.position[2]];
        let final = [finalPos[0], 0, finalPos[2]];
        let center = [centerPos[0], 0, centerPos[2]];

        let v1 = initial.minus(center);
        let v2 = final.minus(center);

        let ang = - Math.atan2(v2[2], v2[0]) + Math.atan2(v1[2], v1[0]);

        this.t = 0;
        this.w = ang / this.span;

        this.end = false;
    }

    update(dt){
        if(!this.end){
            if(this.t < this.span){
                this.t += dt;
                this.camera.orbit(this.center, this.w  * this.easeInOutCubic(this.t/this.span) * dt);
            }
            else{
                this.end = true;
            }
        }
    }
}