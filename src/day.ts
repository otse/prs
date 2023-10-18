import app from "./app.js";
import physics from "./physics.js";
import player from "./player.js";
import points from "./pts.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";

namespace day {
	export const timestep = 1 / 60;
	export var day_main;

	export var gviewport: viewport;
	export var gplayer: player;

	export function boot() {
		console.log('day setting up');

		gviewport = new viewport;

		day_main = document.querySelector('day-main');

		points.add([0, 0], [1, 1]);

		physics.boot();
		renderer.boot();

		gplayer = new player();

	}

	export function loop(delta: number) {

		gplayer.loop(delta);
		physics.loop(day.timestep);
		renderer.render();

	}
}

(function () {
	console.log('iife');

})()

export default day;