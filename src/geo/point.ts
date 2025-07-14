// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { type Value, FGNumber } from "../value.js"
import { FGType, pointT } from "../literal/type.js"

const c = canvas.ctx;

export class Point {
    field: Record<string, Value> = {};

    constructor( 
        public x: number,
        public y: number,
        public lineWidth: number = 8,
        public strokeStyle: string = color.black
    ) {
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
    }

    set(key: keyof typeof this.field, v: Value): void {
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

    to_str(): string {
        return `Pt ${this.x} ${this.y}`;
    }

    typeof(): FGType {
        return new FGType(pointT);
    }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth/2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }
}
