import day from "./day.js";
import renderer from "./renderer.js";
var physics;
(function (physics) {
    physics.debug_wireframe = true;
    physics.walls = [], physics.balls = [], physics.ballMeshes = [], physics.boxes = [], physics.boxMeshes = [];
    function boot() {
        physics.world = new CANNON.World();
        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        physics.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        // Stabilization time in number of timesteps
        physics.world.defaultContactMaterial.contactEquationRelaxation = 4;
        const solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        physics.world.solver = new CANNON.SplitSolver(solver);
        // use this to test non-split solver
        // world.solver = solver
        physics.world.gravity.set(0, -20, 0);
        // Create a slippery material (friction coefficient = 0.0)
        physics.groundMaterial = new CANNON.Material('ground');
        const groundContactMaterial = new CANNON.ContactMaterial(physics.groundMaterial, physics.groundMaterial, {
            friction: 0.0,
            restitution: 0.3,
        });
        // We must add the contact materials to the world
        physics.world.addContactMaterial(groundContactMaterial);
        // Create the ground plane
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0, material: physics.groundMaterial });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        physics.world.addBody(groundBody);
    }
    physics.boot = boot;
    var lastCallTime = 0;
    const timeStep = 1 / 60;
    function loop(delta) {
        const time = performance.now() / 1000;
        const dt = time - lastCallTime;
        lastCallTime = time;
        for (let body of bodies)
            body.loop();
        for (let sbox of sboxes) {
            sbox.loop();
        }
        physics.world.step(timeStep, dt);
        // Step the physics world
        //world.step(timeStep);
        // Copy coordinates from Cannon.js to Three.js
        //mesh.position.copy(body.position);
        //mesh.quaternion.copy(body.quaternion);
    }
    physics.loop = loop;
    // a physic
    const boo = 0;
    var bodies = [];
    var sboxes = [];
    class simple_box {
        boxBody;
        boxMesh;
        constructor() {
            sboxes.push(this);
            const material = new THREE.MeshLambertMaterial({ color: 'green' });
            const halfExtents = new CANNON.Vec3(0.5, 0.5, 0.5);
            const boxShape = new CANNON.Box(halfExtents);
            const boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            this.boxBody = new CANNON.Body({ mass: 1.0, material: physics.groundMaterial });
            this.boxBody.addShape(boxShape);
            this.boxMesh = new THREE.Mesh(boxGeometry, material);
            this.boxMesh.add(new THREE.AxesHelper(1));
            const x = 2; //(Math.random() - 0.5) * 1;
            const y = 4;
            const z = 1; //(Math.random() - 0.5) * 2;
            this.boxBody.position.set(x, y, z);
            this.boxMesh.position.copy(this.boxBody.position);
            physics.world.addBody(this.boxBody);
            renderer.scene.add(this.boxMesh);
        }
        loop() {
            this.boxMesh.position.copy(this.boxBody.position);
            this.boxMesh.quaternion.copy(this.boxBody.quaternion);
        }
    }
    physics.simple_box = simple_box;
    class fbody {
        prop;
        body;
        constructor(prop) {
            this.prop = prop;
            bodies.push(this);
            prop.fbody = this;
        }
        loop() {
        }
    }
    physics.fbody = fbody;
    class fbox extends fbody {
        constructor(prop) {
            super(prop);
            const size = new THREE.Vector3();
            let invert = new THREE.Matrix4().copy(this.prop.object.matrix);
            //invert.invert();
            this.prop.aabb.getSize(size);
            //size.applyMatrix4(invert);
            //size.divideScalar(day.inchMeter);
            size.divideScalar(2);
            const halfExtents = new CANNON.Vec3(size.x, size.y, size.z);
            const boxShape = new CANNON.Box(halfExtents);
            const mass = this.prop.parameters.mass != undefined ? this.prop.parameters.mass : 0.1;
            const boxBody = new CANNON.Body({ mass: mass, material: physics.groundMaterial });
            const center = new THREE.Vector3();
            this.prop.aabb.getCenter(center);
            boxBody.position.copy(center);
            boxBody.addShape(boxShape);
            physics.world.addBody(boxBody);
            this.body = boxBody;
            //console.log('set this body to boxbody', this.body);
            if (!this.prop.parameters.solid)
                this.add_helper_aabb();
        }
        boxBody;
        AABBMesh;
        add_helper_aabb() {
            if (!physics.debug_wireframe)
                return;
            //console.log('add helper aabb');
            const size = new THREE.Vector3();
            this.prop.aabb.getSize(size);
            size.divideScalar(2);
            const material = new THREE.MeshLambertMaterial({ color: 'red', wireframe: true });
            const boxGeometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
            this.AABBMesh = new THREE.Mesh(boxGeometry, material);
            //this.AABBMesh.add(new THREE.AxesHelper(1));
            renderer.scene.add(this.AABBMesh);
        }
        flipper = 1;
        redOrBlue = false;
        loop() {
            if (this.AABBMesh) {
                let hold_on = new THREE.Vector3().copy(this.prop.group.position);
                //hold_on.applyMatrix4(this.prop.object.matrix);
                //hold_on.divideScalar(day.inchMeter);
                this.AABBMesh.position.copy(hold_on);
                this.AABBMesh.quaternion.copy(this.prop.group.quaternion);
                if ((this.flipper -= day.dt) <= 0) {
                    if (this.redOrBlue) {
                        this.AABBMesh.material.color = new THREE.Color('red');
                    }
                    else {
                        this.AABBMesh.material.color = new THREE.Color('blue');
                    }
                    this.redOrBlue = !this.redOrBlue;
                    this.flipper = 1;
                }
            }
            //const center = new THREE.Vector3();
            //this.prop.aabb.getCenter(center);
            //center.divideScalar(100);
            //this.body.position.set(center.x, center.y, center.z);
        }
    }
    physics.fbox = fbox;
})(physics || (physics = {}));
export default physics;
