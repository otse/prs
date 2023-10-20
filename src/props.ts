import day from "./day.js";
import physics from "./physics.js";
import renderer from "./renderer.js";

namespace props {

	export function factory(object: any) {
		let prop;
		switch (object.name) {
			case 'wall':
			case 'solid':
				prop = new pbox(object, { mass: 0 });
				break;
			case 'fridge':
				prop = new pbox(object, { mass: 3 });
				break;
			case 'cup':
				prop = new pbox(object, { mass: 0.2 });
				break;
			case 'compactdiscs':
				prop = new pbox(object, { mass: 0.7 });
				break;
			case 'matress':
				prop = new pbox(object, { mass: 2.0 });
				break;
			default:
		}
		return prop;
	}

	export function boot() {

	}

	export function loop() {
		for (let prop of props)
			prop.loop();
	}

	export function take_collada_prop(prop: prop) {
		// the prop is sitting in a rotated, scaled scene graph
		// set it apart
		prop.group = new THREE.Group();

		prop.object.matrixWorld.decompose(
			prop.group.position,
			prop.group.quaternion,
			prop.group.scale);

		console.log('take collada prop', prop.object.name, prop.object.quaternion);

		prop.object.position.set(0, 0, 0);
		prop.object.rotation.set(0, 0, 0);

		prop.group.add(prop.object);
		prop.group.updateMatrix();
		prop.group.updateMatrixWorld();

		renderer.propsGroup.add(prop.group);

		function traversal(object) {
			object.geometry?.computeBoundingBox();
		}
		prop.object.traverse(traversal);
	}

	export var props: prop[] = []

	interface iparameters {
		mass: number;
		wall?: boolean;
	};

	export class prop {
		oldRotation
		group
		master
		fbody: physics.fbody
		aabb
		constructor(public readonly object, public readonly parameters: iparameters) {
			props.push(this);
		}
		complete() {
			take_collada_prop(this);
			this.measure();
			this.setup();
		}
		setup() { // override
		}
		loop() { // override
		}
		void() {

		}
		measure() {
			this.aabb = new THREE.Box3();
			this.aabb.setFromObject(this.group, true);
			//this.aabb.applyMatrix4( this.object.parent.matrixWorld );
			//console.log('box measures', this.aabb);

			const size = new THREE.Vector3();
			this.aabb.getSize(size);
			size.multiplyScalar(day.inchMeter);

			this.object.rotation.set(-Math.PI / 2, 0, 0);
			this.object.position.set(-size.x / 2, -size.y / 2, size.z / 2);

		}
	}

	export class pbox extends prop {
		constructor(object, parameters: iparameters) {
			super(object, parameters);
		}
		override setup() {
			new physics.fbox(this);
			if (this.object.name == 'wall')
				this.object.visible = false;

		}
		override loop() {
			this.group.position.copy(this.fbody.body.position);
			this.group.quaternion.copy(this.fbody.body.quaternion);
			this.fbody.loop();
		}
	}

}

export default props;