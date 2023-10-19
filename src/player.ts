import app from "./app.js";
import physics from "./physics.js";
import pts from "./pts.js";
import renderer from "./renderer.js";

// https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

class player {

	plc;
	canJump;
	cannonBody;
	scope = this;
	velocity;

	constructor() {
		this.setup();
		this.createPhysics();
	}

	setup() {
		const instructions = document.querySelector('day-instructions')! as HTMLElement;

		this.plc = new pointer_lock_controls(renderer.camera, renderer.renderer.domElement);
		this.plc.enabled = true;

		this.plc.getObject().position.y = 1.5;

		const controler = this.plc;

		instructions.addEventListener('click', function () {
			controler.lock();
		});

		this.plc.addEventListener('lock', function () {
			console.log('lock');
			instructions.style.display = 'none';
			//blocker.style.display = 'none';
		});

		this.plc.addEventListener('unlock', function () {
			console.log('unlock');
			//blocker.style.display = 'block';
			instructions.style.display = '';
		});

		renderer.scene.add(this.plc.getObject());
	}

	createPhysics() {
		// Create a slippery material (friction coefficient = 0.0)
		var playerMaterial = new CANNON.Material('physics');
		const physics_mat = new CANNON.ContactMaterial(playerMaterial, playerMaterial, {
			friction: 0.1,
			restitution: 0.01,
		});

		// We must add the contact materials to the world
		physics.world.addContactMaterial(physics_mat);

		// Create a sphere
		const radius = 0.4;
		var sphereShape = new CANNON.Sphere(radius);
		var sphereBody = new CANNON.Body({ mass: 5, material: playerMaterial });
		sphereBody.addShape(sphereShape);
		sphereBody.position.set(0, 5, 0);
		sphereBody.linearDamping = 0.999;
		sphereBody.angularDamping = 0.999;
		physics.world.addBody(sphereBody);
		this.cannonBody = sphereBody;

		const contactNormal = new CANNON.Vec3() // Normal in the contact, pointing *out* of whatever the player touched
		const upAxis = new CANNON.Vec3(0, 1, 0)
		this.cannonBody.addEventListener('collide', (event) => {
			const { contact } = event

			// contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
			// We do not yet know which one is which! Let's check.
			if (contact.bi.id === this.cannonBody.id) {
				// bi is the player body, flip the contact normal
				contact.ni.negate(contactNormal)
			} else {
				// bi is something else. Keep the normal as it is
				contactNormal.copy(contact.ni)
			}

			// If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
			if (contactNormal.dot(upAxis) > 0.5) {
				// Use a "good" threshold value between 0 and 1 here!
				this.canJump = true
			}
		})

		this.velocity = this.cannonBody.velocity;
	}
	force = 20.0;
	quat = new THREE.Quaternion();

	// Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
	inputVelocity = new THREE.Vector3();
	euler = new THREE.Euler();
	loop(delta: number) {

		if (this.plc.enabled === false)
			return;

		this.inputVelocity.set(0, 0, 0);

		let x = 0, y = 0;

		if (app.prompt_key('w')) {
			y = 1;
		}
		if (app.prompt_key('s')) {
			y = -1;
		}
		if (app.prompt_key('a')) {
			x = -1;
		}
		if (app.prompt_key('d')) {
			x = 1;
		}
		if (app.prompt_key(' ') && this.canJump) {
			this.velocity.y = 10;
			this.canJump = false;
		}

		const force = this.force * delta;
		let angle = pts.angle([0, 0], [x, y]);

		if (x || y) {
			x = force * Math.sin(angle);
			y = force * Math.cos(angle);

			this.inputVelocity.x = x;
			this.inputVelocity.z = y;
		}
		const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
		const camera = this.plc.getObject();
		_euler.setFromQuaternion(camera.quaternion);
		// Convert velocity to world coordinates
		this.euler.x = _euler.x;
		this.euler.y = _euler.y;
		this.euler.order = "YXZ";
		this.quat.setFromEuler(this.euler);
		this.inputVelocity.applyQuaternion(this.quat);

		// Add to the object
		this.velocity.x += this.inputVelocity.x;
		this.velocity.z += this.inputVelocity.z;

		this.plc.getObject().position.copy(this.cannonBody.position);
		this.plc.getObject().position.add(new THREE.Vector3(0, 1, 0));
	}
}

export default player;