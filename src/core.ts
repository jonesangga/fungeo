import { type ClassNames, type Names, Session } from "./vm.js"
import { Canvas, defaultCanvas } from "./ui/canvas.js"
import { type GeoObj, FGCallNative, FGNumber, FGString } from "./value.js"
import { Point } from "./geo/point.js"
import { Segment } from "./geo/segment.js"
import { Circle } from "./geo/circle.js"
import { welcome } from "./data/help.js"
import { Complex, complexT } from "./core/complex.js"
import { FunctionT, OverloadT,
         anyT, canvasT, circleT, geoT, nothingT, numberT, pointT, segmentT, stringT } from "./literal/type.js"

function _print(session: Session, ver: number): void {
    const value = session.pop();
    session.pop(); // The function.
    session.write( value.to_str() + "\n" );
}
const print = new FGCallNative("print", _print,
    new OverloadT([
        new FunctionT([anyT], nothingT, ["object"]),
    ])
);

function _canvas(session: Session, ver: number): void {
    const h = (session.pop() as FGNumber).value;
    const w = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Canvas(w, h));
}
const canvas = new FGCallNative("canvas", _canvas,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
    ])
);

function _canvas_place(session: Session, ver: number): void {
    const canvas = session.pop() as Canvas;
    const y = (session.pop() as FGNumber).value;
    const x = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(canvas.place(x, y));
}
const canvas_place = new FGCallNative("canvas_place", _canvas_place,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["x", "y"]),
    ])
);

function _canvas_resize(session: Session, ver: number): void {
    const canvas = session.pop() as Canvas;
    const h = (session.pop() as FGNumber).value;
    const w = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(canvas.resize(w, h));
}
const canvas_resize = new FGCallNative("canvas_resize", _canvas_resize,
    new OverloadT([
        new FunctionT([numberT, numberT], canvasT, ["w", "h"]),
    ])
);

function _canvas_save(session: Session, ver: number): void {
    if (ver === 0) {
        const canvas = session.pop() as Canvas;
        const filename = (session.pop() as FGString).value;
        session.pop(); // The function.
        canvas.save(filename);
    }
    else if (ver === 1) {
        const canvas = session.pop() as Canvas;
        session.pop(); // The function.
        canvas.save();
    }
}
const canvas_save = new FGCallNative("canvas_save", _canvas_save,
    new OverloadT([
        new FunctionT([stringT], nothingT, ["name"]),
        new FunctionT([], nothingT, []),
    ])
);

canvasT.methods["place"] =  { type: canvas_place.sig, value: canvas_place };
canvasT.methods["resize"] = { type: canvas_resize.sig, value: canvas_resize };
canvasT.methods["save"] =   { type: canvas_save.sig, value: canvas_save };

function _draw(session: Session, ver: number): void {
    const v = session.pop() as GeoObj;
    session.pop(); // The function.
    session.oncanvas.push(v);
    session.render();
}
const draw = new FGCallNative("draw", _draw,
    new OverloadT([
        new FunctionT([geoT], nothingT, ["obj"]),
    ])
);

// TODO: Pass canvas obj and remove defaultCanvas.
function _clear(session: Session): void {
    session.pop(); // The function.
    session.clear();
}
const clear = new FGCallNative("clear",  _clear,
    new OverloadT([
        new FunctionT([], nothingT, []),
    ])
);

function _pt(session: Session, ver: number): void {
    const y = (session.pop() as FGNumber).value;
    const x = (session.pop() as FGNumber).value;
    session.pop(); // The function.
    session.push(new Point(x, y));
}
const pt = new FGCallNative("pt", _pt,
    new OverloadT([
        new FunctionT([numberT, numberT], pointT, ["x", "y"]),
    ])
);

function _circle(session: Session, ver: number): void {
    if (ver === 0) {
        const r = (session.pop() as FGNumber).value;
        const y = (session.pop() as FGNumber).value;
        const x = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        const q = session.pop() as Point;
        const p = session.pop() as Point;
        session.pop(); // The function.
        const r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
        session.push(new Circle(p.x, p.y, r));
    }
    else if (ver === 2) {
        const r = (session.pop() as FGNumber).value;
        const p = session.pop() as Point;
        session.pop(); // The function.
        session.push(new Circle(p.x, p.y, r));
    }
}
const circle = new FGCallNative("circle", _circle,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT], circleT, ["x", "y", "r"]),
        new FunctionT([pointT, pointT], circleT, ["center", "other"]),
        new FunctionT([pointT, numberT], circleT, ["center", "r"]),
    ])
);

