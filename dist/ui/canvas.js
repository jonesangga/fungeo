let w = 300;
let h = 300;
const canvasElem = document.createElement("canvas");
export const c = canvasElem.getContext("2d");
const pixelRatio = window.devicePixelRatio || 1;
document.body.appendChild(canvasElem);
canvasElem.style.width = w + "px";
canvasElem.style.height = h + "px";
canvasElem.width = w * pixelRatio;
canvasElem.height = h * pixelRatio;
c.scale(pixelRatio, pixelRatio);
canvasElem.style.position = "absolute";
canvasElem.style.top = "0px";
canvasElem.style.left = "0px";
canvasElem.style.border = "1px solid black";
export const canvas = {
    kind: 2000,
    clear() {
        c.fillStyle = "#fff";
        c.fillRect(0, 0, w, h);
    },
    to_str() { return "canvas"; },
    resize(w_, h_) {
        w = w_;
        h = h_;
        canvasElem.width = w * pixelRatio;
        canvasElem.height = h * pixelRatio;
        canvasElem.style.width = w + "px";
        canvasElem.style.height = h + "px";
        c.scale(pixelRatio, pixelRatio);
    },
    place(x, y) {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        canvasElem.style.left = x + "px";
        canvasElem.style.top = y + "px";
    }
};
