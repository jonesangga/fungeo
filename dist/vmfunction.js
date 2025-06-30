import { session, vm_output } from "./vm.js";
import { FGCallNative, FGNumber, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import repl from "./ui/repl.js";
import { Circle, RichCircle } from "./geo/circle.js";
import { Coord } from "./geo/coordinate.js";
import { Point, RichPoint } from "./geo/point.js";
import Picture from "./geo/picture.js";
import { Segment, RichSegment } from "./geo/segment.js";
import { welcome } from "./data/help.js";
import { ListT, UnionT, anyT, pictureT, FunctionT, OverloadT, ellipseT, segmentT, richSegmentT, nothingT, pointT, richPointT, circleT, richCircleT, stringT, numberT, canvasT, coordT, replT } from "./literal/type.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, coordT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
function _print(ver) {
    let value = session.pop();
    session.pop();
    vm_output(value.to_str() + "\n");
}
let print = new FGCallNative("print", _print, new OverloadT([
    new FunctionT([anyT], nothingT),
]));
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
    return [700, 720, 905, 750, 840, 850, 900, 910, 920, 1000].includes(v.kind);
}
function isRichGeo(v) {
    return [905, 910, 920].includes(v.kind);
}
function _draw(ver) {
    let v = session.pop();
    session.pop();
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
let draw = new FGCallNative("draw", _draw, new OverloadT([
    new FunctionT([geoT], nothingT),
]));
function _label(ver) {
    let label = session.pop().value;
    let v = session.pop();
    session.pop();
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label, new OverloadT([
    new FunctionT([richgeoT, stringT], nothingT),
]));
function _circle(ver) {
    if (ver === 0) {
        let r = session.pop().value;
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
        session.push(new Circle(p.x, p.y, r));
    }
    else if (ver === 2) {
        let r = session.pop().value;
        let p = session.pop();
        session.pop();
        session.push(new Circle(p.x, p.y, r));
    }
}
let circle = new FGCallNative("circle", _circle, new OverloadT([
    new FunctionT([numberT, numberT, numberT], circleT),
    new FunctionT([pointT, pointT], circleT),
    new FunctionT([pointT, numberT], circleT),
]));
function _intersect(ver) {
    let q = session.pop();
    let p = session.pop();
    session.pop();
    let points = p.intersect(q);
    let res = new FGList(points, pointT);
    session.push(res);
}
let intersect = new FGCallNative("intersect", _intersect, new OverloadT([
    new FunctionT([circleT, circleT], new ListT(pointT)),
    new FunctionT([richCircleT, richCircleT], new ListT(richPointT)),
]));
function _rcircle(ver) {
    if (ver === 0) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        session.push(new RichCircle(p, q));
    }
    else if (ver === 1) {
        let r = session.pop().value;
        let p = session.pop();
        session.pop();
        let q = new RichPoint(p.x + r, p.y);
        session.push(new RichCircle(p, q));
    }
}
let rcircle = new FGCallNative("rcircle", _rcircle, new OverloadT([
    new FunctionT([richPointT, richPointT], richCircleT),
    new FunctionT([richPointT, numberT], richCircleT),
]));
function _pt(ver) {
    if (ver === 0) {
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(new Point(x, y));
    }
    else if (ver === 1) {
        let rp = session.pop();
        session.pop();
        session.push(new Point(rp.x, rp.y));
    }
}
let pt = new FGCallNative("pt", _pt, new OverloadT([
    new FunctionT([numberT, numberT], pointT),
    new FunctionT([richPointT], pointT),
]));
function _rpt(ver) {
    if (ver === 0) {
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(new RichPoint(x, y));
    }
    else {
        let p = session.pop();
        session.pop();
        session.push(new RichPoint(p.x, p.y));
    }
}
let rpt = new FGCallNative("rpt", _rpt, new OverloadT([
    new FunctionT([numberT, numberT], richPointT),
    new FunctionT([pointT], richPointT),
]));
function _quartet() {
    let s = session.pop();
    let r = session.pop();
    let q = session.pop();
    let p = session.pop();
    session.pop();
    session.push(Picture.quartet(p, q, r, s));
}
let quartet = new FGCallNative("quartet", _quartet, new OverloadT([
    new FunctionT([pictureT, pictureT, pictureT, pictureT], pictureT),
]));
function _mappic() {
    let target = session.pop();
    let src = session.pop();
    session.pop();
    src.map_to(target);
    draw_onScreen();
}
let mappic = new FGCallNative("mappic", _mappic, new OverloadT([
    new FunctionT([pictureT, pictureT], nothingT),
]));
function _pic() {
    let w = session.pop().value;
    let h = session.pop().value;
    session.pop();
    let pic = new Picture(w, h);
    session.push(pic);
}
let pic = new FGCallNative("pic", _pic, new OverloadT([
    new FunctionT([numberT, numberT], pictureT),
]));
function _coord() {
    let yr = session.pop().value;
    let yl = session.pop().value;
    let xr = session.pop().value;
    let xl = session.pop().value;
    session.pop();
    session.push(new Coord(Math.floor(xl), Math.ceil(xr), Math.floor(yl), Math.ceil(yr)));
}
let coord = new FGCallNative("coord", _coord, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], coordT),
]));
function _coord_pt(ver) {
    if (ver === 0) {
        let o = session.pop();
        let label = session.pop().value;
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(o.add_pt(x, y, label));
    }
    else if (ver === 1) {
        let o = session.pop();
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(o.add_pt(x, y));
    }
}
export let coord_pt = new FGCallNative("coord_pt", _coord_pt, new OverloadT([
    new FunctionT([numberT, numberT, stringT], coordT),
    new FunctionT([numberT, numberT], coordT),
]));
function _coord_hide_grid(ver) {
    let o = session.pop();
    session.pop();
    session.push(o.hide_grid());
}
export let coord_hide_grid = new FGCallNative("coord_hide_grid", _coord_hide_grid, new OverloadT([
    new FunctionT([], coordT),
]));
coordT.methods["pt"] = { type: coord_pt.sig, value: coord_pt };
coordT.methods["hide_grid"] = { type: coord_hide_grid.sig, value: coord_hide_grid };
function _segment(ver) {
    if (ver === 0) {
        let y2 = session.pop().value;
        let x2 = session.pop().value;
        let y1 = session.pop().value;
        let x1 = session.pop().value;
        session.pop();
        session.push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        session.push(new Segment(p.x, p.y, q.x, q.y));
    }
}
let segment = new FGCallNative("segment", _segment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], segmentT),
    new FunctionT([pointT, pointT], segmentT),
]));
function _length(ver) {
    if (ver === 0) {
        let s = session.pop();
        session.pop();
        session.push(new FGNumber(s.length()));
    }
    else if (ver === 1) {
        let s = session.pop();
        session.pop();
        session.push(new FGNumber(s.length()));
    }
}
let length = new FGCallNative("length", _length, new OverloadT([
    new FunctionT([segmentT], numberT),
    new FunctionT([richSegmentT], numberT),
]));
function _rsegment(ver) {
    if (ver === 0) {
        let y2 = session.pop().value;
        let x2 = session.pop().value;
        let y1 = session.pop().value;
        let x1 = session.pop().value;
        session.pop();
        let p = new RichPoint(x1, y1);
        p.label = "P";
        let q = new RichPoint(x2, y2);
        q.label = "Q";
        session.push(new RichSegment(p, q));
    }
    else if (ver === 1) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        session.push(new RichSegment(p, q));
    }
}
let rsegment = new FGCallNative("rsegment", _rsegment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], richSegmentT),
    new FunctionT([richPointT, richPointT], richSegmentT),
]));
function _help(ver) {
    if (ver === 0) {
        let arg = session.pop();
        session.pop();
        if (!(arg instanceof FGCallNative))
            vm_output(`no help for ${arg.to_str()}`);
        else
            vm_output(arg.to_str());
    }
    else if (ver === 1) {
        session.pop();
        vm_output(welcome);
    }
}
let help = new FGCallNative("help", _help, new OverloadT([
    new FunctionT([anyT], nothingT),
    new FunctionT([], nothingT),
]));
function _clear() {
    session.pop();
    canvas.clear();
    on_scrn = [];
    label_on_scrn = [];
}
let clear = new FGCallNative("clear", _clear, new OverloadT([
    new FunctionT([], nothingT),
]));
export let nativeNames = {
    "canvas": { type: canvasT, value: canvas },
    "repl": { type: replT, value: repl },
    "help": { type: help.sig, value: help },
    "print": { type: print.sig, value: print },
    draw: { type: draw.sig, value: draw },
    label: { type: label.sig, value: label },
    clear: { type: clear.sig, value: clear },
    circle: { type: circle.sig, value: circle },
    rcircle: { type: rcircle.sig, value: rcircle },
    coord: { type: coord.sig, value: coord },
    intersect: { type: intersect.sig, value: intersect },
    pt: { type: pt.sig, value: pt },
    rpt: { type: rpt.sig, value: rpt },
    segment: { type: segment.sig, value: segment },
    rsegment: { type: rsegment.sig, value: rsegment },
    length: { type: length.sig, value: length },
    pic: { type: pic.sig, value: pic },
    mappic: { type: mappic.sig, value: mappic },
    quartet: { type: quartet.sig, value: quartet },
};
