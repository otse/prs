var renderer;
(function (renderer_1) {
    // set up three.js here
    var cube;
    function boot() {
        console.log('renderer boot');
        renderer_1.clock = new THREE.Clock();
        renderer_1.scene = new THREE.Scene();
        renderer_1.scene.background = new THREE.Color('#444');
        renderer_1.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new THREE.Mesh(geometry, material);
        renderer_1.scene.add(cube);
        renderer_1.camera.position.z = 5;
        renderer_1.renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer_1.renderer.setSize(window.innerWidth, window.innerHeight);
        renderer_1.ambient_light = new THREE.AmbientLight(0xffffff, 1);
        renderer_1.scene.add(renderer_1.ambient_light);
        /*let sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(-100, 100 * 2, 100 / 2);
        scene.add(sun);
        scene.add(sun.target);*/
        const prs_main = document.querySelector('prs-main');
        prs_main.appendChild(renderer_1.renderer.domElement);
        renderer_1.controls = new first_person_controls(renderer_1.camera, renderer_1.renderer.domElement);
        renderer_1.controls.lookSpeed = 0.2;
        renderer_1.controls.movementSpeed = 4;
        load_room();
    }
    renderer_1.boot = boot;
    function load_room() {
        // .. boot er up
        const loadingManager = new THREE.LoadingManager(function () {
            //ren.scene.add(elf);
        });
        const loader = new collada_loader(loadingManager);
        loader.load('/assets/first_apartment_bad.dae', function (collada) {
            //wastes.gview.zoomIndex = 0;
            const my_scene = collada.scene;
            const group = new THREE.Group();
            group.rotation.set(0, -Math.PI / 2, 0);
            group.add(my_scene);
            renderer_1.scene.add(group);
            /*myScene = collada.scene;
            let group = new Group;
            group.rotation.set(0, -Math.PI / 2, 0);
            group.position.set(wastes.size, 0, 0);
            group.add(myScene);

            //console.log(elf);

            function fix(material: MeshLambertMaterial) {
                //material.color = new THREE.Color('red');
                material.minFilter = material.magFilter = THREE.LinearFilter;
            }
            
            function traversal(object) {
                if (object.material) {
                    if (!object.material.length)
                        fix(object.material);
                    else
                        for (let material of object.material)
                            fix(material);
                }
            }

            myScene.traverse(traversal);

            //group.add(new AxesHelper(300));
            console.log(myScene.scale);

            const zoom = 90; // 60 hires, 30 lowres
            myScene.scale.multiplyScalar(zoom);
            //elf.rotation.set(-Math.PI / 2, 0, 0);
            myScene.position.set(1, 0, 0);

            ren.scene.add(group);

            let sun = new DirectionalLight(0xffffff, 0.35);
            sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
            //sun.add(new AxesHelper(100));
            group.add(sun);
            group.add(sun.target);

            window['group'] = group;
            window['elf'] = myScene;*/
        });
    }
    function render() {
        renderer_1.delta = renderer_1.clock.getDelta();
        renderer_1.controls.update(renderer_1.delta);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer_1.renderer.setRenderTarget(null);
        renderer_1.renderer.clear();
        renderer_1.renderer.render(renderer_1.scene, renderer_1.camera);
    }
    renderer_1.render = render;
})(renderer || (renderer = {}));
export default renderer;
