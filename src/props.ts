import day from "./day.js";
import physics from "./physics.js";
import renderer from "./renderer.js";

namespace props {

	export function factory(object: any) {
		return (() => {
			switch (object.name) {
				case "fridge":
					console.log('we found your fridge alright');
					let fridge = new pbox(object, {});
					(fridge as any).isFridge = true;
					return fridge;
				default:
			}
		})()
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
		//prop.group.matrix = prop.object.matrixWorld;

		prop.object.matrixWorld.decompose(
			prop.group.position,
			prop.group.quaternion,
			prop.group.scale);

		prop.object.position.set(0, 0, 0);
		prop.object.rotation.set(0, 0, 0);
		prop.object.matrix = new THREE.Matrix4().identity();
		prop.object.updateMatrix();
		prop.object.updateMatrixWorld();

		prop.group.add(prop.object);
		prop.group.updateMatrix();
		prop.group.updateMatrixWorld();

		renderer.propsGroup.add(prop.group);

		function traversal(object) {
			object.geometry?.computeBoundingBox();
		}
		prop.object.traverse(traversal);

		//prop.object.add(new THREE.AxesHelper(100));

		console.log('prop object', prop.group);
		console.log('position', prop.group.position);
		console.log('scale', prop.group.scale);
	}

	export var props: prop[] = []

	export class prop {
		group
		master
		fbody: physics.fbody
		aabb
		constructor(public readonly object, public readonly parameters) {
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
			console.log('box measures', this.aabb);

			const size = new THREE.Vector3();
			this.aabb.getSize(size);
			size.multiplyScalar(day.inchMeter);

			const euler = new THREE.Euler(Math.PI / 2, Math.PI / 2, Math.PI / 2, 'ZYX');
			//const b = new THREE.Vector3(1, 0, 1);
			//b.applyEuler(a);

			//this.object.quaternion.setFromEuler(euler);
			//this.object.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
			//this.object.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
			this.object.rotation.set(-Math.PI / 2, 0, 0);
			this.object.position.set(-size.x / 2, -size.y / 2, size.z / 2);

		}
	}

	export class pbox extends prop {
		constructor(object, parameters) {
			super(object, parameters);
		}
		override setup() {
			new physics.fbox(this);

		}
		override loop() {
			const fbodyPos = this.fbody.body.position;
			const vec = new THREE.Vector3().copy(fbodyPos);
			const quat = new THREE.Quaternion().copy(this.fbody.body.quaternion);
			this.group.position.copy(vec);
			this.group.quaternion.copy(quat);

			this.fbody.loop();
			//this.object.updateMatrix();
		}
	}

}

export default props;