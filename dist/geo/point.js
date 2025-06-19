import { c } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { FGType, pointT, richPointT } from "../literal/type.js";
export class Point {
    x;
    y;
    lineWidth;
    strokeStyle;
    kind = 850;
    field = {};
    constructor(x, y, lineWidth = 8, strokeStyle = color.black) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
    }
    set(key, v) {
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
    to_str() {
        return `Pt ${this.x} ${this.y}`;
    }
    typeof() {
        return new FGType(pointT);
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth / 2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
    }
}
export class RichPoint {
    x;
    y;
    lineWidth;
    strokeStyle;
    label;
    kind = 910;
    field = {};
    constructor(x, y, lineWidth = 8, strokeStyle = color.blue, label = "") {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.label = label;
        this.field["x"] = new FGNumber(this.x);
        this.field["y"] = new FGNumber(this.y);
    }
    to_str() {
        return `RPt ${this.x} ${this.y}`;
    }
    typeof() {
        return new FGType(richPointT);
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.lineWidth / 2, 0, TAU);
        c.fillStyle = this.strokeStyle;
        c.fill();
        c.strokeStyle = "#000";
        c.stroke();
    }
    draw_label() {
        c.textBaseline = "bottom";
        c.font = "16px monospace";
        c.fillText(this.label, this.x + 5, this.y - 5);
    }
}
