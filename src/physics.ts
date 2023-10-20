import day from "./day.js";
import props from "./props.js";
import renderer from "./renderer.js";

namespace physics {

	export const showWireframe = true;

	export var materials: any = {}

	export var world,
		walls = [], balls = [], ballMeshes = [], boxes = [], boxMeshes = [];

	export function boot() {
		world = new CANNON.World();

		world.solver.iterations = 50;

		// Tweak contact properties.
		// Contact stiffness - use to make softer/harder contacts
		world.defaultContactMaterial.contactEquationStiffness = 5e6;

		// Stabilization time in number of timesteps
		world.defaultContactMaterial.contactEquationRelaxation = 3;

		const solver = new CANNON.GSSolver();
		solver.iterations = 7;
		solver.tolerance = 0.1;
		world.solver = new CANNON.SplitSolver(solver);
		// use this to test non-split solver
		// world.solver = solver

		world.gravity.set(0, -20, 0);

		// Create a slippery material (friction coefficient = 0.0)
		materials.player = new CANNON.Material('player');
		materials.ground = new CANNON.Material('ground');
		materials.solid = new CANNON.Material('solid');
		materials.wall = new CANNON.Material('wall');

		// Object
		materials.generic = new CANNON.Material('object');
		const objectToGroundContact = new CANNON.ContactMaterial(
			materials.generic, materials.ground, {
			friction: 0.0001,
			restitution: 0.3,
		});

		const playerToWallContact = new CANNON.ContactMaterial(
			materials.player, materials.wall, {
			friction: 1.0,
			restitution: 0.0,
		});

		const playerToGroundContact = new CANNON.ContactMaterial(
			materials.player, materials.ground, {
			friction: 0.002,
			restitution: 0.3,
		});

		const genericToSolidContact = new CANNON.ContactMaterial(
			materials.generic, materials.solid, {
			friction: 0.00,
			restitution: 0.3,
		});

		// We must add the contact materials to the world
		world.addContactMaterial(objectToGroundContact);
		world.addContactMaterial(playerToWallContact);
		world.addContactMaterial(playerToGroundContact);
		world.addContactMaterial(genericToSolidContact);

		// Create the ground plane
		const groundShape = new CANNON.Plane();
		const groundBody = new CANNON.Body({ mass: 0, material: materials.ground });
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

		for (let body of bodies)
			body.loop();

		for (let sbox of sboxes) {
			sbox.loop();
		}

		world.step(timeStep, dt);

		// Step the physics world
		//world.step(timeStep);

		// Copy coordinates from Cannon.js to Three.js
		//mesh.position.copy(body.position);
		//mesh.quaternion.copy(body.quaternion);
	}

	// a physic
	const boo = 0;
	var bodies: fbody[] = []

	var sboxes: simple_box[] = []

	export class simple_box {
		boxBody
		boxMesh
		constructor() {
			sboxes.push(this);

			const material = new THREE.MeshLambertMaterial({ color: 'green' });
			const halfExtents = new CANNON.Vec3(0.5, 0.5, 0.5);
			const boxShape = new CANNON.Box(halfExtents);
			const boxGeometry = new THREE.BoxGeometry(
				halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
			this.boxBody = new CANNON.Body({ mass: 1.0, material: materials.generic });
			this.boxBody.addShape(boxShape);
			this.boxMesh = new THREE.Mesh(boxGeometry, material);
			this.boxMesh.castShadow = true;
			this.boxMesh.receiveShadow = true;
			this.boxMesh.add(new THREE.AxesHelper(1));

			const x = 2;//(Math.random() - 0.5) * 1;
			const y = 4;
			const z = 1;//(Math.random() - 0.5) * 2;

			this.boxBody.position.set(x, y, z);
			this.boxMesh.position.copy(this.boxBody.position);
			world.addBody(this.boxBody);
			renderer.scene.add(this.boxMesh);
		}
		loop() {
			this.boxMesh.position.copy(this.boxBody.position);
			this.boxMesh.quaternion.copy(this.boxBody.quaternion);
		}
	}

	export class fbody {
		body
		constructor(public readonly prop: props.prop) {
			bodies.push(this);
			prop.fbody = this;
		}
		loop() { // override
		}
	}

	export class fbox extends fbody {
		constructor(prop) {
			super(prop);

			const size = new THREE.Vector3();
			this.prop.aabb.getSize(size);
			size.divideScalar(2);

			const halfExtents = new CANNON.Vec3(size.x, size.y, size.z);
			const boxShape = new CANNON.Box(halfExtents);
			const mass = this.prop.parameters.mass != undefined ? this.prop.parameters.mass : 0.1;
			let material;
			switch (prop.object.name) {
				case 'wall':
					material = materials.wall;
				default:
					material = materials.generic;
			}
			const boxBody = new CANNON.Body({ mass: mass, material: material });

			const center = new THREE.Vector3();
			this.prop.aabb.getCenter(center);
			boxBody.position.copy(center);
			//console.log(boxBody.quaternion);
			//new THREE.Quaternion().

			//boxBody.rotation.copy(this.prop.oldRotation);
			boxBody.addShape(boxShape);
			world.addBody(boxBody);
			this.body = boxBody;
			//console.log('set this body to boxbody', this.body);

			//if (!this.prop.parameters.solid)
			this.add_helper_aabb();

		}
		AABBMesh
		add_helper_aabb() {
			if (!showWireframe)
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
		override loop() {
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

	export class fdoor extends fbody {
		constructor(prop) {
			super(prop);

			const size = new THREE.Vector3();
			const center = new THREE.Vector3();
			this.prop.aabb.getSize(size);
			this.prop.aabb.getCenter(center);
			size.multiplyScalar(0.99);

			const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
			const hingedShape = new CANNON.Box(halfExtents);

			const hingedBody = new CANNON.Body({ mass: 0.5 });
			hingedBody.addShape(hingedShape);
			hingedBody.position.copy(center);
			//hingedBody.position.z += size.z;
			world.addBody(hingedBody);

			const halfExtents2 = new CANNON.Vec3(0.2, size.y / 2, 0.2);
			const staticShape = new CANNON.Box(halfExtents2);
			const staticBody = new CANNON.Body({ mass: 0 });
			staticBody.addShape(staticShape);
			staticBody.position.copy(center);
			staticBody.position.z += size.z;
			world.addBody(staticBody);
			
			const constraint = new CANNON.HingeConstraint(staticBody, hingedBody, {
				pivotA: new CANNON.Vec3(0, 0, -size.z / 2),
				axisA: new CANNON.Vec3(0, 1, 0),
				pivotB: new CANNON.Vec3(0, 0, -size.z / 2),
				axisB: new CANNON.Vec3(0, 1, 0),
			});
			world.addConstraint(constraint);
			
			this.body = hingedBody;

			this.add_helper_aabb();
		}
		AABBMesh

		add_helper_aabb() {
			if (!showWireframe)
				return;

			const size = new THREE.Vector3();
			this.prop.aabb.getSize(size);

			const material = new THREE.MeshLambertMaterial({ color: 'red', wireframe: true });
			const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
			this.AABBMesh = new THREE.Mesh(boxGeometry, material);

			renderer.scene.add(this.AABBMesh);
		}
		override loop() {
			this.AABBMesh.position.copy(this.prop.group.position);
			this.AABBMesh.quaternion.copy(this.prop.group.quaternion);
		}
	}
}

export default physics;