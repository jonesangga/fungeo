import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { Class, FGType } from "../literal/type.js";
const c = canvas.ctx;
const w = canvas.w;
const h = canvas.h;
class Circle {
    x;
    y;
    r;
    strokeStyle = color.black;
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}
export class ApollonianT extends Class {
    fields = {};
    methods = {};
    to_str() {
        return "Apollonian";
    }
    equal(other) {
        return other instanceof ApollonianT;
    }
}
export const apollonianT = new ApollonianT();
export class Apollonian {
    x = w / 2;
    y = h / 2;
    enclosing_r = 100;
    strokeStyle = color.black;
    currentlyDrawn = false;
    gasket = [];
    static enclosing(r) {
        const apol = new Apollonian();
        apol.enclosing_r = r;
        apol.gasket.push(new Circle(apol.x, apol.y, r));
        apol.gasket.push(new Circle(apol.x - r / 2, apol.y, r / 2));
        apol.gasket.push(new Circle(apol.x + r / 2, apol.y, r / 2));
        return apol;
    }
    to_str() {
        return `Apollonian`;
    }
    typeof() {
        return new FGType(apollonianT);
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.enclosing_r, 0, TAU);
        c.strokeStyle = this.strokeStyle;
        c.stroke();
        for (const circle of this.gasket) {
            circle.draw();
        }
    }
}