function _segment(session: Session, ver: number): void {
    if (ver === 0) {
        const y2 = (session.pop() as FGNumber).value;
        const x2 = (session.pop() as FGNumber).value;
        const y1 = (session.pop() as FGNumber).value;
        const x1 = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        const q = session.pop() as Point;
        const p = session.pop() as Point;
        session.pop(); // The function.
        session.push(new Segment(p.x, p.y, q.x, q.y));
    }
}
const segment = new FGCallNative("segment", _segment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], segmentT, ["x1", "y1", "x2", "y2"]),
        new FunctionT([pointT, pointT], segmentT, ["p", "q"]),
    ])
);

function _help(session: Session, ver: number): void {
    if (ver === 0) {
        const value = session.pop();
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
const help = new FGCallNative("help",  _help,
    new OverloadT([
        new FunctionT([anyT], nothingT, ["command"]),
        new FunctionT([], nothingT, []),
    ])
);

function _Complex(session: Session, ver: number): void {
    if (ver === 0) {
        const im = (session.pop() as FGNumber).value;
        const re = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Complex(re, im));
    }
    else if (ver === 1) {
        const re = (session.pop() as FGNumber).value;
        session.pop(); // The function.
        session.push(new Complex(re));
    }
}
// The reason this is named __Complex instead of just Complex is because Complex is already used as imported name.
const __Complex = new FGCallNative("Complex", _Complex,
    new OverloadT([
        new FunctionT([numberT, numberT], complexT, ["re", "im"]),
        new FunctionT([numberT], complexT, ["re"]),
    ])
);

function _Complex_add(session: Session): void {
    const z = session.pop() as Complex;
    const w = session.pop() as Complex;
    session.pop(); // The function.
    session.push(z.add(w));
}
const Complex_add = new FGCallNative("Complex_add", _Complex_add,
    new OverloadT([
        new FunctionT([complexT], complexT, ["w"]),
    ])
);

function _Complex_sub(session: Session): void {
    const z = session.pop() as Complex;
    const w = session.pop() as Complex;
    session.pop(); // The function.
    session.push(z.sub(w));
}
const Complex_sub = new FGCallNative("Complex_sub", _Complex_sub,
    new OverloadT([
        new FunctionT([complexT], complexT, ["w"]),
    ])
);

function _Complex_mul(session: Session): void {
    const z = session.pop() as Complex;
    const w = session.pop() as Complex;
    session.pop(); // The function.
    session.push(z.mul(w));
}
const Complex_mul = new FGCallNative("Complex_mul", _Complex_mul,
    new OverloadT([
        new FunctionT([complexT], complexT, ["w"]),
    ])
);

function _Complex_div(session: Session): void {
    const z = session.pop() as Complex;
    const w = session.pop() as Complex;
    session.pop(); // The function.
    session.push(z.div(w));
}
const Complex_div = new FGCallNative("Complex_div", _Complex_div,
    new OverloadT([
        new FunctionT([complexT], complexT, ["w"]),
    ])
);

function _Complex_abs(session: Session): void {
    const z = session.pop() as Complex;
    session.pop(); // The function.
    session.push(new FGNumber(z.abs()));
}
const Complex_abs = new FGCallNative("Complex_abs", _Complex_abs,
    new OverloadT([
        new FunctionT([], numberT, []),
    ])
);

function _Complex_arg(session: Session): void {
    const z = session.pop() as Complex;
    session.pop(); // The function.
    session.push(new FGNumber(z.arg()));
}
const Complex_arg = new FGCallNative("Complex_arg", _Complex_arg,
    new OverloadT([
        new FunctionT([], numberT, []),
    ])
);

function _Complex_conj(session: Session): void {
    const z = session.pop() as Complex;
    session.pop(); // The function.
    session.push(z.conj());
}
const Complex_conj = new FGCallNative("Complex_conj", _Complex_conj,
    new OverloadT([
        new FunctionT([], complexT, []),
    ])
);

complexT.methods["add"] = { type: Complex_add.sig, value: Complex_add };
complexT.methods["sub"] = { type: Complex_sub.sig, value: Complex_sub };
complexT.methods["mul"] = { type: Complex_mul.sig, value: Complex_mul };
complexT.methods["div"] = { type: Complex_div.sig, value: Complex_div };
complexT.methods["abs"] = { type: Complex_abs.sig, value: Complex_abs };
complexT.methods["arg"] = { type: Complex_arg.sig, value: Complex_arg };
complexT.methods["conj"] = { type: Complex_conj.sig, value: Complex_conj };

export const coreClassNames: ClassNames = {
};

export const coreNames: Names = {
    canvas0: { type: canvasT, value: defaultCanvas },
    canvas:  { type: canvas.sig, value: canvas },
    circle:  { type: circle.sig, value: circle },
    clear:   { type: clear.sig, value: clear },
    Complex: { type: __Complex.sig, value: __Complex },
    draw:    { type: draw.sig, value: draw },
    help:    { type: help.sig, value: help },
    print:   { type: print.sig, value: print },
    pt:      { type: pt.sig, value: pt },
    segment: { type: segment.sig, value: segment },
};
