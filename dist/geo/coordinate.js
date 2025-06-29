import { c, w, h } from "../ui/canvas.js";
import { color, TAU } from "../data/constant.js";
import { FGNumber } from "../value.js";
import { FGType, coordT } from "../literal/type.js";
export class Coord {
    xl;
    xr;
    yl;
    yr;
    strokeStyle;
    kind = 720;
    pts = [];
    field = {};
    #rangeX;
    #rangeY;
    #stepX;
    #stepY;
    #showGrid = true;
    constructor(xl = -5, xr = 5, yl = -5, yr = 5, strokeStyle = color.black) {
        this.xl = xl;
        this.xr = xr;
        this.yl = yl;
        this.yr = yr;
        this.strokeStyle = strokeStyle;
        this.#rangeX = xr - xl;
        this.#rangeY = yr - yl;
        this.#stepX = w / this.#rangeX;
        this.#stepY = h / this.#rangeY;
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
    add_pt(x, y, label) {
        if (typeof label === "string")
            this.pts.push({ x, y, label });
        else
            this.pts.push({ x, y });
        return this;
    }
    hide_grid() {
        this.#showGrid = false;
        return this;
    }
    draw() {
        let x = 0;
        let y = 0;
        c.strokeStyle = "#222222";
        if (this.#showGrid) {
            c.beginPath();
            for (let i = 0; i < (this.xr - this.xl + 1); i++) {
                c.moveTo(x, 0);
                c.lineTo(x, h);
                x += this.#stepX;
            }
            for (let i = 0; i < (this.yr - this.yl + 1); i++) {
                c.moveTo(0, y);
                c.lineTo(w, y);
                y += this.#stepY;
            }
            c.stroke();
        }
        c.strokeStyle = this.strokeStyle;
        for (let pt of this.pts)
            if (this.#in_view(pt))
                this.#draw_point(pt);
    }
    #in_view(pt) {
        return pt.x >= this.xl &&
            pt.x <= this.xr &&
            pt.y >= this.yl &&
            pt.y <= this.yr;
    }
    #draw_point(pt) {
        let dx = pt.x - this.xl;
        let dy = -(pt.y - this.yr);
        let x = dx * this.#stepX;
        let y = dy * this.#stepY;
        c.beginPath();
        c.arc(x, y, 5, 0, TAU);
        c.fillStyle = color.black;
        c.fill();
        if (pt.label) {
            c.textBaseline = "bottom";
            c.font = "16px monospace";
            c.fillText(pt.label, x + 5, y - 5);
        }
    }
}
