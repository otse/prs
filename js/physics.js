var physics;
(function (physics) {
    physics.walls = [], physics.balls = [], physics.ballMeshes = [], physics.boxes = [], physics.boxMeshes = [];
    function boot() {
        physics.world = new CANNON.World();
        physics.world.quatNormalizeSkip = 0;
        physics.world.quatNormalizeFast = false;
        physics.world.gravity.set(0, -20, 0);
        var solver = new CANNON.GSSolver();
        physics.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        physics.world.defaultContactMaterial.contactEquationRelaxation = 4;
        var split = true;
        if (split)
            physics.world.solver = new CANNON.SplitSolver(solver);
        else
            physics.world.solver = solver;
        physics.world.gravity.set(0, -20, 0);
        physics.world.broadphase = new CANNON.NaiveBroadphase();
        // Create a slippery material (friction coefficient = 0.0)
        physics.physicsMaterial = new CANNON.Material("slipperyMaterial");
        var physicsContactMaterial = new CANNON.ContactMaterial(physics.physicsMaterial, physics.physicsMaterial, 0.0, // friction coefficient
        0.3 // restitution
        );
        // We must add the contact materials to the world
        physics.world.addContactMaterial(physicsContactMaterial);
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        physics.world.addBody(groundBody);
    }
    physics.boot = boot;
    function loop(delta) {
        physics.world.step(delta);
        // Step the physics world
        //world.step(timeStep);
        // Copy coordinates from Cannon.js to Three.js
        //mesh.position.copy(body.position);
        //mesh.quaternion.copy(body.quaternion);
    }
    physics.loop = loop;
    // a physic
    class physic {
        prop;
        constructor(prop) {
            this.prop = prop;
        }
    }
    physics.physic = physic;
})(physics || (physics = {}));
export default physics;
