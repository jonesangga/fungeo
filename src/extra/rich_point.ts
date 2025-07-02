// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.
//
// TODO: This is broken.

import { defaultCanvas as canvas } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, FGNumber } from "../value.js"

const c = canvas.ctx;

export class RichPoint {
    field: Record<string, any> = {};

    constructor(
        public x: number,
        public y: number,
        public lineWidth: number = 8,
        public strokeStyle: string = color.blue,
        public label: string = ""
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
        return `RPt ${this.x} ${this.y}`;
    }

    // typeof(): FGType {
        // return new FGType(richPointT);
    // }

    draw(): void {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth/2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
        c.strokeStyle = "#000";
        c.stroke();
    }

    draw_label(): void {
        c.textBaseline = "bottom";
        c.font = "16px monospace"
        c.fillText(this.label, this.x + 5, this.y - 5);
    }
}
