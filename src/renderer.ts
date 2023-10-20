import glob from "./glob.js";
import app from "./app.js";
import player from "./player.js";
import props from "./props.js";

const fragmentPost = `
varying vec2 vUv;
uniform int compression;
uniform sampler2D tDiffuse;
float factor = 4.0;
void main() {
	vec4 diffuse = texture2D( tDiffuse, vUv );

	diffuse = vec4(floor(diffuse.rgb * factor + 0.5) / factor, diffuse.a);

	gl_FragColor = diffuse;
	#include <colorspace_fragment>
}`


const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

namespace renderer {
	// set up three.js here

	export var scene, camera, renderer_, ambiance, clock;

	export var delta = 0;

	export var propsGroup;

	export var scene2, camera2, target, post, quad, plane

	export var postToggle = true;


	export function boot() {
		window['renderer'] = renderer;
		
		console.log('renderer boot');

		THREE.ColorManagement.enabled = true;

		clock = new THREE.Clock();

		propsGroup = new THREE.Group();

		propsGroup.updateMatrix();
		propsGroup.updateMatrixWorld();

		const material = new THREE.MeshLambertMaterial({ color: 'red' });
		const geometry = new THREE.RingGeometry(0.5, 1, 8);
		const mesh = new THREE.Mesh(geometry, material);
		mesh.add(new THREE.AxesHelper(1));
		propsGroup.add(mesh);

		scene = new THREE.Scene();
		scene.add(propsGroup);
		scene.background = new THREE.Color('white');

		scene2 = new THREE.Scene();
		scene2.matrixAutoUpdate = false;
		//scene2.background = new THREE.Color('white');

		target = new THREE.WebGLRenderTarget(512, 512, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter
		});
		post = new THREE.ShaderMaterial({
			uniforms: {
				tDiffuse: { value: target.texture },
				compression: { value: 1 }
			},
			vertexShader: vertexScreen,
			fragmentShader: fragmentPost,
			depthWrite: false
		});
		plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
		quad = new THREE.Mesh(plane, post);
		quad.matrixAutoUpdate = false;
		scene2.add(quad);

		redo();

		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		const helper = new THREE.AxesHelper(1);
		scene.add(helper);

		camera.position.z = 5;

		const dpi = window.devicePixelRatio;
		renderer_ = new THREE.WebGLRenderer({ antialias: false });
		renderer_.setPixelRatio(dpi);
		renderer_.setSize(window.innerWidth, window.innerHeight);
		renderer_.shadowMap.enabled = true;
		renderer_.shadowMap.type = THREE.BasicShadowMap;
		renderer_.setClearColor(0xffffff, 0.0);

		ambiance = new THREE.AmbientLight(0xffffff, 2);
		scene.add(ambiance);

		let sun = new THREE.DirectionalLight(0xffffff, 2);
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

		day_main.appendChild(renderer_.domElement);
		// test


		window.addEventListener('resize', onWindowResize);

		load_room();
	}

	function redo() {
		target.setSize(window.innerWidth, window.innerHeight);
		plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

		camera2 = new THREE.OrthographicCamera(
			window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -100, 100);
		camera2.updateProjectionMatrix();
	}

	function onWindowResize() {

		redo();

		renderer_.setSize(window.innerWidth, window.innerHeight);

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		render();

	}

	function load_room() {
		const loadingManager = new THREE.LoadingManager(function () {
		});

		const loader = new collada_loader(loadingManager);

		loader.load('./assets/first_apartment_bad.dae', function (collada) {

			const myScene = collada.scene;
			myScene.updateMatrixWorld();

			console.log('myscene', myScene.scale);

			function fix_sticker(material) {
				material.transparent = true;
				material.polygonOffset = true;
				material.polygonOffsetFactor = -4;
			}

			function fix(material) {
				if (material.name.includes('sticker'))
					fix_sticker(material);
				if (material.map) {
					// mineify
					//THREE.NearestFilter
					material.map.minFilter = material.map.magFilter = THREE.NearestFilter;
					material.map.anisotropy = renderer_.capabilities.getMaxAnisotropy();
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

	export function loop() {
		if (glob.developer)
			if (app.prompt_key('z') == 1)
				postToggle = !postToggle;
	}

	export function render() {
		loop();

		delta = clock.getDelta();

		frames++;
		time = (performance || Date).now();

		if (time >= prevTime + 1000) {

			fps = (frames * 1000) / (time - prevTime);

			prevTime = time;
			frames = 0;
			app.fluke_set_innerhtml('day-stats', `fps: ${fps}`);
		}

		if (postToggle) {
			renderer_.shadowMap.enabled = true;

			renderer_.setRenderTarget(target);
			renderer_.clear();
			renderer_.render(scene, camera);

			renderer_.shadowMap.enabled = false;

			renderer_.setRenderTarget(null);
			renderer_.clear();
			renderer_.render(scene2, camera2);
		}
		else {
			renderer_.shadowMap.enabled = true;

			renderer_.setRenderTarget(null);
			renderer_.clear();
			renderer_.render(scene, camera);
		}
	}
}

export default renderer;