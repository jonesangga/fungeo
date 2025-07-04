import { Session } from "./vm.js"
import { Canvas, defaultCanvas } from "./ui/canvas.js"
import { type Names } from "./vmfunction.js"
import { type GeoObj, FGCallNative, FGNumber } from "./value.js"
import { Point } from "./geo/point.js"
import { Segment } from "./geo/segment.js"
import { Circle } from "./geo/circle.js"
import { welcome } from "./data/help.js"
import { FunctionT, OverloadT,
         anyT, canvasT, circleT, geoT, nothingT, numberT, pointT, segmentT } from "./literal/type.js"

function _print(session: Session, ver: number): void {
    let value = session.pop();
    session.pop(); // The function.
    session.write( value.to_str() + "\n" );
}
const print = new FGCallNative("print", _print,
    new OverloadT([
        new FunctionT([anyT], nothingT, ["object"]),
    ])
);

function _canvas(session: Session, ver: number): void {
    let h = (session.pop() as FGNumber).value;
    let w = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Canvas(w, h));
}
let canvas = new FGCallNative("canvas", _canvas,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
    ])
);

function _canvas_place(session: Session, ver: number): void {
    let canvas = session.pop() as Canvas;
    let y = (session.pop() as FGNumber).value;
    let x = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(canvas.place(x, y));
}
export let canvas_place = new FGCallNative("canvas_place", _canvas_place,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["x", "y"]),
    ])
);

function _canvas_resize(session: Session, ver: number): void {
    let canvas = session.pop() as Canvas;
    let w = (session.pop() as FGNumber).value;
    let h = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(canvas.resize(w, h));
}
export let canvas_resize = new FGCallNative("canvas_resize", _canvas_resize,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
    ])
);

canvasT.methods["place"] = { type: canvas_place.sig, value: canvas_place };
canvasT.methods["resize"] = { type: canvas_resize.sig, value: canvas_resize };

function _draw(session: Session, ver: number): void {
    let v = session.pop() as GeoObj;
    session.pop(); // The function.
    session.oncanvas.push(v);
    session.render();
}
let draw = new FGCallNative("draw", _draw,
    new OverloadT([
        new FunctionT([geoT], nothingT, ["obj"]),
    ])
);

// TODO: Pass canvas obj and remove defaultCanvas.
function _clear(session: Session): void {
    session.pop(); // The function.
    session.clear();
}
let clear = new FGCallNative("clear",  _clear,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

function _pt(session: Session, ver: number): void {
    let y = (session.pop() as FGNumber).value;
    let x = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Point(x, y));
}
let pt = new FGCallNative("pt", _pt,
    new OverloadT([
        new FunctionT([numberT, numberT], pointT, ["x", "y"]),
    ])
);

function _circle(session: Session, ver: number): void {
    if (ver === 0) {
        let r = (session.pop() as FGNumber).value;
        let y = (session.pop() as FGNumber).value;
        let x = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        let q = session.pop() as Point;
        let p = session.pop() as Point;
        session.pop(); // The function.
        let r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
        session.push(new Circle(p.x, p.y, r));
    }
    else if (ver === 2) {
        let r = (session.pop() as FGNumber).value;
        let p = session.pop() as Point;
        session.pop(); // The function.
        session.push(new Circle(p.x, p.y, r));
    }
}
let circle = new FGCallNative("circle", _circle,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT], circleT, ["x", "y", "r"]),
        new FunctionT([pointT, pointT], circleT, ["center", "other"]),
        new FunctionT([pointT, numberT], circleT, ["center", "r"]),
    ])
);

function _segment(session: Session, ver: number): void {
    if (ver === 0) {
        let y2 = (session.pop() as FGNumber).value;
        let x2 = (session.pop() as FGNumber).value;
        let y1 = (session.pop() as FGNumber).value;
        let x1 = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        let q = session.pop() as Point;
        let p = session.pop() as Point;
        session.pop(); // The function.
        session.push(new Segment(p.x, p.y, q.x, q.y));
    }
}
let segment = new FGCallNative("segment", _segment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], segmentT, ["x1", "y1", "x2", "y2"]),
        new FunctionT([pointT, pointT], segmentT, ["p", "q"]),
    ])
);

function _help(session: Session, ver: number): void {
    if (ver === 0) {
        let value = session.pop();
        session.pop(); // The function.
        if (value instanceof FGCallNative) {
            session.write( value.help() );
        }
        else {
            session.write( `no help for ${ value.to_str() }, not implemented yet` );
        }
    }
    else if (ver === 1) {
        session.pop(); // The function.
        session.write( welcome );
    }
}
let help = new FGCallNative("help",  _help,
    new OverloadT([
        new FunctionT([anyT], nothingT, ["command"]),
        new FunctionT([], nothingT, []),
    ])
);

export let coreNames: Names = {
    canvas0: { type: canvasT, value: defaultCanvas },
    canvas:  { type: canvas.sig, value: canvas },
    circle:  { type: circle.sig, value: circle },
    clear:   { type: clear.sig, value: clear },
    draw:    { type: draw.sig, value: draw },
    help:    { type: help.sig, value: help },
    print:   { type: print.sig, value: print },
    pt:      { type: pt.sig, value: pt },
    segment: { type: segment.sig, value: segment },
};
