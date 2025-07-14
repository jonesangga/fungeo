// @jonesangga, 2025, MIT License.
//
// TODO: Think about how to set the rotation.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { FGType, ellipseT } from "../literal/type.js"

const c = canvas.ctx;

export default class Ellipse {
    constructor( 
        readonly x: number,
        readonly y: number,
        readonly rx: number,
        readonly ry: number,
        readonly t: number = 0,
        readonly strokeStyle: string = color.black,
        readonly fillStyle: string = color.nocolor
    ) {}

    to_str(): string {
        return `E ${this.x} ${this.y} ${this.rx} ${this.ry}`;
    }

    typeof(): FGType {
        return new FGType(ellipseT);
    }

    draw(): void {
        c.beginPath();
        c.ellipse(this.x, this.y, this.rx, this.ry, this.t, 0, TAU);
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fill();
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.stroke();
        }
    }
}
