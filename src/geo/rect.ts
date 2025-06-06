// @jonesangga, 2025, MIT License.

import { c } from "../ui/canvas.js"
import { color } from "../data/constant.js"
import { Value, Kind, FGNumber, FGString } from "../value.js"
import { FGType, StructT, rectT, numberT } from "../literal/type.js"

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

    member(key: keyof typeof s): Value {
        switch (key) {
            case "x": return new FGNumber(this.x);
            case "y": return new FGNumber(this.y);
            case "w": return new FGNumber(this.w);
            case "h": return new FGNumber(this.h);
            // case "strokeStyle": return new FGString(this.strokeStyle);
            // case "fillStyle": return new FGString(this.fillStyle);
            default:
                unreachable(key);
        }
    }

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

function unreachable(key: never): never {
    throw new Error();
}

let s = {
    x: numberT,
    y: numberT,
    w: numberT,
    h: numberT,
};
export const rectStruct = new FGType(new StructT(s));
