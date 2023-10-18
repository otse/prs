import physics from "./physics.js";

namespace props {

	export var props: prop[] = []

	export function factory(object: any) {		
		switch (object.name) {
			case "fridge":
				console.log('we found your fridge alright');
				new prop(object);
				break;
			default:
		}
	}

	export class prop {
		physic: physics.physic;
		constructor(object) {
			props.push(this);
			new physics.physic(this);
		}
		void() {
			
		}
	}

}

export default props;