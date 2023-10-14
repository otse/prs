export class points {
    static add(a: vec2, b: vec2) {
        return [a[0] + b[0], a[1] + b[1]];
    }

    static equals(a: vec2, b: vec2): boolean {
		return a[0] == b[0] && a[1] == b[1];
	}
}

export default points;