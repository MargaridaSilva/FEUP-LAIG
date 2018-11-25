class MyVehicle extends CGFobject {

    constructor(scene) {
        super(scene);

        this.currentTime = 0;
        this.angle = 0;

        this.partPatch1 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                0, -23.999999999999972, -2,
                0, -26, 1,
                0, -12.000000000000009, 7.9999999999999964,

                0, -23.999999999999968, -2,
                6, -25.999999999999982, 1,
                6, -12, 8,

                0, -23.999999999999972, -2,
                6, -23.999999999999979, -1.9999999999999991,
                6, -10, 2
            ]
        );

        this.partPatch2 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                0, -12.000000000000009, 7.9999999999999964,
                0, 1, 14.999999999999998,
                0, 5, 6.9999999999999964,

                6, -12, 8,
                6, 1.0000000000000102, 15.000000000000002,
                0, 5.0000000000000009, 6.9999999999999964,

                6, -10, 2,
                6, 5.0000000000000009, 6.9999999999999964,
                0, 5, 6.9999999999999964
            ]
        );

        this.partPatch3 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                0, -23.999999999999972, -2,
                6, -23.999999999999979, -1.9999999999999991,
                6, -10, 2,

                0, -23.999999999999968, -2,
                6, -20, -6,
                6, -8, -3,

                0, -23.999999999999972, -2,
                0, -20, -6.0000000000000009,
                0, -8, -2.9999999999999956
            ]
        );

        this.partPatch4 = new MyPatch(this.scene, 3, 3, 100, 100,

            [
                6, -10, 2,
                6, 5.0000000000000009, 6.9999999999999964,
                0, 5, 6.9999999999999964,

                6, -8, -3,
                6, 7.213594362117874, 0.35921691364639941,
                0, 5.0000000000000009, 6.9999999999999964,

                0, -8, -2.9999999999999956,
                0, 7.2135943621178571, 0.35921691364640035,
                0, 5, 6.9999999999999964
            ]
        );

        this.partPatch5 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                0, -23.999999999999972, -2,
                -6, -23.999999999999979, -1.9999999999999991,
                -6, -10, 2,

                0, -23.999999999999968, -2,
                -6, -25.999999999999982, 1,
                -6, -12, 8,

                0, -23.999999999999972, -2,
                0, -26, 1,
                0, -12.000000000000009, 7.9999999999999964
            ]
        );

        this.partPatch6 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                -6, -10, 2,
                -6, 5.0000000000000009, 6.9999999999999964,
                0, 5, 6.9999999999999964,

                -6, -12, 8,
                -6, 1.0000000000000102, 15.000000000000002,
                0, 5.0000000000000009, 6.9999999999999964,

                0, -12.000000000000009, 7.9999999999999964,
                0, 1, 14.999999999999998,
                0, 5, 6.9999999999999964
            ]
        );

        this.partPatch7 = new MyPatch(this.scene, 3, 3, 100, 100,

            [
                0, -8, -2.9999999999999956,
                0, 7.2135943621178571, 0.35921691364640035,
                0, 5, 6.9999999999999964,

                -6, -8, -3,
                -6, 7.213594362117874, 0.35921691364639941,
                0, 5.0000000000000009, 6.9999999999999964,

                -6, -10, 2,
                -6, 5.0000000000000009, 6.9999999999999964,
                0, 5, 6.9999999999999964
            ]
        );

        this.partPatch8 = new MyPatch(this.scene, 3, 3, 100, 100,
            [
                0, -23.999999999999972, -2,
                0, -20, -6.0000000000000009,
                0, -8, -2.9999999999999956,

                0, -23.999999999999968, -2,
                -6, -20, -6,
                -6, -8, -3,

                0, -23.999999999999972, -2,
                -6, -23.999999999999979, -1.9999999999999991,
                -6, -10, 2
            ]
        );


        let b = 1;
        let t = 0.5;
        let h = 1;
        let c = 0.1;


        this.lateralWing = new MyPatch(this.scene, 9, 2, 100, 100,
            [
                0, b * c, 0, (b - t), t * c, h,
                -b, b * c, 0, (b - t) - t, t * c, h,
                -b, 0, 0, (b - t) - t, 0, h,
                -b, -b * c, 0, (b - t) - t, -t * c, h,
                0, -b * c, 0, (b - t), -t * c, h,
                b, -b * c, 0, (b - t) + t, -t * c, h,
                b, 0, 0, (b - t) + t, 0, h,
                b, b * c, 0, (b - t) + t, t * c, h,
                0, b * c, 0, (b - t), t * c, h
            ]
        );

        this.cone = new MyCylinder2(this.scene, 2, 4, 5, 20, 5);
        this.cone2 = new MyCylinder2(this.scene, 1, 2, 30, 20, 5);
        this.cylinder = new MyCylinder2(this.scene, 1, 1, 1, 20, 5);

    }

    updateCoords() {

    }

    display() {

        
        this.scene.scale(0.1, 0.1, 0.1);
        
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.partPatch1.display();
        this.partPatch2.display();
        this.partPatch3.display();
        this.partPatch4.display();
        this.partPatch5.display();
        this.partPatch6.display();
        this.partPatch7.display();
        this.partPatch8.display();
        this.scene.popMatrix();

        //Corpo p1
        this.scene.pushMatrix();
        this.scene.translate(0, 6.5, -7);
        this.cone.display();
        this.scene.popMatrix();

        //Corpo p2
        this.scene.pushMatrix();
        this.scene.translate(0, 6.5, -37);
        this.cone2.display();
        this.scene.popMatrix();







      


        //Estabilizadores
        this.scene.pushMatrix();
        this.scene.translate(0.5, 6.5, -35);
        this.scene.scale(4, 2, 2);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.lateralWing.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
        this.scene.translate(-0.5, 6.5, -35);
        this.scene.scale(-4, 2, 2);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.lateralWing.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 6.5, -35);
        this.scene.scale(2, 5, 2);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.lateralWing.display();
        this.scene.popMatrix();


        this.scene.pushMatrix();
        this.scene.translate(0, 0, 2);
        this.scene.rotate(this.angle, 0, 1, 0);


        //Helice
        this.scene.pushMatrix();
        this.scene.translate(0, 14, 0);
        this.scene.scale(1, 5, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();

        //Helice
        this.scene.pushMatrix();
        this.scene.translate(0, 14.5, 0);
        this.scene.scale(2, 1, 2);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.graph.materials.black.apply();

        //Helice
        this.scene.pushMatrix();
        this.scene.translate(0, 14, 0);
        this.scene.scale(0.8, 0.2, 60);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        //Helice
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, 14, 0);
        this.scene.scale(0.8, 0.2, 60);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.popMatrix();



        //Apoios

        this.scene.graph.materials.steel.apply();

        this.scene.pushMatrix();
        this.scene.translate(-5, -5, 15);
        this.scene.rotate(-Math.PI / 6, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.4, 0.4, 10);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(5, -5, 15);
        this.scene.rotate(Math.PI / 6, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.4, 0.4, 10);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-5, -5, 5);
        this.scene.rotate(-Math.PI / 6, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.4, 0.4, 10);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(5, -5, 5);
        this.scene.rotate(Math.PI / 6, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(0.4, 0.4, 10);
        this.scene.translate(0, 0, -0.5);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-7.5, -9.5, 0);
        this.scene.scale(0.4, 0.4, 20);
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(7.5, -9.5, 0);
        this.scene.scale(0.4, 0.4, 20);
        this.cylinder.display();
        this.scene.popMatrix();



    }


    update(dt) {
        this.angle -= (dt * 0.005);
        this.angle %= 2 * Math.PI;
    }
};