import app from "./app.js";
import points from "./points.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";

namespace prs {
	export var prs_main;

	export var gviewport: viewport;

	export function boot() {
		console.log('rpg2 setting up');

		gviewport = new viewport;

		prs_main = document.querySelector('prs-main');

		points.add([0, 0], [1, 1]);

		renderer.boot();
	}

	export function loop() {
		const x = app.prompt_key('x');
		console.log('woo' + x);

		renderer.render();
	}
}

(function () {
	console.log('iife');

})()

export default prs;