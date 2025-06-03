import { pop, push, vm_output, call, run } from "./vm.js";
import { FGCallNative, FGCallUser, FGString, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import Circle from "./geo/circle.js";
import Ellipse from "./geo/ellipse.js";
import Picture from "./geo/picture.js";
import Point from "./geo/point.js";
import Rect from "./geo/rect.js";
import Segment from "./geo/segment.js";
import { welcome } from "./data/help.js";
import { ListT, geoT, fillableT, anyT, circleT, pointT, pictureT, rectT, ellipseT, segmentT, nothingT, stringT, numberT, CallNativeT, NothingT, AnyT } from "./type.js";
function _Print() {
    let value = pop();
    pop();
    vm_output(value.to_str() + "\n");
}
export let Print = new FGCallNative("Print", 0, _Print, [anyT], nothingT);
export const PrintT = new CallNativeT([new AnyT()], new NothingT());
function _Printf() {
    let value = pop();
    pop();
    vm_output(value.to_str());
}
export let Printf = new FGCallNative("Printf", 0, _Printf, [anyT], nothingT);
function _Show() {
    let value = pop();
    pop();
    push(new FGString(value.to_str()));
}
export let Show = new FGCallNative("Show", 0, _Show, [numberT], stringT);
function _Padl() {
    let filler = pop().value;
    let width = pop().value;
    let text = pop().value;
    pop();
    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
export let Padl = new FGCallNative("Padl", 0, _Padl, [stringT, numberT, stringT], stringT);
function _Type() {
    let value = pop();
    pop();
    push(value.typeof());
}
export let Type = new FGCallNative("Type", 0, _Type, [anyT], stringT);
function _Map() {
    console.log("in _Map()");
    let list = pop();
    let callback = pop();
    console.log(list, callback);
    pop();
    if (callback instanceof FGCallNative) {
        console.log("callback is FGCallNative");
        let result = [];
        for (let i = 0; i < list.value.length; i++) {
            push(list.value[i]);
            push(list.value[i]);
            callback.value();
            result.push(pop());
        }
        push(new FGList(result, callback.output));
    }
    else if (callback instanceof FGCallUser) {
        let result = [];
        for (let i = 0; i < list.value.length; i++) {
            push(list.value[i]);
            push(list.value[i]);
            console.log("callback is FGCallUser");
            call(callback, callback.input.length);
            run(true);
            result.push(pop());
        }
        push(new FGList(result, callback.output));
    }
}
export let Map = new FGCallNative("Map", 0, _Map, [anyT, new ListT(anyT)], new ListT(anyT));
let on_scrn = [];
function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
}
function _Draw() {
    let v = pop();
    pop();
    on_scrn.push(v);
    draw_onScreen();
}
export let Draw = new FGCallNative("Draw", 0, _Draw, [geoT], nothingT);
function _Fill() {
    console.log("in _Fill()");
    let v = pop();
    let color = pop();
    pop();
    v.fillStyle = color.value;
    draw_onScreen();
}
export let Fill = new FGCallNative("Fill", 0, _Fill, [stringT, fillableT], nothingT);
function _C() {
    let r = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = new Circle(x, y, r);
    push(c);
}
export let C = new FGCallNative("C", 0, _C, [numberT, numberT, numberT], circleT);
function _C_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
    let c = new Circle(p.x, p.y, r);
    push(c);
}
export let C_FromPoints = new FGCallNative("C_FromPoints", 0, _C_FromPoints, [pointT, pointT], circleT);
function _Ccurv() {
    let bend = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
export const Ccurv = new FGCallNative("Ccurv", 0, _Ccurv, [numberT, numberT, numberT], circleT);
function _Descart() {
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    push(list);
}
export const Descart = new FGCallNative("Descart", 0, _Descart, [circleT, circleT, circleT], new ListT(numberT));
function _ComplexDescart() {
    let curv = pop();
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleT);
    push(circles);
}
export const ComplexDescart = new FGCallNative("ComplexDescart", 0, _ComplexDescart, [circleT, circleT, circleT, numberT], new ListT(circleT));
function _E() {
    let ry = pop().value;
    let rx = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let e = new Ellipse(x, y, rx, ry);
    push(e);
}
export let E = new FGCallNative("E", 0, _E, [numberT, numberT, numberT, numberT], ellipseT);
function _P() {
    let y = pop().value;
    let x = pop().value;
    pop();
    let point = new Point(x, y);
    push(point);
}
export let P = new FGCallNative("P", 0, _P, [numberT, numberT], pointT);
function _Paint() {
    let geo = pop();
    let pic = pop();
    pop();
    pic.objs.push(geo);
    draw_onScreen();
}
export let Paint = new FGCallNative("Paint", 0, _Paint, [pictureT, geoT], nothingT);
function _Cw() {
    let pic = pop();
    pop();
    push(pic.cw());
}
export let Cw = new FGCallNative("Cw", 0, _Cw, [pictureT], pictureT);
function _Ccw() {
    let pic = pop();
    pop();
    push(pic.ccw());
}
export let Ccw = new FGCallNative("Ccw", 0, _Ccw, [pictureT], pictureT);
function _FlipH() {
    let pic = pop();
    pop();
    push(pic.fliph());
}
export let FlipH = new FGCallNative("FlipH", 0, _FlipH, [pictureT], pictureT);
function _FlipV() {
    let pic = pop();
    pop();
    push(pic.flipv());
}
export let FlipV = new FGCallNative("FlipV", 0, _FlipV, [pictureT], pictureT);
function _Quartet() {
    let s = pop();
    let r = pop();
    let q = pop();
    let p = pop();
    pop();
    push(Picture.quartet(p, q, r, s));
}
export let Quartet = new FGCallNative("Quartet", 0, _Quartet, [pictureT, pictureT, pictureT, pictureT], pictureT);
function _Cycle() {
    let p = pop();
    pop();
    push(Picture.cycle(p));
}
export let Cycle = new FGCallNative("Cycle", 0, _Cycle, [pictureT], pictureT);
function _MapPic() {
    let target = pop();
    let src = pop();
    pop();
    src.map_to(target);
    draw_onScreen();
}
export let MapPic = new FGCallNative("MapPic", 0, _MapPic, [pictureT, pictureT], nothingT);
function _Pic() {
    let w = pop().value;
    let h = pop().value;
    pop();
    let pic = new Picture(w, h);
    push(pic);
}
export let Pic = new FGCallNative("Pic", 0, _Pic, [numberT, numberT], pictureT);
function _R() {
    let h = pop().value;
    let w = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let rect = new Rect(x, y, w, h);
    push(rect);
}
export let R = new FGCallNative("R", 0, _R, [numberT, numberT, numberT, numberT], rectT);
function _R_WithCenter() {
    let h = pop().value;
    let w = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let rect = new Rect(x - w / 2, y - h / 2, w, h);
    push(rect);
}
export let R_WithCenter = new FGCallNative("R_WithCenter", 0, _R_WithCenter, [numberT, numberT, numberT, numberT], rectT);
function _R_FromPoints() {
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
export let R_FromPoints = new FGCallNative("R_FromPoints", 0, _R_FromPoints, [pointT, pointT], rectT);
function _Seg() {
    let y2 = pop().value;
    let x2 = pop().value;
    let y1 = pop().value;
    let x1 = pop().value;
    pop();
    let seg = new Segment(x1, y1, x2, y2);
    push(seg);
}
export let Seg = new FGCallNative("Seg", 0, _Seg, [numberT, numberT, numberT, numberT], segmentT);
function _Seg_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let seg = new Segment(p.x, p.y, q.x, q.y);
    push(seg);
}
export let Seg_FromPoints = new FGCallNative("Seg.FromPoints", 0, _Seg_FromPoints, [pointT, pointT], segmentT);
function _Midpoint() {
    let segment = pop();
    pop();
    let point = segment.midpoint();
    push(point);
}
export let Midpoint = new FGCallNative("Midpoint", 0, _Midpoint, [segmentT], pointT);
function _Help() {
    pop();
    vm_output(welcome);
}
export let Help = new FGCallNative("Help", 1, _Help, [], nothingT);
function _Clear() {
    pop();
    canvas.clear();
    on_scrn = [];
}
export let Clear = new FGCallNative("Clear", 1, _Clear, [], nothingT);
