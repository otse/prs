var physics;
(function (physics) {
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
        physics.groundMaterial = new CANNON.Material('physics');
        const groundContactMaterial = new CANNON.ContactMaterial(physics.groundMaterial, physics.groundMaterial, {
            friction: 10.0,
            restitution: 0.01,
        });
        // We must add the contact materials to the world
        physics.world.addContactMaterial(groundContactMaterial);
        // Create the ground plane
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0, material: groundContactMaterial });
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
        physics.world.step(timeStep, dt);
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
