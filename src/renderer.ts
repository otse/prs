import prs_controls from "./controls.js";

namespace renderer {
	// set up three.js here

	export var scene, camera, renderer, ambient_light, controls, clock, delta;

	var cube;

	export function boot() {

		console.log('renderer boot');

		clock = new THREE.Clock();

		scene = new THREE.Scene();
		scene.background = new THREE.Color('white');

		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		cube = new THREE.Mesh(geometry, material);
		//scene.add(cube);

		const helper = new THREE.AxesHelper(1);
		scene.add(helper);

		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({ antialias: false });
		renderer.setSize(window.innerWidth, window.innerHeight);
		//renderer.shadowMap.enabled = true;
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
		//sun.castShadow = true;
		//scene.add(sun);
		scene.add(sun.target);

		const prs_main = document.querySelector('prs-main')!;

		prs_main.appendChild(renderer.domElement);

		controls = new prs_controls;

		load_room();
	}

	function load_room() {
		// .. boot er up

		const loadingManager = new THREE.LoadingManager(function () {

			//ren.scene.add(elf);

		});

		const loader = new collada_loader(loadingManager);

		loader.load('/assets/first_apartment_bad.dae', function (collada) {

			const myScene = collada.scene;

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
			}

			myScene.traverse(traversal);

			const group = new THREE.Group();
			//group.rotation.set(0, -Math.PI / 2, 0);
			group.add(myScene);

			scene.add(group);

		});
	}

	export function render() {
		delta = clock.getDelta();

		//controls.update(delta);
		controls.loop(delta);

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene, camera);
	}
}

export default renderer;