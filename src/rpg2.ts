import app from "./app.js";
import points from "./points.js";
import viewport from "./viewport.js";

namespace rpg2 {
    export var gviewport: viewport;

    export function boot() {
        console.log('rpg2 setting up');
        
        gviewport = new viewport;
        points.add([0, 0], [1, 1]);
    }
    
    export function loop() {
        const x = app.prompt_key('x');
        console.log('woo'+x);
    }
}

(function(){
    console.log('iife');
    
})()

export default rpg2;