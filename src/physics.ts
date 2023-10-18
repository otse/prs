import props from "./props.js";

namespace physics {

	export var world, groundMaterial,
		walls = [], balls = [], ballMeshes = [], boxes = [], boxMeshes = [];

	export function boot() {
		world = new CANNON.World()

		// Tweak contact properties.
		// Contact stiffness - use to make softer/harder contacts
		world.defaultContactMaterial.contactEquationStiffness = 1e9

		// Stabilization time in number of timesteps
		world.defaultContactMaterial.contactEquationRelaxation = 4

		const solver = new CANNON.GSSolver()
		solver.iterations = 7
		solver.tolerance = 0.1
		world.solver = new CANNON.SplitSolver(solver)
		// use this to test non-split solver
		// world.solver = solver

		world.gravity.set(0, -20, 0)

		// Create a slippery material (friction coefficient = 0.0)
		groundMaterial = new CANNON.Material('physics');
		const groundContactMaterial = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
			friction: 10.0,
			restitution: 0.01,
		});

		// We must add the contact materials to the world
		world.addContactMaterial(groundContactMaterial);

		// Create the ground plane
		const groundShape = new CANNON.Plane();
		const groundBody = new CANNON.Body({ mass: 0, material: groundContactMaterial });
		groundBody.addShape(groundShape);
		groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		world.addBody(groundBody);

	}

	var lastCallTime = 0;
	const timeStep = 1 / 60;

	export function loop(delta: number) {

		const time = performance.now() / 1000;
		const dt = time - lastCallTime;
		lastCallTime = time;

		world.step(timeStep, dt);


		// Step the physics world
		//world.step(timeStep);

		// Copy coordinates from Cannon.js to Three.js
		//mesh.position.copy(body.position);
		//mesh.quaternion.copy(body.quaternion);
	}

	// a physic
	export class physic {
		constructor(public readonly prop: props.prop) {

		}
	}
}

export default physics;