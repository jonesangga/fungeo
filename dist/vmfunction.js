import { pop, push, vm_output } from "./vm.js";
import { FGCallNative, FGNumber, FGString, FGList } from "./value.js";
import { FGColor } from "./literal/color.js";
import canvas from "./ui/canvas.js";
import { Circle, RichCircle } from "./geo/circle.js";
import { Point, RichPoint } from "./geo/point.js";
import Ellipse from "./geo/ellipse.js";
import Picture from "./geo/picture.js";
import Rect from "./geo/rect.js";
import { Segment, RichSegment } from "./geo/segment.js";
import { welcome } from "./data/help.js";
import { ListT, UnionT, anyT, pictureT, FunctionT, ellipseT, segmentT, richSegmentT, nothingT, pointT, richPointT, circleT, richCircleT, stringT, numberT, colorT, canvasT, replT } from "./literal/type.js";
import fish from "./data/fish.js";
import repl from "./ui/repl.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
const fillableT = new UnionT([circleT, ellipseT]);
function _print() {
    let value = pop();
    pop();
    vm_output(value.to_str() + "\n");
}
let print = new FGCallNative("print", _print, new FunctionT([anyT], nothingT));
function _printf() {
    let value = pop();
    pop();
    vm_output(value.to_str());
}
let printf = new FGCallNative("printf", _printf, new FunctionT([anyT], nothingT));
function _sqrt() {
    let value = pop();
    pop();
    push(new FGNumber(Math.sqrt(value.value)));
}
let sqrt = new FGCallNative("sqrt", _sqrt, new FunctionT([numberT], numberT));
function _abs() {
    let value = pop();
    pop();
    push(new FGNumber(Math.abs(value.value)));
}
let abs = new FGCallNative("abs", _abs, new FunctionT([numberT], numberT));
function _show() {
    let value = pop();
    pop();
    push(new FGString(value.to_str()));
}
let show = new FGCallNative("show", _show, new FunctionT([numberT], stringT));
function _padl() {
    let filler = pop().value;
    let width = pop().value;
    let text = pop().value;
    pop();
    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
let padl = new FGCallNative("padl", _padl, new FunctionT([stringT, numberT, stringT], stringT));
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
let label_on_scrn = [];
function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
    for (let obj of label_on_scrn) {
        obj.draw_label();
    }
}
function isGeo(v) {
    return [700, 905, 750, 840, 850, 900, 910, 920, 1000].includes(v.kind);
}
function isRichGeo(v) {
    return [905, 910, 920].includes(v.kind);
}
function _draw() {
    let v = pop();
    pop();
    if (v instanceof FGList) {
        for (let i of v.value) {
            if (isGeo(i))
                on_scrn.push(i);
            if (isRichGeo(i))
                label_on_scrn.push(i);
        }
    }
    else {
        if (isGeo(v))
            on_scrn.push(v);
        if (isRichGeo(v))
            label_on_scrn.push(v);
    }
    draw_onScreen();
}
let draw = new FGCallNative("draw", _draw, new FunctionT([geoT], nothingT));
function _label() {
    let label = pop().value;
    let v = pop();
    pop();
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label, new FunctionT([richgeoT, stringT], nothingT));
function _Fill() {
    console.log("in _Fill()");
    let v = pop();
    let color = pop();
    pop();
    v.fillStyle = color.to_hex();
    draw_onScreen();
}
let Fill = new FGCallNative("Fill", _Fill, new FunctionT([colorT, fillableT], nothingT));
function _circle() {
    let r = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = new Circle(x, y, r);
    push(c);
}
let circle = new FGCallNative("circle", _circle, new FunctionT([numberT, numberT, numberT], circleT));
function _rcircle() {
    let q = pop();
    let p = pop();
    pop();
    push(new RichCircle(p, q));
}
let rcircle = new FGCallNative("rcircle", _rcircle, new FunctionT([richPointT, richPointT], richCircleT));
function _C_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
    let c = new Circle(p.x, p.y, r);
    push(c);
}
let C_FromPoints = new FGCallNative("C_FromPoints", _C_FromPoints, new FunctionT([pointT, pointT], circleT));
function _Ccurv() {
    let bend = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
const Ccurv = new FGCallNative("Ccurv", _Ccurv, new FunctionT([numberT, numberT, numberT], circleT));
function _Descart() {
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    push(list);
}
const Descart = new FGCallNative("Descart", _Descart, new FunctionT([circleT, circleT, circleT], new ListT(numberT)));
function _ComplexDescart() {
    let curv = pop();
    let c3 = pop();
    let c2 = pop();
    let c1 = pop();
    pop();
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleT);
    push(circles);
}
const ComplexDescart = new FGCallNative("ComplexDescart", _ComplexDescart, new FunctionT([circleT, circleT, circleT, numberT], new ListT(circleT)));
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
function _pt() {
    let y = pop().value;
    let x = pop().value;
    pop();
    push(new Point(x, y));
}
let pt = new FGCallNative("pt", _pt, new FunctionT([numberT, numberT], pointT));
function _rpt() {
    let y = pop().value;
    let x = pop().value;
    pop();
    push(new RichPoint(x, y));
}
let rpt = new FGCallNative("rpt", _rpt, new FunctionT([numberT, numberT], richPointT));
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
let R = new FGCallNative("R", _R, new FunctionT([numberT, numberT, numberT, numberT], numberT));
function _R_WithCenter() {
    let h = pop().value;
    let w = pop().value;
    let y = pop().value;
    let x = pop().value;
    pop();
    let rect = new Rect(x - w / 2, y - h / 2, w, h);
    push(rect);
}
let R_WithCenter = new FGCallNative("R_WithCenter", _R_WithCenter, new FunctionT([numberT, numberT, numberT, numberT], numberT));
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
let R_FromPoints = new FGCallNative("R_FromPoints", _R_FromPoints, new FunctionT([pointT, pointT], numberT));
function _seg() {
    let y2 = pop().value;
    let x2 = pop().value;
    let y1 = pop().value;
    let x1 = pop().value;
    pop();
    let seg = new Segment(x1, y1, x2, y2);
    push(seg);
}
let seg = new FGCallNative("seg", _seg, new FunctionT([numberT, numberT, numberT, numberT], segmentT));
function _rseg() {
    let y2 = pop().value;
    let x2 = pop().value;
    let y1 = pop().value;
    let x1 = pop().value;
    pop();
    let p = new RichPoint(x1, y1);
    p.label = "P";
    let q = new RichPoint(x2, y2);
    q.label = "Q";
    push(new RichSegment(p, q));
}
let rseg = new FGCallNative("rseg", _rseg, new FunctionT([numberT, numberT, numberT, numberT], richSegmentT));
function _Seg_FromPoints() {
    let q = pop();
    let p = pop();
    pop();
    let seg = new Segment(p.x, p.y, q.x, q.y);
    push(seg);
}
let Seg_FromPoints = new FGCallNative("Seg.FromPoints", _Seg_FromPoints, new FunctionT([pointT, pointT], segmentT));
function _Midpoint() {
    let segment = pop();
    pop();
    let point = segment.midpoint();
    push(point);
}
let Midpoint = new FGCallNative("Midpoint", _Midpoint, new FunctionT([segmentT], pointT));
function _help() {
    pop();
    vm_output(welcome);
}
let help = new FGCallNative("help", _help, new FunctionT([], nothingT));
function _clear() {
    pop();
    canvas.clear();
    on_scrn = [];
    label_on_scrn = [];
}
let clear = new FGCallNative("clear", _clear, new FunctionT([], nothingT));
export let nativeNames = {
    "canvas": { type: canvasT, value: canvas },
    "repl": { type: replT, value: repl },
    "fishp": { type: pictureT, value: fish.p },
    "fishq": { type: pictureT, value: fish.q },
    "fishr": { type: pictureT, value: fish.r },
    "fishs": { type: pictureT, value: fish.s },
    "help": { type: help.sig, value: help },
    "print": { type: print.sig, value: print },
    "Push": { type: Push.sig, value: Push },
    "RGB": { type: RGB.sig, value: RGB },
    "printf": { type: printf.sig, value: printf },
    "show": { type: show.sig, value: show },
    "label": { type: label.sig, value: label },
    "padl": { type: padl.sig, value: padl },
    "Type": { type: TypeFn.sig, value: TypeFn },
    "draw": { type: draw.sig, value: draw },
    "Fill": { type: Fill.sig, value: Fill },
    "clear": { type: clear.sig, value: clear },
    "Paint": { type: Paint.sig, value: Paint },
    "circle": { type: circle.sig, value: circle, methods: {
            "FromPoints": { type: C_FromPoints.sig, value: C_FromPoints },
        } },
    "rcircle": { type: rcircle.sig, value: rcircle },
    "Ccurv": { type: Ccurv.sig, value: Ccurv },
    "Descart": { type: Descart.sig, value: Descart },
    "ComplexDescart": { type: ComplexDescart.sig, value: ComplexDescart },
    "E": { type: E.sig, value: E },
    "pt": { type: pt.sig, value: pt },
    "rpt": { type: rpt.sig, value: rpt },
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
    "rseg": { type: rseg.sig, value: rseg },
    "seg": { type: seg.sig, value: seg, methods: {
            "FromPoints": { type: Seg_FromPoints.sig, value: Seg_FromPoints },
        } },
    "Midpoint": { type: Midpoint.sig, value: Midpoint },
    "sqrt": { type: sqrt.sig, value: sqrt },
    "abs": { type: abs.sig, value: abs },
};
