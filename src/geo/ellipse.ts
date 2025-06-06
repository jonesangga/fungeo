// @jonesangga, 2025, MIT License.
//
// TODO: Think about how to set the rotation.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Kind } from "../value.js"
import { ellipseT } from "../type.js"
import { FGType } from "../literal/type.js"

export default class Ellipse {
    kind: Kind.Ellipse = Kind.Ellipse;

    constructor( 
        public x: number,
        public y: number,
        public rx: number,
        public ry: number,
        public t: number = 0,
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
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
