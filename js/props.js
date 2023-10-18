import physics from "./physics.js";
var props;
(function (props_1) {
    props_1.props = [];
    function factory(object) {
        switch (object.name) {
            case "fridge":
                console.log('we found your fridge alright');
                new prop(object);
                break;
            default:
        }
    }
    props_1.factory = factory;
    class prop {
        physic;
        constructor(object) {
            props_1.props.push(this);
            new physics.physic(this);
        }
        void() {
        }
    }
    props_1.prop = prop;
})(props || (props = {}));
export default props;
