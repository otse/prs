import app from "./app.js";
import points from "./points.js";
import renderer from "./renderer.js";
import viewport from "./viewport.js";
var prs;
(function (prs) {
    function boot() {
        console.log('rpg2 setting up');
        prs.gviewport = new viewport;
        prs.prs_main = document.querySelector('prs-main');
        points.add([0, 0], [1, 1]);
        renderer.boot();
    }
    prs.boot = boot;
    function loop() {
        const x = app.prompt_key('x');
        console.log('woo' + x);
        renderer.render();
    }
    prs.loop = loop;
})(prs || (prs = {}));
(function () {
    console.log('iife');
})();
export default prs;
