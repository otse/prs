import props from "./props.js";

namespace physics {

	export const stepFrequency = 60;
	export const maxSubSteps = 3;

	export var world, physicsMaterial,
		walls = [], balls = [], ballMeshes = [], boxes = [], boxMeshes = [];

	export function boot() {
		world = new CANNON.World();
		world.quatNormalizeSkip = 0;
		world.quatNormalizeFast = false;
		world.gravity.set(0, -20, 0);

		var solver = new CANNON.GSSolver();
		world.defaultContactMaterial.contactEquationStiffness = 1e9;
		world.defaultContactMaterial.contactEquationRelaxation = 4;

		var split = true;
		if (split)
			world.solver = new CANNON.SplitSolver(solver);
		else
			world.solver = solver;

		world.gravity.set(0, -20, 0);
		world.broadphase = new CANNON.NaiveBroadphase();

		// Create a slippery material (friction coefficient = 0.0)
		physicsMaterial = new CANNON.Material("slipperyMaterial");
		var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
			physicsMaterial,
			0.0, // friction coefficient
			0.3  // restitution
		);
		// We must add the contact materials to the world
		world.addContactMaterial(physicsContactMaterial);

		var groundShape = new CANNON.Plane();
		var groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(groundShape);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		world.addBody(groundBody);

	}

	var lastCallTime = 0;

	export function loop(delta: number) {

		const timeStep = 1 / stepFrequency;

		const now = Date.now() / 1000;

		if (!lastCallTime) {
			world.step(timeStep);
			lastCallTime = now;
			return;
		}

		var timeSinceLastCall = now - lastCallTime;

		world.step(timeStep, timeSinceLastCall, maxSubSteps);

		lastCallTime = now;

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