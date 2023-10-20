import glob from "./glob.js";
import physics from "./physics.js";
import player from "./player.js";
import props from "./props.js";
import points from "./pts.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";
glob.developer = true;
var day;
(function (day) {
    day.inch = 0.0254;
    day.inchMeter = (1 / 0.0254);
    day.timeStep = (1 / 60);
    day.dt = 0;
    function boot() {
        console.log('day setting up');
        day.gviewport = new viewport;
        day.day_main = document.querySelector('day-main');
        points.add([0, 0], [1, 1]);
        physics.boot();
        props.boot();
        renderer.boot();
        day.gplayer = new player();
        // new physics.simple_box();
    }
    day.boot = boot;
    function loop(delta) {
        day.dt = delta;
        day.gplayer.loop(delta);
        physics.loop(day.timeStep);
        props.loop();
        renderer.render();
    }
    day.loop = loop;
})(day || (day = {}));
(function () {
    console.log('iife');
})();
export default day;
