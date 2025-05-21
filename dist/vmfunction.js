import { pop, push, vmoutput } from "./vm.js";
import { geoKind, KindName, FGCallable, FGString } from "./value.js";
import Point from "./geo/point.js";
import Segment from "./geo/segment.js";
import { canvas } from "./ui/canvas.js";
function _Print(n) {
    let value = pop();
    pop();
    vmoutput(value.to_str() + "\n");
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
    vmoutput(value.to_str());
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
        output: 700,
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
        output: 800,
    },
    {
        input: [700, 700],
        output: 800,
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
        input: [800],
        output: 700,
    },
]);
