export class points {
    static add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }
    static equals(a, b) {
        return a[0] == b[0] && a[1] == b[1];
    }
}
export default points;
