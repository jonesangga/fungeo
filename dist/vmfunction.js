import { FGCallNative, FGNumber, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import repl from "./ui/repl.js";
import { RichCircle } from "./geo/circle.js";
import { Coord } from "./geo/coordinate.js";
import { RichPoint } from "./geo/point.js";
import Picture from "./geo/picture.js";
import { RichSegment } from "./geo/segment.js";
import { ListT, UnionT, pictureT, FunctionT, OverloadT, ellipseT, segmentT, richSegmentT, nothingT, pointT, richPointT, circleT, richCircleT, stringT, numberT, canvasT, coordT, replT } from "./literal/type.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, coordT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
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
function _draw(session, ver) {
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
function _label(session, ver) {
    let label = session.pop().value;
    let v = session.pop();
    session.pop();
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label, new OverloadT([
    new FunctionT([richgeoT, stringT], nothingT),
]));
function _intersect(session, ver) {
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
function _rcircle(session, ver) {
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
function _quartet(session) {
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
function _mappic(session) {
    let target = session.pop();
    let src = session.pop();
    session.pop();
    src.map_to(target);
    draw_onScreen();
}
let mappic = new FGCallNative("mappic", _mappic, new OverloadT([
    new FunctionT([pictureT, pictureT], nothingT),
]));
function _pic(session) {
    let w = session.pop().value;
    let h = session.pop().value;
    session.pop();
    let pic = new Picture(w, h);
    session.push(pic);
}
let pic = new FGCallNative("pic", _pic, new OverloadT([
    new FunctionT([numberT, numberT], pictureT),
]));
function _coord(session) {
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
function _coord_pt(session, ver) {
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
function _coord_hide_grid(session, ver) {
    let o = session.pop();
    session.pop();
    session.push(o.hide_grid());
}
export let coord_hide_grid = new FGCallNative("coord_hide_grid", _coord_hide_grid, new OverloadT([
    new FunctionT([], coordT),
]));
coordT.methods["pt"] = { type: coord_pt.sig, value: coord_pt };
coordT.methods["hide_grid"] = { type: coord_hide_grid.sig, value: coord_hide_grid };
function _length(session, ver) {
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
function _rsegment(session, ver) {
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
function _clear(session) {
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
    draw: { type: draw.sig, value: draw },
    label: { type: label.sig, value: label },
    clear: { type: clear.sig, value: clear },
    rcircle: { type: rcircle.sig, value: rcircle },
    coord: { type: coord.sig, value: coord },
    intersect: { type: intersect.sig, value: intersect },
    rsegment: { type: rsegment.sig, value: rsegment },
    length: { type: length.sig, value: length },
    pic: { type: pic.sig, value: pic },
    mappic: { type: mappic.sig, value: mappic },
    quartet: { type: quartet.sig, value: quartet },
};
