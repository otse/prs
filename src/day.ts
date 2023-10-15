import app from "./app.js";
import points from "./points.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";

namespace day {
	export var day_main;

	export var gviewport: viewport;

	export function boot() {
		console.log('rpg2 setting up');

		gviewport = new viewport;

		day_main = document.querySelector('day-main');

		points.add([0, 0], [1, 1]);

		renderer.boot();
	}

	export function loop() {

		renderer.render();

	}
}

(function () {
	console.log('iife');

})()

export default day;