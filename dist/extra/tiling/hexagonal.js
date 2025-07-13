import { defaultCanvas as canvas } from "../../ui/canvas.js";
import { color } from "../../data/constant.js";
import { Class, FGType } from "../../literal/type.js";
const c = canvas.ctx;
export class HexagonalT extends Class {
    fields = {};
    methods = {};
    to_str() {
        return "HexagonalT";
    }
    equal(other) {
        return other instanceof HexagonalT;
    }
}
export const hexagonalT = new HexagonalT();
const sqrt3 = Math.sqrt(3);
export class Hexagonal {
    hexX = [1.5, 0, -1.5, -1.5, 0, 1.5];
    hexY = [0.5, 1, 0.5, -0.5, -1, -0.5].map(x => x * sqrt3);
    genT = [3, 0];
    genS = [1.5, 1.5 * sqrt3];
    kmax = 5;
    lmax = 5;
    cx = canvas.w / 2;
    cy = canvas.h / 2;
    strokeStyle = color.black;
    currentlyDrawn = false;
    constructor() { }
    to_str() {
        return `Hexagonal`;
    }
    typeof() {
        return new FGType(hexagonalT);
    }
    draw() {
        let s = 20;
        c.save();
        c.translate(this.cx, this.cy);
        for (let i = -this.kmax; i < this.kmax; i++) {
            for (let j = -this.lmax; j < this.lmax; j++) {
                let trans = [this.genT[0] * i + this.genS[0] * j,
                    this.genT[1] * i + this.genS[1] * j];
                console.log(trans);
                c.beginPath();
                for (let k = 0; k < 6; k++) {
                    c.lineTo((this.hexX[k] + trans[0]) * s, (this.hexY[k] + trans[1]) * s);
                }
                c.closePath();
                c.strokeStyle = this.strokeStyle;
                c.stroke();
            }
        }
        c.restore();
    }
}
