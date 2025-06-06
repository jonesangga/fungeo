import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { FGType, StructT, pointT, numberT } from "../literal/type.js";
export default class Point {
    x;
    y;
    lineWidth;
    strokeStyle;
    kind = 850;
    constructor(x, y, lineWidth = 5, strokeStyle = color.black) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
    }
    to_str() {
        return `P ${this.x} ${this.y}`;
    }
    typeof() {
        return new FGType(pointT);
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth / 2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }
    member(key) {
        switch (key) {
            case "x": return new FGNumber(this.x);
            case "y": return new FGNumber(this.y);
            default:
                unreachable(key);
        }
    }
}
function unreachable(key) {
    throw new Error();
}
let s = {
    x: numberT,
    y: numberT,
};
export const pointStruct = new FGType(new StructT(s));
