import glob from "./glob.js";
import app from "./app.js";
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
}`;
const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
var renderer;
(function (renderer) {
    // set up three.js here
    renderer.delta = 0;
    renderer.postToggle = true;
    function boot() {
        window['renderer'] = renderer;
        console.log('renderer boot');
        THREE.ColorManagement.enabled = true;
        renderer.clock = new THREE.Clock();
        renderer.propsGroup = new THREE.Group();
        renderer.propsGroup.updateMatrix();
        renderer.propsGroup.updateMatrixWorld();
        const material = new THREE.MeshLambertMaterial({ color: 'red' });
        const geometry = new THREE.RingGeometry(0.5, 1, 8);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.add(new THREE.AxesHelper(1));
        renderer.propsGroup.add(mesh);
        renderer.scene = new THREE.Scene();
        renderer.scene.add(renderer.propsGroup);
        renderer.scene.background = new THREE.Color('white');
        renderer.scene2 = new THREE.Scene();
        renderer.scene2.matrixAutoUpdate = false;
        //scene2.background = new THREE.Color('white');
        renderer.target = new THREE.WebGLRenderTarget(512, 512, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter
        });
        renderer.post = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: renderer.target.texture },
                compression: { value: 1 }
            },
            vertexShader: vertexScreen,
            fragmentShader: fragmentPost,
            depthWrite: false
        });
        renderer.plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
        renderer.quad = new THREE.Mesh(renderer.plane, renderer.post);
        renderer.quad.matrixAutoUpdate = false;
        renderer.scene2.add(renderer.quad);
        redo();
        renderer.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const helper = new THREE.AxesHelper(1);
        renderer.scene.add(helper);
        renderer.camera.position.z = 5;
        const dpi = window.devicePixelRatio;
        renderer.renderer_ = new THREE.WebGLRenderer({ antialias: false });
        renderer.renderer_.setPixelRatio(dpi);
        renderer.renderer_.setSize(window.innerWidth, window.innerHeight);
        renderer.renderer_.shadowMap.enabled = true;
        renderer.renderer_.shadowMap.type = THREE.BasicShadowMap;
        renderer.renderer_.setClearColor(0xffffff, 0.0);
        renderer.ambiance = new THREE.AmbientLight(0xffffff, 2);
        renderer.scene.add(renderer.ambiance);
        let sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        const extend = 1000;
        sun.position.set(-30, 200, -150);
        sun.castShadow = true;
        renderer.scene.add(sun);
        renderer.scene.add(sun.target);
        const day_main = document.querySelector('day-main');
        day_main.appendChild(renderer.renderer_.domElement);
        // test
        window.addEventListener('resize', onWindowResize);
        load_room();
    }
    renderer.boot = boot;
    function redo() {
        renderer.target.setSize(window.innerWidth, window.innerHeight);
        renderer.plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
        renderer.camera2 = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -100, 100);
        renderer.camera2.updateProjectionMatrix();
    }
    function onWindowResize() {
        redo();
        renderer.renderer_.setSize(window.innerWidth, window.innerHeight);
        renderer.camera.aspect = window.innerWidth / window.innerHeight;
        renderer.camera.updateProjectionMatrix();
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
                    material.map.anisotropy = renderer.renderer_.capabilities.getMaxAnisotropy();
                }
            }
            const propss = [];
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
            renderer.scene.add(group);
        });
    }
    var prevTime = 0, time = 0, frames = 0;
    renderer.fps = 0;
    function loop() {
        if (glob.developer)
            if (app.prompt_key('z') == 1)
                renderer.postToggle = !renderer.postToggle;
    }
    renderer.loop = loop;
    function render() {
        loop();
        renderer.delta = renderer.clock.getDelta();
        frames++;
        time = (performance || Date).now();
        if (time >= prevTime + 1000) {
            renderer.fps = (frames * 1000) / (time - prevTime);
            prevTime = time;
            frames = 0;
            app.fluke_set_innerhtml('day-stats', `fps: ${renderer.fps}`);
        }
        if (renderer.postToggle) {
            renderer.renderer_.shadowMap.enabled = true;
            renderer.renderer_.setRenderTarget(renderer.target);
            renderer.renderer_.clear();
            renderer.renderer_.render(renderer.scene, renderer.camera);
            renderer.renderer_.shadowMap.enabled = false;
            renderer.renderer_.setRenderTarget(null);
            renderer.renderer_.clear();
            renderer.renderer_.render(renderer.scene2, renderer.camera2);
        }
        else {
            renderer.renderer_.shadowMap.enabled = true;
            renderer.renderer_.setRenderTarget(null);
            renderer.renderer_.clear();
            renderer.renderer_.render(renderer.scene, renderer.camera);
        }
    }
    renderer.render = render;
})(renderer || (renderer = {}));
export default renderer;
