import { defaultCanvas as canvas } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
const c = canvas.ctx;
export class RichPoint {
    x;
    y;
    lineWidth;
    strokeStyle;
    label;
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
    set(key, v) {
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
    to_str() {
        return `RPt ${this.x} ${this.y}`;
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
