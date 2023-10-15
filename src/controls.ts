import app from "./app.js";
import renderer from "./renderer.js";

class prs_controls {

	examples;

	constructor() {
		this.setup();
	}

	setup() {
		const instructions = document.querySelector('prs-instructions')! as HTMLElement;

		this.examples = new pointer_lock_controls(renderer.camera, renderer.renderer.domElement);
		this.examples.enabled = true;
		
		this.examples.getObject().position.y = 1.5;

		const controler = this.examples;

		instructions.addEventListener('click', function () {
			controler.lock();
		});

		this.examples.addEventListener('lock', function () {
			console.log('lock');
			instructions.style.display = 'none';
			//blocker.style.display = 'none';
		});

		this.examples.addEventListener('unlock', function () {
			console.log('unlock');
			//blocker.style.display = 'block';
			instructions.style.display = '';
		});

		renderer.scene.add(this.examples.getObject());
	}

	loop(delta: number) {

		const sprint = 2;
		let speed = 2;

		if (app.prompt_key('shift'))
			speed *= sprint;

		if (app.prompt_key('w'))
			this.examples.moveForward(speed * delta);

		if (app.prompt_key('s'))
			this.examples.moveForward(-speed * delta);

		if (app.prompt_key('d'))
			this.examples.moveRight(speed * delta);

		if (app.prompt_key('a'))
			this.examples.moveRight(-speed * delta);

		if (app.prompt_key('r'))
			this.examples.getObject().position.y += 1 * delta;

		if (app.prompt_key('f'))
			this.examples.getObject().position.y -= 1 * delta;;
	}
}

export default prs_controls;