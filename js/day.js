import physics from "./physics.js";
import player from "./player.js";
import points from "./points.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";
var day;
(function (day) {
    day.timestep = 1 / 60;
    function boot() {
        console.log('day setting up');
        day.gviewport = new viewport;
        day.day_main = document.querySelector('day-main');
        points.add([0, 0], [1, 1]);
        physics.boot();
        renderer.boot();
        day.gplayer = new player();
    }
    day.boot = boot;
    function loop(delta) {
        day.gplayer.loop(day.timestep);
        physics.loop(day.timestep);
        renderer.render();
    }
    day.loop = loop;
})(day || (day = {}));
(function () {
    console.log('iife');
})();
export default day;
