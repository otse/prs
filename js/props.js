import day from "./day.js";
import physics from "./physics.js";
import renderer from "./renderer.js";
var props;
(function (props_1) {
    function factory(object) {
        let prop;
        if (!object.name)
            return;
        const [kind, preset] = object.name.split('_');
        switch (kind) {
            case 'prop':
                console.log('new prop', kind, preset);
                prop = new pbox(object, { mass: 0, preset: preset });
                break;
            case 'light':
                prop = new plight(object, { mass: 0, preset: preset });
                break;
            case 'wall':
            case 'solid':
                prop = new pbox(object, { mass: 0 });
                break;
            case 'door':
                prop = new pdoor(object, { mass: 0, preset: preset });
                break;
            case 'fridge':
                prop = new pbox(object, { mass: 3, material: 'metal' });
                break;
            case 'cup':
                prop = new pbox(object, { mass: 0.2, material: 'plastic' });
                break;
            case 'compactdiscs':
                prop = new pbox(object, { mass: 0.7, material: 'cardboard' });
                break;
            case 'matress':
                prop = new pbox(object, { mass: 1.0, material: 'cardboard' });
                break;
            default:
        }
        if (prop)
            prop.kind = kind;
        return prop;
    }
    props_1.factory = factory;
    function boot() {
    }
    props_1.boot = boot;
    function loop() {
        for (let prop of props_1.props)
            prop.loop();
    }
    props_1.loop = loop;
    function take_collada_prop(prop) {
        // the prop is sitting in a rotated, scaled scene graph
        // set it apart
        prop.group = new THREE.Group();
        prop.object.matrixWorld.decompose(prop.group.position, prop.group.quaternion, prop.group.scale);
        //console.log('take collada prop', prop.object.name, prop.object.quaternion);
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
    props_1.take_collada_prop = take_collada_prop;
    props_1.props = [];
    ;
    class prop {
        object;
        parameters;
        kind;
        oldRotation;
        group;
        master;
        fbody;
        aabb;
        constructor(object, parameters) {
            this.object = object;
            this.parameters = parameters;
            props_1.props.push(this);
        }
        complete() {
            take_collada_prop(this);
            this.measure();
            this.setup();
        }
        setup() {
        }
        loop() {
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
    props_1.prop = prop;
    class pbox extends prop {
        constructor(object, parameters) {
            super(object, parameters);
        }
        setup() {
            new physics.fbox(this);
            if (this.object.name == 'wall')
                this.object.visible = false;
        }
        loop() {
            this.group.position.copy(this.fbody.body.position);
            this.group.quaternion.copy(this.fbody.body.quaternion);
            this.fbody.loop();
        }
    }
    props_1.pbox = pbox;
    class pdoor extends prop {
        constructor(object, parameters) {
            super(object, parameters);
        }
        setup() {
            new physics.fdoor(this);
            //this.object.add(new THREE.AxesHelper(20));
            //this.group.add(new THREE.AxesHelper(20));
        }
        loop() {
            this.group.position.copy(this.fbody.body.position);
            this.group.quaternion.copy(this.fbody.body.quaternion);
            this.fbody.loop();
        }
    }
    props_1.pdoor = pdoor;
    const light_presets = {
        sconce: { hide: false, color: 'white', intensity: 0.1, distance: 1, offset: [0, 0, -5] },
        openwindow: { hide: true, color: 'white', intensity: 0.5, distance: 3, decay: 0.3 },
        none: { hide: true, color: 'white', intensity: 0.1, distance: 10 }
    };
    class plight extends prop {
        constructor(object, parameters) {
            super(object, parameters);
        }
        setup() {
            //this.object.visible = false;
            const preset = light_presets[this.parameters.preset || 'none'];
            const center = new THREE.Vector3();
            this.object.visible = !preset.hide;
            this.aabb.getCenter(center);
            let light = new THREE.PointLight(preset.color, preset.intensity, preset.distance, preset.decay);
            light.position.fromArray(preset.offset || [0, 0, 0]);
            //this.group.add(new THREE.AxesHelper(10));
            this.group.add(light);
        }
        loop() {
        }
    }
    props_1.plight = plight;
    props_1.impact_sounds = {
        'cardboard': {
            soft: [
                'cardboard_box_impact_soft1',
                'cardboard_box_impact_soft2',
                'cardboard_box_impact_soft3',
                'cardboard_box_impact_soft4',
                'cardboard_box_impact_soft5',
                'cardboard_box_impact_soft6',
                'cardboard_box_impact_soft7',
            ],
            hard: [
                'cardboard_box_impact_hard1',
                'cardboard_box_impact_hard2',
                'cardboard_box_impact_hard3',
                'cardboard_box_impact_hard4',
                'cardboard_box_impact_hard5',
                'cardboard_box_impact_hard6',
                'cardboard_box_impact_hard7',
            ]
        },
        'plastic': {
            soft: [
                'plastic_box_impact_soft1',
                'plastic_box_impact_soft2',
                'plastic_box_impact_soft3',
                'plastic_box_impact_soft4',
            ],
            hard: [
                'plastic_box_impact_hard1',
                'plastic_box_impact_hard2',
                'plastic_box_impact_hard3',
                'plastic_box_impact_hard4',
            ]
        },
        'metal': {
            soft: [
                'metal_solid_impact_soft1',
                'metal_solid_impact_soft2',
                'metal_solid_impact_soft3',
            ],
            hard: [
                'metal_solid_impact_hard1',
                'metal_solid_impact_hard4',
                'metal_solid_impact_hard5',
            ],
        }
    };
})(props || (props = {}));
export default props;
