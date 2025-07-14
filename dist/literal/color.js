import { colorTVal } from "./type.js";
export class FGColor {
    r;
    g;
    b;
    a;
    constructor(r, g, b, a = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    to_str() {
        return `Color ${this.r},${this.g},${this.b},${this.a}`;
    }
    typeof() {
        return colorTVal;
    }
    to_hex() {
        return '#' + [this.r, this.g, this.b, this.a].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}
