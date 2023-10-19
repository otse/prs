import app from "./app.js";
import player from "./player.js";
import props from "./props.js";

namespace renderer {
	// set up three.js here

	export var scene, camera, renderer, ambient_light, clock;

	export var delta = 0;

	export var propsGroup;

	export function boot() {

		console.log('renderer boot');

		clock = new THREE.Clock();

		propsGroup = new THREE.Group();
		//propsGroup.matrix = propsGroup.matrix.makeScale(2, 2, 2);
		//propsGroup.scale.set(2, 1, 1);
		//propsGroup.matrix.makeTranslation(new THREE.Vector3(1000, 0, 0));
		propsGroup.updateMatrix();
		propsGroup.updateMatrixWorld();

		const material = new THREE.MeshLambertMaterial({ color: 'red' });
		const geometry = new THREE.RingGeometry(0.5, 1, 8);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.add(new THREE.AxesHelper(1));
		propsGroup.add(mesh);

		//propsGroup.scale

		scene = new THREE.Scene();
		scene.add(propsGroup);
		scene.background = new THREE.Color('white');

		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		const helper = new THREE.AxesHelper(1);
		scene.add(helper);

		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({ antialias: false });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;

		ambient_light = new THREE.AmbientLight(0xffffff, 2);
		scene.add(ambient_light);

		let sun = new THREE.DirectionalLight(0xffffff, 2.0);
		sun.shadow.mapSize.width = 2048;
		sun.shadow.mapSize.height = 2048;
		sun.shadow.camera.near = 0.5;
		sun.shadow.camera.far = 500;
		const extend = 1000;
		sun.position.set(-30, 200, -150);
		sun.castShadow = true;
		scene.add(sun);
		scene.add(sun.target);

		const day_main = document.querySelector('day-main')!;

		day_main.appendChild(renderer.domElement);
		// test


		window.addEventListener('resize', onWindowResize);

		load_room();
	}

	function onWindowResize() {

		renderer.setSize(window.innerWidth, window.innerHeight);

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		render();

	}

	function load_room() {
		// .. boot er up

		const loadingManager = new THREE.LoadingManager(function () {

			//ren.scene.add(elf);

		});

		const loader = new collada_loader(loadingManager);

		loader.load('./assets/first_apartment_bad.dae', function (collada) {

			const myScene = collada.scene;
			myScene.updateMatrixWorld();

			console.log('myscene', myScene.scale);

			function fix_sticker(material) {
				material.transparent = true;
				material.polygonOffset = true;
				material.polygonOffsetFactor = -1;
			}

			function fix(material) {
				if (material.name.includes('sticker'))
					fix_sticker(material);
				if (material.map) {
					// mineify
					//THREE.NearestFilter
					material.map.minFilter = material.map.magFilter = THREE.NearestFilter;
					material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
				}
			}

			const propss: props.prop[] = [];
			function traversal(object) {
				object.castShadow = true;
				object.receiveShadow = true;
				if (object.material) {
					if (!object.material.length)
						fix(object.material);
					else
						for (let material of object.material)
							fix(material);
				}
				const prop = props.factory(object);
				if (prop) {
					prop.master = myScene;
					propss.push(prop);
				}
				//return true;
			}

			myScene.traverse(traversal);

			for (let prop of propss) {
				prop.complete();
			}

			const group = new THREE.Group();
			//group.rotation.set(0, -Math.PI / 2, 0);
			group.add(myScene);

			scene.add(group);

		});
	}

	var prevTime = 0, time = 0, frames = 0
	export var fps = 0;

	export function render() {
		delta = clock.getDelta();

		frames++;
		time = (performance || Date).now();

		if (time >= prevTime + 1000) {

			fps = (frames * 1000) / (time - prevTime);

			prevTime = time;
			frames = 0;
			app.fluke_set_innerhtml('day-stats', `fps: ${fps}`);
		}

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene, camera);
	}
}

export default renderer;