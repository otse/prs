import points from "./points.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";
var day;
(function (day) {
    function boot() {
        console.log('day setting up');
        day.gviewport = new viewport;
        day.day_main = document.querySelector('day-main');
        points.add([0, 0], [1, 1]);
        renderer.boot();
    }
    day.boot = boot;
    function loop() {
        renderer.render();
    }
    day.loop = loop;
})(day || (day = {}));
(function () {
    console.log('iife');
})();
export default day;
