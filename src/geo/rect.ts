// @jonesangga, 2025, MIT License.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { FGType, rectT } from "../literal/type.js"

const c = canvas.ctx;

export default class Rect {
    constructor( 
        readonly x: number,
        readonly y: number,
        readonly w: number,
        readonly h: number,
        readonly strokeStyle: string = color.black,
        readonly fillStyle: string = color.nocolor
    ) {}

    to_str(): string {
        return `R ${this.x} ${this.y} ${this.w} ${this.h}`;
    }

    typeof(): FGType {
        return new FGType(rectT);
    }

    draw(): void {
        if (this.fillStyle !== "") {
            c.fillStyle = this.fillStyle;
            c.fillRect(this.x, this.y, this.w, this.h);
        }
        if (this.strokeStyle !== "") {
            c.strokeStyle = this.strokeStyle;
            c.strokeRect(this.x, this.y, this.w, this.h);
        }
    }
}
