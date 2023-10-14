import app from "./app.js";
import points from "./points.js";
import viewport from "./viewport.js";
var rpg2;
(function (rpg2) {
    function boot() {
        console.log('rpg2 setting up');
        rpg2.gviewport = new viewport;
        points.add([0, 0], [1, 1]);
    }
    rpg2.boot = boot;
    function loop() {
        const x = app.prompt_key('x');
        console.log('woo' + x);
    }
    rpg2.loop = loop;
})(rpg2 || (rpg2 = {}));
(function () {
    console.log('iife');
})();
export default rpg2;
