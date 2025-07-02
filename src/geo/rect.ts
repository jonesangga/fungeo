// @jonesangga, 2025, MIT License.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Kind } from "../value.js"
import { FGType, rectT } from "../literal/type.js"

const c = canvas.ctx;

export default class Rect {
    kind: Kind.Rect = Kind.Rect;

    constructor( 
        public x: number,
        public y: number,
        public w: number,
        public h: number,
        public strokeStyle: string = color.black,
        public fillStyle: string = color.nocolor
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
