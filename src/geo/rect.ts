// @jonesangga, 2025, MIT License.

import { c } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Value, Kind, FGNumber, FGString } from "../value.js"
import { FGType, rectT, numberT } from "../literal/type.js"

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
