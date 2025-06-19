// @jonesangga, 2025, MIT License.
//
// A Point is a filled circle.

import { c } from "../ui/canvas.js"
import { color, TAU } from "../data/constant.js"
import { Value, Kind, FGNumber, FGString } from "../value.js"
import { type Type, FGType, pointT, richPointT, numberT, stringT } from "../literal/type.js"

export class Point {
    kind: Kind.Point = Kind.Point;
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

    set(key: keyof typeof this.field, v: FGNumber): void {
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

export class RichPoint {
    kind: Kind.RichPoint = Kind.RichPoint;
    field: Record<string, Value> = {};

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

    to_str(): string {
        return `RPt ${this.x} ${this.y}`;
    }

    typeof(): FGType {
        return new FGType(richPointT);
    }

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
