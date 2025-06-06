import { colorT } from "../type.js";
import { FGType } from "./type.js";
const colorTVal = new FGType(colorT);
export class FGColor {
    r;
    g;
    b;
    a;
    kind = 455;
    constructor(r, g, b, a = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    to_str() {
        return `Color ${this.r},${this.g},${this.b},${this.a}`;
    }
    to_hex() {
        return '#' + [this.r, this.g, this.b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    typeof() {
        return colorTVal;
    }
    equal(other) {
        console.log("FGType.equal() is not implemented yet");
        return false;
    }
}
