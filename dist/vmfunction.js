import { pop, push, vm_output } from "./vm.js";
import { geoKind, KindName, FGCallNative, FGString, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import Circle from "./geo/circle.js";
import Ellipse from "./geo/ellipse.js";
import Picture from "./geo/picture.js";
import Point from "./geo/point.js";
import Rect from "./geo/rect.js";
import Segment from "./geo/segment.js";
import { welcome } from "./data/help.js";
function _Print(n) {
    let value = pop();
    pop();
    vm_output(value.to_str() + "\n");
}
export let Print = new FGCallNative("Print", 0, _Print, [
    {
        input: [200],
        output: 100,
    },
]);
function _Printf(n) {
    let value = pop();
    pop();
    vm_output(value.to_str());
}
export let Printf = new FGCallNative("Printf", 0, _Printf, [
    {
        input: [200],
        output: 100,
    },
]);
function _Show(n) {
    let value = pop();
    pop();
    push(new FGString(value.to_str()));
}
export let Show = new FGCallNative("Show", 0, _Show, [
    {
        input: [500],
        output: 600,
    },
]);
function _Padl(n) {
    let filler = pop().value;
    let width = pop().value;
    let text = pop().value;
    pop();
    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
export let Padl = new FGCallNative("Padl", 0, _Padl, [
    {
        input: [600, 500, 600],
        output: 600,
    },
]);
function _Type(n) {
    let value = pop();
    pop();
    push(new FGString(KindName[value.kind]));
}
export let Type = new FGCallNative("Type", 0, _Type, [
    {
        input: [200],
        output: 600,
    },
]);
let on_scrn = [];
function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
}
function _Draw(n) {
    let v = pop();
    pop();
    on_scrn.push(v);
    draw_onScreen();
}
export let Draw = new FGCallNative("Draw", 0, _Draw, [
    {
        input: [geoKind],
        output: 100,
    },
]);
function _C(n) {
    if (n === 0) {
        let r = pop().value;
        let y = pop().value;
        let x = pop().value;
        pop();
        let c = new Circle(x, y, r);
        push(c);
    }
    else {
        let q = pop();
        let p = pop();
        pop();
        let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
        let c = new Circle(p.x, p.y, r);
        push(c);
    }
}
export let C = new FGCallNative("C", 0, _C, [
    {
        input: [500, 500, 500],
        output: 700,
    },
    {
        input: [850, 850],
        output: 700,
    },
]);
function _Ccurv(n) {
    let bend = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
export const Ccurv = new FGCallNative("Ccurv", 0, _Ccurv, [
    {
        input: [500, 500, 500],
        output: 700,
    },
]);
function _Descart(n) {
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let list = new FGList(Circle.descartes(c1, c2, c3), 500);
    push(list);
}
export const Descart = new FGCallNative("Descart", 0, _Descart, [
    {
        input: [700, 700, 700],
        output: 470,
    },
]);
function _ComplexDescart(n) {
    let list = pop();
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, list.value), 700);
    push(circles);
}
export const ComplexDescart = new FGCallNative("ComplexDescart", 0, _ComplexDescart, [
    {
        input: [700, 700, 700, 470],
        output: 470,
    },
]);
function _E(n) {
    let ry = pop().value;
    let rx = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let e = new Ellipse(x, y, rx, ry);
    push(e);
}
export let E = new FGCallNative("E", 0, _E, [
    {
        input: [500, 500, 500, 500],
        output: 750,
    },
]);
function _P(n) {
    if (n === 0) {
        let y = pop().value;
        let x = pop().value;
        pop();
        let point = new Point(x, y);
        push(point);
    }
}
export let P = new FGCallNative("P", 0, _P, [
    {
        input: [500, 500],
        output: 850,
    },
]);
function _Paint(n) {
    let geo = pop();
    let pic = pop();
    pop();
    pic.objs.push(geo);
    draw_onScreen();
}
export let Paint = new FGCallNative("Paint", 0, _Paint, [
    {
        input: [840, geoKind],
        output: 100,
    },
]);
function _Cw(n) {
    let pic = pop();
    pop();
    push(pic.cw());
}
export let Cw = new FGCallNative("Cw", 0, _Cw, [
    {
        input: [840],
        output: 840,
    },
]);
function _Ccw(n) {
    let pic = pop();
    pop();
    push(pic.ccw());
}
export let Ccw = new FGCallNative("Ccw", 0, _Ccw, [
    {
        input: [840],
        output: 840,
    },
]);
function _FlipH(n) {
    let pic = pop();
    pop();
    push(pic.fliph());
}
export let FlipH = new FGCallNative("FlipH", 0, _FlipH, [
    {
        input: [840],
        output: 840,
    },
]);
function _FlipV(n) {
    let pic = pop();
    pop();
    push(pic.flipv());
}
export let FlipV = new FGCallNative("FlipV", 0, _FlipV, [
    {
        input: [840],
        output: 840,
    },
]);
function _Above(n) {
    if (n === 0) {
        let bottom = pop();
        let top = pop();
        pop();
        push(Picture.above(1, 1, top, bottom));
    }
    else {
        let bottom = pop();
        let top = pop();
        let rbottom = pop().value;
        let rtop = pop().value;
        pop();
        push(Picture.above(rtop, rbottom, top, bottom));
    }
}
export let Above = new FGCallNative("Above", 0, _Above, [
    {
        input: [840, 840],
        output: 840,
    },
    {
        input: [500, 500, 840, 840],
        output: 840,
    },
]);
function _Beside(n) {
    if (n === 0) {
        let right = pop();
        let left = pop();
        pop();
        push(Picture.beside(1, 1, left, right));
    }
    else {
        let right = pop();
        let left = pop();
        let rright = pop().value;
        let rleft = pop().value;
        pop();
        push(Picture.beside(rleft, rright, left, right));
    }
}
export let Beside = new FGCallNative("Beside", 0, _Beside, [
    {
        input: [840, 840],
        output: 840,
    },
    {
        input: [500, 500, 840, 840],
        output: 840,
    },
]);
function _Quartet(n) {
    let s = pop();
    let r = pop();
    let q = pop();
    let p = pop();
    pop();
    push(Picture.quartet(p, q, r, s));
}
export let Quartet = new FGCallNative("Quartet", 0, _Quartet, [
    {
        input: [840, 840, 840, 840],
        output: 840,
    },
]);
function _Cycle(n) {
    let p = pop();
    pop();
    push(Picture.cycle(p));
}
export let Cycle = new FGCallNative("Cycle", 0, _Cycle, [
    {
        input: [840],
        output: 840,
    },
]);
function _MapPic(n) {
    let target = pop();
    let src = pop();
    pop();
    src.map_to(target);
    draw_onScreen();
}
export let MapPic = new FGCallNative("MapPic", 0, _MapPic, [
    {
        input: [840, 840],
        output: 100,
    },
]);
function _Pic(n) {
    let w = pop().value;
    let h = pop().value;
    pop();
    let pic = new Picture(w, h);
    push(pic);
}
export let Pic = new FGCallNative("Pic", 0, _Pic, [
    {
        input: [500, 500],
        output: 840,
    },
]);
function _R(n) {
    if (n === 0) {
        let h = pop().value;
        let w = pop().value;
        let y = pop().value;
        let x = pop().value;
        pop();
        let rect = new Rect(x, y, w, h);
        push(rect);
    }
    else {
        let q = pop();
        let p = pop();
        pop();
        let x = Math.min(p.x, q.x);
        let y = Math.min(p.y, q.y);
        let w = Math.abs(p.x - q.x);
        let h = Math.abs(p.y - q.y);
        let rect = new Rect(x, y, w, h);
        push(rect);
    }
}
export let R = new FGCallNative("R", 0, _R, [
    {
        input: [500, 500, 500, 500],
        output: 900,
    },
    {
        input: [850, 850],
        output: 900,
    },
]);
function _Seg(n) {
    if (n === 0) {
        let y2 = pop().value;
        let x2 = pop().value;
        let y1 = pop().value;
        let x1 = pop().value;
        pop();
        let seg = new Segment(x1, y1, x2, y2);
        push(seg);
    }
    else {
        let q = pop();
        let p = pop();
        pop();
        let seg = new Segment(p.x, p.y, q.x, q.y);
        push(seg);
    }
}
export let Seg = new FGCallNative("Seg", 0, _Seg, [
    {
        input: [500, 500, 500, 500],
        output: 1000,
    },
    {
        input: [850, 850],
        output: 1000,
    },
]);
function _Midpoint(n) {
    let segment = pop();
    pop();
    let point = segment.midpoint();
    push(point);
}
export let Midpoint = new FGCallNative("Midpoint", 0, _Midpoint, [
    {
        input: [1000],
        output: 850,
    },
]);
function _Help(n) {
    pop();
    vm_output(welcome);
}
export let Help = new FGCallNative("Help", 1, _Help, [
    {
        input: [],
        output: 100,
    },
]);
function _Clear(n) {
    pop();
    canvas.clear();
    on_scrn = [];
}
export let Clear = new FGCallNative("Clear", 1, _Clear, [
    {
        input: [],
        output: 100,
    },
]);
