import { Canvas, defaultCanvas } from "./ui/canvas.js";
import { FGCallNative } from "./value.js";
import { Point } from "./geo/point.js";
import { Segment } from "./geo/segment.js";
import { Circle } from "./geo/circle.js";
import { welcome } from "./data/help.js";
import { FunctionT, OverloadT, anyT, canvasT, circleT, geoT, nothingT, numberT, pointT, segmentT } from "./literal/type.js";
function _print(session, ver) {
    const value = session.pop();
    session.pop();
    session.write(value.to_str() + "\n");
}
const print = new FGCallNative("print", _print, new OverloadT([
    new FunctionT([anyT], nothingT, ["object"]),
]));
function _canvas(session, ver) {
    const h = session.pop().value;
    const w = session.pop().value;
    session.pop();
    session.push(new Canvas(w, h));
}
const canvas = new FGCallNative("canvas", _canvas, new OverloadT([
    new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
]));
function _canvas_place(session, ver) {
    const canvas = session.pop();
    const y = session.pop().value;
    const x = session.pop().value;
    session.pop();
    session.push(canvas.place(x, y));
}
const canvas_place = new FGCallNative("canvas_place", _canvas_place, new OverloadT([
    new FunctionT([numberT, numberT], canvasT, ["x", "y"]),
]));
function _canvas_resize(session, ver) {
    const canvas = session.pop();
    const w = session.pop().value;
    const h = session.pop().value;
    session.pop();
    session.push(canvas.resize(w, h));
}
const canvas_resize = new FGCallNative("canvas_resize", _canvas_resize, new OverloadT([
    new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
]));
canvasT.methods["place"] = { type: canvas_place.sig, value: canvas_place };
canvasT.methods["resize"] = { type: canvas_resize.sig, value: canvas_resize };
function _draw(session, ver) {
    const v = session.pop();
    session.pop();
    session.oncanvas.push(v);
    session.render();
}
const draw = new FGCallNative("draw", _draw, new OverloadT([
    new FunctionT([geoT], nothingT, ["obj"]),
]));
function _clear(session) {
    session.pop();
    session.clear();
}
const clear = new FGCallNative("clear", _clear, new OverloadT([
    new FunctionT([], nothingT, []),
]));
function _pt(session, ver) {
    const y = session.pop().value;
    const x = session.pop().value;
    session.pop();
    session.push(new Point(x, y));
}
const pt = new FGCallNative("pt", _pt, new OverloadT([
    new FunctionT([numberT, numberT], pointT, ["x", "y"]),
]));
function _circle(session, ver) {
    if (ver === 0) {
        const r = session.pop().value;
        const y = session.pop().value;
        const x = session.pop().value;
        session.pop();
        session.push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        const q = session.pop();
        const p = session.pop();
        session.pop();
        const r = Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
        session.push(new Circle(p.x, p.y, r));
    }
    else if (ver === 2) {
        const r = session.pop().value;
        const p = session.pop();
        session.pop();
        session.push(new Circle(p.x, p.y, r));
    }
}
const circle = new FGCallNative("circle", _circle, new OverloadT([
    new FunctionT([numberT, numberT, numberT], circleT, ["x", "y", "r"]),
    new FunctionT([pointT, pointT], circleT, ["center", "other"]),
    new FunctionT([pointT, numberT], circleT, ["center", "r"]),
]));
function _segment(session, ver) {
    if (ver === 0) {
        const y2 = session.pop().value;
        const x2 = session.pop().value;
        const y1 = session.pop().value;
        const x1 = session.pop().value;
        session.pop();
        session.push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        const q = session.pop();
        const p = session.pop();
        session.pop();
        session.push(new Segment(p.x, p.y, q.x, q.y));
    }
}
const segment = new FGCallNative("segment", _segment, new OverloadT([
    new FunctionT([numberT, numberT, numberT, numberT], segmentT, ["x1", "y1", "x2", "y2"]),
    new FunctionT([pointT, pointT], segmentT, ["p", "q"]),
]));
function _help(session, ver) {
    if (ver === 0) {
        const value = session.pop();
        session.pop();
        if (value instanceof FGCallNative) {
            session.write(value.help());
        }
        else {
            session.write(`no help for ${value.to_str()}, not implemented yet`);
        }
    }
    else if (ver === 1) {
        session.pop();
        session.write(welcome);
    }
}
const help = new FGCallNative("help", _help, new OverloadT([
    new FunctionT([anyT], nothingT, ["command"]),
    new FunctionT([], nothingT, []),
]));
export const coreNames = {
    canvas0: { type: canvasT, value: defaultCanvas },
    canvas: { type: canvas.sig, value: canvas },
    circle: { type: circle.sig, value: circle },
    clear: { type: clear.sig, value: clear },
    draw: { type: draw.sig, value: draw },
    help: { type: help.sig, value: help },
    print: { type: print.sig, value: print },
    pt: { type: pt.sig, value: pt },
    segment: { type: segment.sig, value: segment },
};
