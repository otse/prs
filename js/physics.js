import audio from "./audio.js";
import day from "./day.js";
import renderer from "./renderer.js";
var physics;
(function (physics) {
    physics.wireframe_helpers = false;
    physics.materials = {};
    physics.walls = [], physics.balls = [], physics.ballMeshes = [], physics.boxes = [], physics.boxMeshes = [];
    function boot() {
        physics.world = new CANNON.World();
        physics.world.solver.iterations = 50;
        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        physics.world.defaultContactMaterial.contactEquationStiffness = 5e6;
        // Stabilization time in number of timesteps
        physics.world.defaultContactMaterial.contactEquationRelaxation = 3;
        const solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        physics.world.solver = new CANNON.SplitSolver(solver);
        // use this to test non-split solver
        // world.solver = solver
        physics.world.gravity.set(0, -20, 0);
        // Create a slippery material (friction coefficient = 0.0)
        physics.materials.player = new CANNON.Material('player');
        physics.materials.ground = new CANNON.Material('ground');
        physics.materials.solid = new CANNON.Material('solid');
        physics.materials.wall = new CANNON.Material('wall');
        // Object
        physics.materials.generic = new CANNON.Material('object');
        const objectToGroundContact = new CANNON.ContactMaterial(physics.materials.generic, physics.materials.ground, {
            friction: 0.0001,
            restitution: 0.3,
        });
        const playerToWallContact = new CANNON.ContactMaterial(physics.materials.player, physics.materials.wall, {
            friction: 1.0,
            restitution: 0.0,
        });
        const playerToGroundContact = new CANNON.ContactMaterial(physics.materials.player, physics.materials.ground, {
            friction: 0.002,
            restitution: 0.3,
        });
        const genericToSolidContact = new CANNON.ContactMaterial(physics.materials.generic, physics.materials.solid, {
            friction: 0.00,
            restitution: 0.3,
        });
        // We must add the contact materials to the world
        physics.world.addContactMaterial(objectToGroundContact);
        physics.world.addContactMaterial(playerToWallContact);
        physics.world.addContactMaterial(playerToGroundContact);
        physics.world.addContactMaterial(genericToSolidContact);
        // Create the ground plane
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0, material: physics.materials.ground });
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
            this.boxBody = new CANNON.Body({ mass: 1.0, material: physics.materials.generic });
            this.boxBody.addShape(boxShape);
            this.boxMesh = new THREE.Mesh(boxGeometry, material);
            this.boxMesh.castShadow = true;
            this.boxMesh.receiveShadow = true;
            //this.boxMesh.add(new THREE.AxesHelper(1));
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
            this.prop.aabb.getSize(size);
            size.divideScalar(2);
            const halfExtents = new CANNON.Vec3(size.x, size.y, size.z);
            const boxShape = new CANNON.Box(halfExtents);
            const weight = this.prop.parameters.weight;
            const mass = this.prop.parameters.mass;
            let material;
            switch (prop.object.name) {
                case 'wall':
                    material = physics.materials.wall;
                default:
                    material = physics.materials.generic;
            }
            const boxBody = new CANNON.Body({ mass: mass, material: material });
            const center = new THREE.Vector3();
            this.prop.aabb.getCenter(center);
            boxBody.position.copy(center);
            //console.log(boxBody.quaternion);
            //new THREE.Quaternion().
            //boxBody.rotation.copy(this.prop.oldRotation);
            boxBody.addShape(boxShape);
            physics.world.addBody(boxBody);
            this.body = boxBody;
            //if (prop.parameters.mass == 0)
            //	boxBody.collisionResponse = 0;
            boxBody.addEventListener("collide", function (e) {
                if (prop.parameters.mass == 0)
                    return;
                const velocity = e.contact.getImpactVelocityAlongNormal();
                let clamp;
                clamp = day.clamp(mass * velocity, 0.1, 3);
                //clamp = day.clamp(clamp, 0.1, 1);
                clamp = day.clamp(velocity, 0.1, 1.0);
                //console.log('velocity, clamp', velocity, clamp);
                let sample = '';
                if (velocity < 0.5) {
                    console.log('soft');
                    sample = day.sample([
                        'cardboard_box_impact_soft1',
                        'cardboard_box_impact_soft2',
                        'cardboard_box_impact_soft3',
                        'cardboard_box_impact_soft4',
                        'cardboard_box_impact_soft5',
                        'cardboard_box_impact_soft6',
                        'cardboard_box_impact_soft7',
                    ]);
                }
                else {
                    console.log('hard');
                    sample = day.sample([
                        'cardboard_box_impact_hard1',
                        'cardboard_box_impact_hard2',
                        'cardboard_box_impact_hard3',
                        'cardboard_box_impact_hard4',
                        'cardboard_box_impact_hard5',
                        'cardboard_box_impact_hard6',
                        'cardboard_box_impact_hard7',
                    ]);
                }
                let sound = audio.playOnce(sample, clamp);
                if (sound)
                    prop.group.add(sound);
            });
            //if (!this.prop.parameters.solid)
            this.add_helper_aabb();
        }
        AABBMesh;
        add_helper_aabb() {
            if (!physics.wireframe_helpers)
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
            if (!this.AABBMesh)
                return;
            this.AABBMesh.position.copy(this.prop.group.position);
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
    }
    physics.fbox = fbox;
    const door_arbitrary_shrink = 0.88;
    class fdoor extends fbody {
        constraint;
        constructor(prop) {
            super(prop);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            this.prop.aabb.getSize(size);
            this.prop.aabb.getCenter(center);
            const shrink = new THREE.Vector3();
            shrink.copy(size);
            shrink.multiplyScalar(door_arbitrary_shrink);
            shrink.divideScalar(2);
            const halfExtents = new CANNON.Vec3(shrink.x, shrink.y, shrink.z);
            const hingedShape = new CANNON.Box(halfExtents);
            const hingedBody = new CANNON.Body({ mass: 0.5 });
            hingedBody.addShape(hingedShape);
            hingedBody.position.copy(center);
            hingedBody.linearDamping = 0.25;
            physics.world.addBody(hingedBody);
            const halfExtents2 = new CANNON.Vec3(0, size.y / 2, 0);
            const staticShape = new CANNON.Box(halfExtents2);
            const staticBody = new CANNON.Body({ mass: 0 });
            staticBody.addShape(staticShape);
            staticBody.position.copy(center);
            physics.world.addBody(staticBody);
            const pivots = [
                [0, 0, 0.5], [0, 0, -0.5], [0.5, 0, 0], [-0.5, 0, 0]
            ];
            const n = parseInt(this.prop.parameters.door.slice(-1)) - 1;
            const pivot = pivots[n];
            const constraint = new CANNON.HingeConstraint(staticBody, hingedBody, {
                pivotA: new CANNON.Vec3(size.x * pivot[0], 0, size.z * pivot[2]),
                axisA: new CANNON.Vec3(0, 1, 0),
                pivotB: new CANNON.Vec3(size.x * pivot[0], 0, size.z * pivot[2]),
                axisB: new CANNON.Vec3(0, 1, 0),
            });
            physics.world.addConstraint(constraint);
            //console.log(constraint);
            this.constraint = constraint;
            this.body = hingedBody;
            this.add_helper_aabb();
        }
        AABBMesh;
        AABBMesh2;
        add_helper_aabb() {
            if (!physics.wireframe_helpers)
                return;
            const size = new THREE.Vector3();
            this.prop.aabb.getSize(size);
            const material = new THREE.MeshLambertMaterial({ color: 'red', wireframe: true });
            const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            this.AABBMesh = new THREE.Mesh(boxGeometry, material);
            //this.AABBMesh2 = new THREE.Mesh(boxGeometry, material);
            renderer.scene.add(this.AABBMesh);
        }
        loop() {
            if (!physics.wireframe_helpers)
                return;
            this.AABBMesh.position.copy(this.prop.group.position);
            this.AABBMesh.quaternion.copy(this.prop.group.quaternion);
            //this.AABBMesh2.position.copy(this.prop.group.position);
            //this.AABBMesh2.quaternion.copy(this.prop.group.quaternion);
        }
    }
    physics.fdoor = fdoor;
})(physics || (physics = {}));
export default physics;
