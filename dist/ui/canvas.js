import { FGType, canvasT } from "../literal/type.js";
export class Canvas {
    w;
    h;
    canvas;
    ctx;
    #pixelRatio;
    x = 0;
    y = 0;
    constructor(w = 100, h = 100) {
        this.w = w;
        this.h = h;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const pixelRatio = window.devicePixelRatio || 1;
        document.body.appendChild(canvas);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = w * pixelRatio;
        canvas.height = h * pixelRatio;
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.border = "1px solid black";
        canvas.style.background = "#fff";
        ctx.scale(pixelRatio, pixelRatio);
        this.canvas = canvas;
        this.ctx = ctx;
        this.#pixelRatio = pixelRatio;
    }
    typeof() {
        return new FGType(canvasT);
    }
    to_str() {
        return `Canvas(${this.w}, ${this.h})`;
    }
    clear() {
        this.ctx.fillStyle = "#fff";
        this.ctx.clearRect(0, 0, this.w, this.h);
    }
    place(x, y) {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return this;
        }
        this.canvas.style.left = x + "px";
        this.canvas.style.top = y + "px";
        this.x = x;
        this.y = y;
        return this;
    }
    resize(w, h) {
        if (w <= 0 || h <= 0 || w > 1000 || h > 1000) {
            console.log("invalid size");
            return this;
        }
        this.canvas.width = w * this.#pixelRatio;
        this.canvas.height = h * this.#pixelRatio;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.w = w;
        this.h = h;
        this.ctx.scale(this.#pixelRatio, this.#pixelRatio);
        return this;
    }
    save(filename = "canvas-save") {
        const a = document.createElement("a");
        a.download = filename;
        this.canvas.toBlob((blob) => {
            if (blob) {
                a.href = URL.createObjectURL(blob);
                a.click();
            }
        });
    }
}
export const defaultCanvas = new Canvas(300, 300);
