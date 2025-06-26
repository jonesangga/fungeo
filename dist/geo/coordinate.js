import { c, w, h } from "../ui/canvas.js";
import { color } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { FGType, coordT } from "../literal/type.js";
export class Coord {
    xl;
    xr;
    yl;
    yr;
    strokeStyle;
    kind = 720;
    field = {};
    constructor(xl = -5, xr = 5, yl = -5, yr = 5, strokeStyle = color.black) {
        this.xl = xl;
        this.xr = xr;
        this.yl = yl;
        this.yr = yr;
        this.strokeStyle = strokeStyle;
        this.field["xl"] = new FGNumber(this.xl);
        this.field["xr"] = new FGNumber(this.xr);
        this.field["yl"] = new FGNumber(this.yl);
        this.field["yr"] = new FGNumber(this.yr);
    }
    to_str() {
        return `Coord [${this.xl}, ${this.xr}] [${this.yl}, ${this.yr}]`;
    }
    typeof() {
        return new FGType(coordT);
    }
    draw() {
        let stepX = w / (this.xr - this.xl);
        let stepY = h / (this.yr - this.yl);
        let x = 0;
        let y = 0;
        c.beginPath();
        for (let i = 0; i < (this.xr - this.xl + 1); i++) {
            c.moveTo(x, 0);
            c.lineTo(x, h);
            x += stepX;
        }
        for (let i = 0; i < (this.yr - this.yl + 1); i++) {
            c.moveTo(0, y);
            c.lineTo(w, y);
            y += stepY;
        }
        c.strokeStyle = this.strokeStyle;
        c.stroke();
    }
}
