import { Session } from "./vm.js"
import { type Names } from "./vmfunction.js"
import { FGCallNative, FGNumber } from "./value.js"
import { Point } from "./geo/point.js"
import { Segment } from "./geo/segment.js"
import { Circle } from "./geo/circle.js"
import { welcome } from "./data/help.js"
import { FunctionT, OverloadT,
         anyT, circleT, nothingT, numberT, pointT, segmentT } from "./literal/type.js"

function _print(session: Session, ver: number): void {
    let value = session.pop();
    session.pop(); // The function.
    session.write( value.to_str() + "\n" );
}
const print = new FGCallNative("print", _print,
    new OverloadT([
        new FunctionT([anyT], nothingT),
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
        new FunctionT([numberT, numberT], pointT),
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
        new FunctionT([numberT, numberT, numberT], circleT),
        new FunctionT([pointT, pointT], circleT),
        new FunctionT([pointT, numberT], circleT),
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
        new FunctionT([numberT, numberT, numberT, numberT], segmentT),
        new FunctionT([pointT, pointT], segmentT),
    ])
);

function _help(session: Session, ver: number): void {
    if (ver === 0) {
        let arg = session.pop();
        session.pop(); // The function.
        if (arg instanceof FGCallNative) {
            session.write( arg.to_str() );
        }
        else {
            session.write( `no help for ${ arg.to_str() }, not implemented yet` );
        }
    }
    else if (ver === 1) {
        session.pop(); // The function.
        session.write( welcome );
    }
}
let help = new FGCallNative("help",  _help,
    new OverloadT([
        new FunctionT([anyT], nothingT),
        new FunctionT([], nothingT),
    ])
);

export let coreNames: Names = {
    circle:  { type: circle.sig, value: circle },
    help:    { type: help.sig, value: help },
    print:   { type: print.sig, value: print },
    pt:      { type: pt.sig, value: pt },
    segment: { type: segment.sig, value: segment },
};
