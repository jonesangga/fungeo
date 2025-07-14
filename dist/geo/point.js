import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { FGType, pointT } from "../literal/type.js";
const c = canvas.ctx;
export class Point {
    x;
    y;
    lineWidth;
    strokeStyle;
    field = {};
    constructor(x, y, lineWidth = 8, strokeStyle = color.black) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
    }
    set(key, v) {
        if (!(v instanceof FGNumber))
            throw new Error("setter error");
        switch (key) {
            case "x": {
                this.field.x = v;
                this.x = v.value;
                break;
            }
            case "y": {
                this.field.y = v;
                this.y = v.value;
                break;
            }
        }
    }
    to_str() {
        return `Pt ${this.x} ${this.y}`;
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
}
