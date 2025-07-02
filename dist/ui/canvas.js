import { FGType, canvasT } from "../literal/type.js";
export class Canvas {
    w;
    h;
    kind = 2000;
    x = 0;
    y = 0;
    canvas;
    ctx;
    pixelRatio;
    constructor(w = 100, h = 100) {
        this.w = w;
        this.h = h;
        let canvasElem = document.createElement("canvas");
        this.ctx = canvasElem.getContext("2d");
        let pixelRatio = window.devicePixelRatio || 1;
        document.body.appendChild(canvasElem);
        canvasElem.style.width = w + "px";
        canvasElem.style.height = h + "px";
        canvasElem.width = w * pixelRatio;
        canvasElem.height = h * pixelRatio;
        this.ctx.scale(pixelRatio, pixelRatio);
        canvasElem.style.position = "absolute";
        canvasElem.style.top = "0px";
        canvasElem.style.left = "0px";
        canvasElem.style.border = "1px solid black";
        canvasElem.style.background = "#fff";
        this.canvas = canvasElem;
        this.pixelRatio = pixelRatio;
    }
    typeof() {
        return new FGType(canvasT);
    }
    to_str() {
        return "canvas";
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
        this.w = w;
        this.h = h;
        this.canvas.width = this.w * this.pixelRatio;
        this.canvas.height = this.h * this.pixelRatio;
        this.canvas.style.width = this.w + "px";
        this.canvas.style.height = this.h + "px";
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        return this;
    }
}
export let defaultCanvas = new Canvas(300, 300);
