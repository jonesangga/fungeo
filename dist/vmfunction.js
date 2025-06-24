import { pop, push, vm_output } from "./vm.js";
import { FGCallNative, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import fish from "./data/fish.js";
import repl from "./ui/repl.js";
import { Circle, RichCircle } from "./geo/circle.js";
import { Point, RichPoint } from "./geo/point.js";
import { Segment, RichSegment } from "./geo/segment.js";
import { ListT, UnionT, anyT, pictureT, FunctionT, OverloadT, ellipseT, segmentT, richSegmentT, nothingT, pointT, richPointT, circleT, richCircleT, stringT, numberT, canvasT, replT } from "./literal/type.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
const fillableT = new UnionT([circleT, ellipseT]);
function _print(ver) {
    let value = pop();
    pop();
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
    return [700, 905, 750, 840, 850, 900, 910, 920, 1000].includes(v.kind);
}
function isRichGeo(v) {
    return [905, 910, 920].includes(v.kind);
}
function _draw(ver) {
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
let draw = new FGCallNative("draw", _draw, new OverloadT([
    new FunctionT([geoT], nothingT),
]));
function _label(ver) {
    let label = pop().value;
    let v = pop();
    pop();
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label, new OverloadT([
    new FunctionT([richgeoT, stringT], nothingT),
]));
function _circle(ver) {
    if (ver === 0) {
        let r = pop().value;
        let y = pop().value;
        let x = pop().value;
        pop();
        push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        let q = pop();
        let p = pop();
        pop();
        let r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
        push(new Circle(p.x, p.y, r));
    }
}
let circle = new FGCallNative("circle", _circle, new OverloadT([
    new FunctionT([numberT, numberT, numberT], circleT),
    new FunctionT([pointT, pointT], circleT),
]));
function _intersect(ver) {
    let q = pop();
    let p = pop();
    pop();
    let points = p.intersect(q);
    let res = new FGList(points, pointT);
    push(res);
}
let intersect = new FGCallNative("intersect", _intersect, new OverloadT([
    new FunctionT([circleT, circleT], new ListT(pointT)),
    new FunctionT([richCircleT, richCircleT], new ListT(richPointT)),
]));
function _rcircle(ver) {
    let q = pop();
    let p = pop();
    pop();
    push(new RichCircle(p, q));
}
let rcircle = new FGCallNative("rcircle", _rcircle, new OverloadT([
    new FunctionT([richPointT, richPointT], richCircleT),
]));
function _pt(ver) {
    let y = pop().value;
    let x = pop().value;
    pop();
    push(new Point(x, y));
}
let pt = new FGCallNative("pt", _pt, new OverloadT([
    new FunctionT([numberT, numberT], pointT),
]));
function _rpt(ver) {
    let y = pop().value;
    let x = pop().value;
    pop();
    push(new RichPoint(x, y));
}
let rpt = new FGCallNative("rpt", _rpt, new OverloadT([
    new FunctionT([numberT, numberT], richPointT),
]));
function _segment(ver) {
    if (ver === 0) {
        let y2 = pop().value;
        let x2 = pop().value;
        let y1 = pop().value;
        let x1 = pop().value;
        pop();
        push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        let q = pop();
        let p = pop();
        pop();
        push(new Segment(p.x, p.y, q.x, q.y));
    }
}
let segment = new FGCallNative("segment", _segment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], segmentT),
    new FunctionT([pointT, pointT], segmentT),
]));
function _rsegment(ver) {
    if (ver === 0) {
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
    else if (ver === 1) {
        let q = pop();
        let p = pop();
        pop();
        push(new RichSegment(p, q));
    }
}
let rsegment = new FGCallNative("rsegment", _rsegment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], richSegmentT),
    new FunctionT([richPointT, richPointT], richSegmentT),
]));
export let nativeNames = {
    "canvas": { type: canvasT, value: canvas },
    "repl": { type: replT, value: repl },
    "fishp": { type: pictureT, value: fish.p },
    "fishq": { type: pictureT, value: fish.q },
    "fishr": { type: pictureT, value: fish.r },
    "fishs": { type: pictureT, value: fish.s },
    "print": { type: print.sig, value: print },
    "draw": { type: draw.sig, value: draw },
    "label": { type: label.sig, value: label },
    "circle": { type: circle.sig, value: circle },
    "rcircle": { type: rcircle.sig, value: rcircle },
    "intersect": { type: intersect.sig, value: intersect },
    "pt": { type: pt.sig, value: pt },
    "rpt": { type: rpt.sig, value: rpt },
    "segment": { type: segment.sig, value: segment },
    "rsegment": { type: rsegment.sig, value: rsegment },
};
