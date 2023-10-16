import day_controls from "./controls.js";
var renderer;
(function (renderer_1) {
    // set up three.js here
    var cube;
    function boot() {
        console.log('renderer boot');
        renderer_1.clock = new THREE.Clock();
        renderer_1.scene = new THREE.Scene();
        renderer_1.scene.background = new THREE.Color('white');
        renderer_1.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        //scene.add(cube);
        const helper = new THREE.AxesHelper(1);
        renderer_1.scene.add(helper);
        renderer_1.camera.position.z = 5;
        renderer_1.renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer_1.renderer.setSize(window.innerWidth, window.innerHeight);
        renderer_1.renderer.shadowMap.enabled = true;
        renderer_1.renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer_1.ambient_light = new THREE.AmbientLight(0xffffff, 2);
        renderer_1.scene.add(renderer_1.ambient_light);
        let sun = new THREE.DirectionalLight(0xffffff, 2.0);
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        const extend = 1000;
        sun.position.set(-30, 200, -150);
        sun.castShadow = true;
        renderer_1.scene.add(sun);
        renderer_1.scene.add(sun.target);
        const day_main = document.querySelector('day-main');
        day_main.appendChild(renderer_1.renderer.domElement);
        // test
        renderer_1.controls = new day_controls;
        window.addEventListener('resize', onWindowResize);
        load_room();
    }
    renderer_1.boot = boot;
    function onWindowResize() {
        renderer_1.renderer.setSize(window.innerWidth, window.innerHeight);
        renderer_1.camera.aspect = window.innerWidth / window.innerHeight;
        renderer_1.camera.updateProjectionMatrix();
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
                    material.map.anisotropy = renderer_1.renderer.capabilities.getMaxAnisotropy();
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
            renderer_1.scene.add(group);
        });
    }
    function render() {
        renderer_1.delta = renderer_1.clock.getDelta();
        //controls.update(delta);
        renderer_1.controls.loop(renderer_1.delta);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer_1.renderer.setRenderTarget(null);
        renderer_1.renderer.clear();
        renderer_1.renderer.render(renderer_1.scene, renderer_1.camera);
    }
    renderer_1.render = render;
})(renderer || (renderer = {}));
export default renderer;
