import { pop, push, vm_output } from "./vm.js";
import { FGCallNative, FGNumber, FGString, FGList } from "./value.js";
import { FGColor } from "./literal/color.js";
import canvas from "./ui/canvas.js";
import Circle from "./geo/circle.js";
import Ellipse from "./geo/ellipse.js";
import Picture from "./geo/picture.js";
import Point from "./geo/point.js";
import Rect from "./geo/rect.js";
import { rectStruct } from "./geo/rect.js";
import { pointStruct } from "./geo/point.js";
import { circleStruct } from "./geo/circle.js";
import Segment from "./geo/segment.js";
import { welcome } from "./data/help.js";
import { ListT, UnionT, anyT, pictureT, FunctionT, ellipseT, segmentT, nothingT, stringT, numberT, colorT, canvasT, replT } from "./literal/type.js";
import fish from "./data/fish.js";
import repl from "./ui/repl.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointStruct.value, rectStruct.value, segmentT, circleStruct.value]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointStruct.value, rectStruct.value, segmentT, circleStruct.value, geoList]);
const fillableT = new UnionT([circleStruct.value, ellipseT, rectStruct.value]);
function _Print() {
    let value = pop();
    pop();
    vm_output(value.to_str() + "\n");
}
let Print = new FGCallNative("Print", _Print, new FunctionT([anyT], nothingT));
function _Printf() {
    let value = pop();
    pop();
    vm_output(value.to_str());
}
let Printf = new FGCallNative("Printf", _Printf, new FunctionT([anyT], nothingT));
function _Sqrt() {
    let value = pop();
    pop();
    push(new FGNumber(Math.sqrt(value.value)));
}
let Sqrt = new FGCallNative("Sqrt", _Sqrt, new FunctionT([numberT], numberT));
function _Abs() {
    let value = pop();
    pop();
    push(new FGNumber(Math.abs(value.value)));
}
let Abs = new FGCallNative("Abs", _Abs, new FunctionT([numberT], numberT));
function _Show() {
    let value = pop();
    pop();
    push(new FGString(value.to_str()));
}
let Show = new FGCallNative("Show", _Show, new FunctionT([numberT], stringT));
function _Padl() {
    let filler = pop().value;
    let width = pop().value;
    let text = pop().value;
    pop();
    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
let Padl = new FGCallNative("Padl", _Padl, new FunctionT([stringT, numberT, stringT], stringT));
function _RGB() {
    let b = pop().value;
    let g = pop().value;
    let r = pop().value;
    pop();
    push(new FGColor(r, g, b));
}
let RGB = new FGCallNative("RGB", _RGB, new FunctionT([numberT, numberT, numberT], colorT));
function _TypeFn() {
    let value = pop();
    pop();
    push(value.typeof());
}
let TypeFn = new FGCallNative("TypeFn", _TypeFn, new FunctionT([anyT], stringT));
function _Push() {
    let el = pop();
    let list = pop();
    pop();
    list.value.push(el);
}
let Push = new FGCallNative("Push", _Push, new FunctionT([new ListT(anyT), anyT], nothingT));
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
    if (v instanceof FGList) {
        for (let i of v.value) {
            on_scrn.push(i);
        }
    }
    else {
        on_scrn.push(v);
    }
    draw_onScreen();
}
let Draw = new FGCallNative("Draw", _Draw, new FunctionT([geoT], nothingT));
function _Fill() {
    console.log("in _Fill()");
    let v = pop();
    let color = pop();
    pop();
    v.fillStyle = color.to_hex();
    draw_onScreen();
}
let Fill = new FGCallNative("Fill", _Fill, new FunctionT([colorT, fillableT], nothingT));
function _C() {
    let r = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = new Circle(x, y, r);
    push(c);
}
let C = new FGCallNative("C", _C, new FunctionT([numberT, numberT, numberT], circleStruct.value));
function _C_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
    let c = new Circle(p.x, p.y, r);
    push(c);
}
let C_FromPoints = new FGCallNative("C_FromPoints", _C_FromPoints, new FunctionT([pointStruct.value, pointStruct.value], circleStruct.value));
function _Ccurv() {
    let bend = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
const Ccurv = new FGCallNative("Ccurv", _Ccurv, new FunctionT([numberT, numberT, numberT], circleStruct.value));
function _Descart() {
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    push(list);
}
const Descart = new FGCallNative("Descart", _Descart, new FunctionT([circleStruct.value, circleStruct.value, circleStruct.value], new ListT(numberT)));
function _ComplexDescart() {
    let curv = pop();
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleStruct.value);
    push(circles);
}
const ComplexDescart = new FGCallNative("ComplexDescart", _ComplexDescart, new FunctionT([circleStruct.value, circleStruct.value, circleStruct.value, numberT], new ListT(circleStruct.value)));
function _E() {
    let ry = pop().value;
    let rx = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let e = new Ellipse(x, y, rx, ry);
    push(e);
}
let E = new FGCallNative("E", _E, new FunctionT([numberT, numberT, numberT, numberT], ellipseT));
function _Pt() {
    let y = pop().value;
    let x = pop().value;
    pop();
    push(new Point(x, y));
}
let Pt = new FGCallNative("Pt", _Pt, new FunctionT([numberT, numberT], pointStruct.value));
function _Paint() {
    let geo = pop();
    let pic = pop();
    pop();
    pic.objs.push(geo);
    draw_onScreen();
}
let Paint = new FGCallNative("Paint", _Paint, new FunctionT([pictureT, geoT], nothingT));
function _Cw() {
    let pic = pop();
    pop();
    push(pic.cw());
}
let Cw = new FGCallNative("Cw", _Cw, new FunctionT([pictureT], pictureT));
function _Ccw() {
    let pic = pop();
    pop();
    push(pic.ccw());
}
let Ccw = new FGCallNative("Ccw", _Ccw, new FunctionT([pictureT], pictureT));
function _FlipH() {
    let pic = pop();
    pop();
    push(pic.fliph());
}
let FlipH = new FGCallNative("FlipH", _FlipH, new FunctionT([pictureT], pictureT));
function _FlipV() {
    let pic = pop();
    pop();
    push(pic.flipv());
}
let FlipV = new FGCallNative("FlipV", _FlipV, new FunctionT([pictureT], pictureT));
function _Quartet() {
    let s = pop();
    let r = pop();
    let q = pop();
    let p = pop();
    pop();
    push(Picture.quartet(p, q, r, s));
}
let Quartet = new FGCallNative("Quartet", _Quartet, new FunctionT([pictureT, pictureT, pictureT, pictureT], pictureT));
function _Cycle() {
    let p = pop();
    pop();
    push(Picture.cycle(p));
}
let Cycle = new FGCallNative("Cycle", _Cycle, new FunctionT([pictureT], pictureT));
function _MapPic() {
    let target = pop();
    let src = pop();
    pop();
    src.map_to(target);
    draw_onScreen();
}
let MapPic = new FGCallNative("MapPic", _MapPic, new FunctionT([pictureT, pictureT], nothingT));
function _Pic() {
    let w = pop().value;
    let h = pop().value;
    pop();
    let pic = new Picture(w, h);
    push(pic);
}
let Pic = new FGCallNative("Pic", _Pic, new FunctionT([numberT, numberT], pictureT));
function _R() {
    let h = pop().value;
    let w = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let rect = new Rect(x, y, w, h);
    push(rect);
}
let R = new FGCallNative("R", _R, new FunctionT([numberT, numberT, numberT, numberT], rectStruct.value));
function _R_WithCenter() {
    let h = pop().value;
    let w = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let rect = new Rect(x - w / 2, y - h / 2, w, h);
    push(rect);
}
let R_WithCenter = new FGCallNative("R_WithCenter", _R_WithCenter, new FunctionT([numberT, numberT, numberT, numberT], rectStruct.value));
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
let R_FromPoints = new FGCallNative("R_FromPoints", _R_FromPoints, new FunctionT([pointStruct.value, pointStruct.value], rectStruct.value));
function _Seg() {
    let y2 = pop().value;
    let x2 = pop().value;
    let y1 = pop().value;
    let x1 = pop().value;
    pop();
    let seg = new Segment(x1, y1, x2, y2);
    push(seg);
}
let Seg = new FGCallNative("Seg", _Seg, new FunctionT([numberT, numberT, numberT, numberT], segmentT));
function _Seg_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let seg = new Segment(p.x, p.y, q.x, q.y);
    push(seg);
}
let Seg_FromPoints = new FGCallNative("Seg.FromPoints", _Seg_FromPoints, new FunctionT([pointStruct.value, pointStruct.value], segmentT));
function _Midpoint() {
    let segment = pop();
    pop();
    let point = segment.midpoint();
    push(point);
}
let Midpoint = new FGCallNative("Midpoint", _Midpoint, new FunctionT([segmentT], pointStruct.value));
function _Help() {
    pop();
    vm_output(welcome);
}
let Help = new FGCallNative("Help", _Help, new FunctionT([], nothingT));
function _Clear() {
    pop();
    canvas.clear();
    on_scrn = [];
}
let Clear = new FGCallNative("Clear", _Clear, new FunctionT([], nothingT));
export let nativeNames = {
    "canvas": { type: canvasT, value: canvas },
    "repl": { type: replT, value: repl },
    "fishp": { type: pictureT, value: fish.p },
    "fishq": { type: pictureT, value: fish.q },
    "fishr": { type: pictureT, value: fish.r },
    "fishs": { type: pictureT, value: fish.s },
    "Help": { type: Help.sig, value: Help },
    "Print": { type: Print.sig, value: Print },
    "Push": { type: Push.sig, value: Push },
    "RGB": { type: RGB.sig, value: RGB },
    "Printf": { type: Printf.sig, value: Printf },
    "Show": { type: Show.sig, value: Show },
    "Padl": { type: Padl.sig, value: Padl },
    "Type": { type: TypeFn.sig, value: TypeFn },
    "Draw": { type: Draw.sig, value: Draw },
    "Fill": { type: Fill.sig, value: Fill },
    "Clear": { type: Clear.sig, value: Clear },
    "Paint": { type: Paint.sig, value: Paint },
    "C": { type: C.sig, value: C, methods: {
            "FromPoints": { type: C_FromPoints.sig, value: C_FromPoints },
        } },
    "Ccurv": { type: Ccurv.sig, value: Ccurv },
    "Descart": { type: Descart.sig, value: Descart },
    "ComplexDescart": { type: ComplexDescart.sig, value: ComplexDescart },
    "E": { type: E.sig, value: E },
    "Pt": { type: Pt.sig, value: Pt },
    "Pic": { type: Pic.sig, value: Pic },
    "Cw": { type: Cw.sig, value: Cw },
    "Ccw": { type: Ccw.sig, value: Ccw },
    "FlipH": { type: FlipH.sig, value: FlipH },
    "FlipV": { type: FlipV.sig, value: FlipV },
    "Quartet": { type: Quartet.sig, value: Quartet },
    "Cycle": { type: Cycle.sig, value: Cycle },
    "MapPic": { type: MapPic.sig, value: MapPic },
    "R": { type: R.sig, value: R, methods: {
            "FromPoints": { type: R_FromPoints.sig, value: R_FromPoints },
            "WithCenter": { type: R_WithCenter.sig, value: R_WithCenter },
        } },
    "Seg": { type: Seg.sig, value: Seg, methods: {
            "FromPoints": { type: Seg_FromPoints.sig, value: Seg_FromPoints },
        } },
    "Midpoint": { type: Midpoint.sig, value: Midpoint },
    "Rect": { type: rectStruct.value, value: rectStruct },
    "Point": { type: pointStruct.value, value: pointStruct },
    "Circle": { type: circleStruct.value, value: circleStruct },
    "Sqrt": { type: Sqrt.sig, value: Sqrt },
    "Abs": { type: Abs.sig, value: Abs },
};
