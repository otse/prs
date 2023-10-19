import app from "./app.js";
import physics from "./physics.js";
import player from "./player.js";
import props from "./props.js";
import points from "./pts.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";

namespace day {
	export const inch = 0.0254;
	export const inchMeter = 1 / 0.0254;
	export const timeStep = 1 / 60;
	export var day_main;
	export var dt = 0;

	export var gviewport: viewport;
	export var gplayer: player;

	export function boot() {
		console.log('day setting up');

		gviewport = new viewport;

		day_main = document.querySelector('day-main');

		points.add([0, 0], [1, 1]);

		physics.boot();
		props.boot();
		renderer.boot();

		gplayer = new player();

		new physics.simple_box();

	}

	export function loop(delta: number) {

		dt = delta;

		gplayer.loop(delta);
		physics.loop(day.timeStep);
		props.loop();
		renderer.render();

	}
}

(function () {
	console.log('iife');

})()

export default day;