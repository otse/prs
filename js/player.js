import app from "./app.js";
import physics from "./physics.js";
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
        const instructions = document.querySelector('day-instructions');
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
        // Create a sphere
        var mass = 5, radius = 1.3;
        var sphereShape = new CANNON.Sphere(radius);
        var sphereBody = new CANNON.Body({ mass: mass });
        sphereBody.addShape(sphereShape);
        sphereBody.position.set(0, 5, 0);
        sphereBody.linearDamping = 0.9;
        this.cannonBody = sphereBody;
        this.velocity = this.cannonBody.velocity;
        physics.world.addBody(sphereBody);
        var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
        var upAxis = new CANNON.Vec3(0, 1, 0);
        sphereBody.addEventListener("collide", function (e) {
            var contact = e.contact;
            // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
            // We do not yet know which one is which! Let's check.
            if (contact.bi.id == sphereBody.id) // bi is the player body, flip the contact normal
                contact.ni.negate(contactNormal);
            else
                contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is
            // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
            if (contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
                this.canJump = true;
        });
    }
    velocityFactor = 20.0;
    quat = new THREE.Quaternion();
    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    inputVelocity = new THREE.Vector3();
    euler = new THREE.Euler();
    loop(delta) {
        if (this.plc.enabled === false)
            return;
        delta *= 0.1;
        this.inputVelocity.set(0, 0, 0);
        if (app.prompt_key('w')) {
            this.inputVelocity.z = -this.velocityFactor * delta;
        }
        if (app.prompt_key('s')) {
            this.inputVelocity.z = this.velocityFactor * delta;
        }
        if (app.prompt_key('a')) {
            this.inputVelocity.x = -this.velocityFactor * delta;
        }
        if (app.prompt_key('d')) {
            this.inputVelocity.x = this.velocityFactor * delta;
        }
        const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
        const camera = this.plc.getObject();
        _euler.setFromQuaternion(camera.quaternion);
        // Convert velocity to world coordinates
        this.euler.x = _euler.x;
        this.euler.y = _euler.y;
        this.euler.order = "XYZ";
        this.quat.setFromEuler(this.euler);
        this.inputVelocity.applyQuaternion(this.quat);
        //quat.multiplyVector3(this.inputVelocity);
        // Add to the object
        this.velocity.x += this.inputVelocity.x;
        this.velocity.z += this.inputVelocity.z;
        this.plc.getObject().position.copy(this.cannonBody.position);
    }
}
export default player;
