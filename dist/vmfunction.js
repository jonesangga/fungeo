import { pop, push, vm_output } from "./vm.js";
import { geoKind, KindName, FGCallable, FGString } from "./value.js";
import canvas from "./ui/canvas.js";
import Circle from "./geo/circle.js";
import Ellipse from "./geo/ellipse.js";
import Point from "./geo/point.js";
import Rect from "./geo/rect.js";
import Segment from "./geo/segment.js";
function _Print(n) {
    let value = pop();
    pop();
    vm_output(value.to_str() + "\n");
}
export let Print = new FGCallable("Print", _Print, [
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
export let Printf = new FGCallable("Printf", _Printf, [
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
export let Show = new FGCallable("Show", _Show, [
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
export let Padl = new FGCallable("Padl", _Padl, [
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
export let Type = new FGCallable("Type", _Type, [
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
export let Draw = new FGCallable("Draw", _Draw, [
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
export let C = new FGCallable("C", _C, [
    {
        input: [500, 500, 500],
        output: 700,
    },
    {
        input: [850, 850],
        output: 700,
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
export let E = new FGCallable("E", _E, [
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
        console.log(point);
        push(point);
    }
}
export let P = new FGCallable("P", _P, [
    {
        input: [500, 500],
        output: 850,
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
export let R = new FGCallable("R", _R, [
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
export let Seg = new FGCallable("Seg", _Seg, [
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
export let Midpoint = new FGCallable("Midpoint", _Midpoint, [
    {
        input: [1000],
        output: 850,
    },
]);
