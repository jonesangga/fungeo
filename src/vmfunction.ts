import { pop, push, vm_output } from "./vm.js"
import { type Value, type GeoObj, type RichGeoObj, type Fillable, Kind, FGCallNative, FGNumber, FGString, FGList } from "./value.js"
import { FGColor } from "./literal/color.js"
import canvas from "./ui/canvas.js"
import fish from "./data/fish.js"
import repl from "./ui/repl.js"
import { Circle, RichCircle } from "./geo/circle.js"
import { Point, RichPoint } from "./geo/point.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import Rect from "./geo/rect.js"
import { Segment, RichSegment } from "./geo/segment.js"
import { welcome } from "./data/help.js"
import { type Type, ListT, UnionT, anyT, pictureT, FunctionT, OverloadT,
         ellipseT, segmentT, richSegmentT, nothingT, pointT, richPointT, circleT, richCircleT, stringT, numberT,
         colorT, canvasT, replT, NothingT, AnyT } from "./literal/type.js"

const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
const fillableT = new UnionT([circleT, ellipseT]);

function _print(ver: number): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() + "\n" );
}
let print = new FGCallNative("print", _print,
    new OverloadT([
        new FunctionT([anyT], nothingT),
    ])
);

// function _printf(): void {
    // let value = pop();
    // pop();              // The function.
    // vm_output( value.to_str() );
// }
// let printf = new FGCallNative("printf", _printf,
    // new FunctionT([anyT], nothingT)
// );

// function _sqrt(): void {
    // let value = pop() as FGNumber;
    // pop();              // The function.
    // push(new FGNumber( Math.sqrt(value.value) ));
// }
// let sqrt = new FGCallNative("sqrt", _sqrt,
    // new FunctionT([numberT], numberT)
// );

// function _abs(): void {
    // let value = pop() as FGNumber;
    // pop();              // The function.
    // push(new FGNumber( Math.abs(value.value) ));
// }
// let abs = new FGCallNative("abs", _abs,
    // new FunctionT([numberT], numberT)
// );

// function _show(): void {
    // let value = pop();
    // pop();              // The function.
    // push(new FGString( value.to_str() ));
// }
// let show = new FGCallNative("show", _show,
    // new FunctionT([numberT], stringT)
// );

// function _padl(): void {
    // let filler = (pop() as FGString).value;
    // let width = (pop() as FGNumber).value;
    // let text = (pop() as FGString).value;
    // pop();              // The function.

    // let result = (filler.repeat(width) + text).slice(-width);
    // push(new FGString(result));
// }
// let padl = new FGCallNative("padl", _padl,
    // new FunctionT([stringT, numberT, stringT], stringT)
// );

// function _RGB(): void {
    // let b = (pop() as FGNumber).value;
    // let g = (pop() as FGNumber).value;
    // let r = (pop() as FGNumber).value;
    // pop();              // The function.
    // push(new FGColor(r, g, b));
// }
// let RGB = new FGCallNative("RGB", _RGB,
    // new FunctionT([numberT, numberT, numberT], colorT)
// );

// // TODO: Think about this again. We lose the type information because that is on table not on stack or on the value.
// function _TypeFn(): void {
    // let value = pop();
    // pop();              // The function.
    // push((value as FGCallNative).typeof());
// }
// let TypeFn = new FGCallNative("TypeFn", _TypeFn,
    // new FunctionT([anyT], stringT)
// );

// // TODO: not type safe, change to use generic.
// function _Push(): void {
    // let el = pop();
    // let list = pop() as FGList;
    // pop();              // The function.
    // list.value.push(el);
// }
// let Push = new FGCallNative("Push", _Push,
    // new FunctionT([new ListT(anyT), anyT], nothingT)
// );

let on_scrn: GeoObj[] = [];
let label_on_scrn: RichGeoObj[] = [];

function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
    for (let obj of label_on_scrn) {
        obj.draw_label();
    }
}

function isGeo(v: Value): v is GeoObj {
    return [Kind.Circle, Kind.RichCircle, Kind.Ellipse, Kind.Picture, Kind.Point, Kind.Rect, Kind.RichPoint, Kind.RichSegment, Kind.Segment].includes(v.kind);
}

function isRichGeo(v: Value): v is RichGeoObj {
    return [Kind.RichCircle, Kind.RichPoint, Kind.RichSegment].includes(v.kind);
}

function _draw(ver: number): void {
    let v = pop();
    pop();              // The function.
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
let draw = new FGCallNative("draw", _draw,
    new OverloadT([
        new FunctionT([geoT], nothingT),
    ])
);

function _label(ver: number): void {
    let label = (pop() as FGString).value;
    let v = pop() as RichGeoObj;
    pop();              // The function.
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label,
    new OverloadT([
        new FunctionT([richgeoT, stringT], nothingT),
    ])
);

// function _Fill(): void {
    // console.log("in _Fill()");
    // let v = pop() as Fillable;
    // let color = pop() as FGColor;
    // pop();              // The function.
    // v.fillStyle = color.to_hex();
    // draw_onScreen();
// }
// let Fill = new FGCallNative("Fill", _Fill,
    // new FunctionT([colorT, fillableT], nothingT)
// );

function _circle(ver: number): void {
    if (ver === 0) {
        let r = (pop() as FGNumber).value;
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        push(new Circle(x, y, r));
    }
    else if (ver === 1) {
        let q = pop() as Point;
        let p = pop() as Point;
        pop();              // The function.
        let r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
        push(new Circle(p.x, p.y, r));
    }
}
let circle = new FGCallNative("circle", _circle,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT], circleT),
        new FunctionT([pointT, pointT], circleT),
    ])
);

function _intersect(ver: number): void {
    let q = pop() as Circle;
    let p = pop() as Circle;
    pop();              // The function.
    let points = p.intersect(q);
    let res = new FGList(points, pointT);
    push(res);
}
let intersect = new FGCallNative("intersect", _intersect,
    new OverloadT([
        new FunctionT([circleT, circleT], new ListT(pointT)),
        new FunctionT([richCircleT, richCircleT], new ListT(richPointT)),
    ])
);

function _rcircle(ver: number): void {
    if (ver === 0) {
        let q = pop() as RichPoint;
        let p = pop() as RichPoint;
        pop();              // The function.
        push(new RichCircle(p, q));
    }
    else if (ver === 1) {
        let r = (pop() as FGNumber).value;
        let p = pop() as RichPoint;
        pop();              // The function.
        let q = new RichPoint(p.x + r, p.y);
        push(new RichCircle(p, q));
    }
}
let rcircle = new FGCallNative("rcircle", _rcircle,
    new OverloadT([
        new FunctionT([richPointT, richPointT], richCircleT),
        new FunctionT([richPointT, numberT], richCircleT),
    ])
);

// function _Ccurv(): void {
    // let bend = (pop() as FGNumber).value;
    // let y = (pop() as FGNumber).value;
    // let x = (pop() as FGNumber).value;
    // pop();              // The function.
    // let c = Circle.with_bend(x, y, bend);
    // push(c);
// }
// const Ccurv = new FGCallNative("Ccurv", _Ccurv,
    // new FunctionT([numberT, numberT, numberT], circleT)
// );

// // TODO: Clean up
// function _Descart(): void {
    // let c3 = pop() as Circle;
    // let c2 = pop() as Circle;
    // let c1 = pop() as Circle;
    // pop();              // The function.
    // let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    // push(list);
// }
// const Descart = new FGCallNative("Descart", _Descart,
    // new FunctionT(
        // [circleT, circleT, circleT],
        // new ListT(numberT),
    // )
// );

// // TODO: Clean up
// function _ComplexDescart(): void {
    // let curv = pop() as FGNumber;
    // let c3 = pop() as Circle;
    // let c2 = pop() as Circle;
    // let c1 = pop() as Circle;
    // pop();              // The function.
    // let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleT);
    // push(circles);
// }
// const ComplexDescart = new FGCallNative("ComplexDescart", _ComplexDescart,
    // new FunctionT(
        // [circleT, circleT, circleT, numberT],
        // new ListT(circleT),
    // )
// );

// function _E(): void {
    // let ry = (pop() as FGNumber).value;
    // let rx = (pop() as FGNumber).value;
    // let y  = (pop() as FGNumber).value;
    // let x  = (pop() as FGNumber).value;
    // pop();              // The function.
    // let e = new Ellipse(x, y, rx, ry);
    // push(e);
// }
// let E = new FGCallNative("E", _E,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // ellipseT,
    // )
// );

function _pt(ver: number): void {
    if (ver === 0) {
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        push(new Point(x, y));
    }
    else if (ver === 1) {
        let rp = pop() as RichPoint;
        pop();              // The function.
        push(new Point(rp.x, rp.y));
    }
}
let pt = new FGCallNative("pt", _pt,
    new OverloadT([
        new FunctionT([numberT, numberT], pointT),
        new FunctionT([richPointT], pointT),
    ])
);

function _rpt(ver: number): void {
    if (ver === 0) {
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        push(new RichPoint(x, y));
    }
    else {
        let p = pop() as Point;
        pop();              // The function.
        push(new RichPoint(p.x, p.y));
    }
}
let rpt = new FGCallNative("rpt", _rpt,
    new OverloadT([
        new FunctionT([numberT, numberT], richPointT),
        new FunctionT([pointT], richPointT),
    ])
);

// function _Paint(): void {
    // let geo = pop() as GeoObj;
    // let pic = pop() as Picture;
    // pop();              // The function.
    // pic.objs.push(geo);
    // draw_onScreen();
// }
// let Paint = new FGCallNative("Paint", _Paint,
    // new FunctionT([pictureT, geoT], nothingT)
// );

// function _Cw(): void {
    // let pic = pop() as Picture;
    // pop();              // The function.
    // push(pic.cw());
// }
// let Cw = new FGCallNative("Cw", _Cw,
    // new FunctionT([pictureT], pictureT)
// );

// function _Ccw(): void {
    // let pic = pop() as Picture;
    // pop();              // The function.
    // push(pic.ccw());
// }
// let Ccw = new FGCallNative("Ccw", _Ccw,
    // new FunctionT([pictureT], pictureT)
// );

// function _FlipH(): void {
    // let pic = pop() as Picture;
    // pop();              // The function.
    // push(pic.fliph());
// }
// let FlipH = new FGCallNative("FlipH", _FlipH,
    // new FunctionT([pictureT], pictureT)
// );

// function _FlipV(): void {
    // let pic = pop() as Picture;
    // pop();              // The function.
    // push(pic.flipv());
// }
// let FlipV = new FGCallNative("FlipV", _FlipV,
    // new FunctionT([pictureT], pictureT)
// );

// TODO: clean Above and Beside later.

// function _Above(): void {
    // if (n === 0) {
        // let bottom = pop() as Picture;
        // let top = pop() as Picture;
        // pop();              // The function.
        // push(Picture.above(1, 1, top, bottom));
    // } else {
        // let bottom = pop() as Picture;
        // let top = pop() as Picture;
        // let rbottom = (pop() as FGNumber).value;
        // let rtop = (pop() as FGNumber).value;
        // pop();              // The function.
        // push(Picture.above(rtop, rbottom, top, bottom));
    // }
// }
// let Above = new FGCallNative("Above", _Above, [
    // {
        // input:  [pictureT, pictureT],
        // output: pictureT,
    // },
    // {
        // input:  [numberT, numberT, pictureT, pictureT],
        // output: pictureT,
    // },
// ]);

// function _Beside(): void {
    // if (n === 0) {
        // let right = pop() as Picture;
        // let left = pop() as Picture;
        // pop();              // The function.
        // push(Picture.beside(1, 1, left, right));
    // } else {
        // let right = pop() as Picture;
        // let left = pop() as Picture;
        // let rright = (pop() as FGNumber).value;
        // let rleft = (pop() as FGNumber).value;
        // pop();              // The function.
        // push(Picture.beside(rleft, rright, left, right));
    // }
// }
// let Beside = new FGCallNative("Beside", _Beside, [
    // {
        // input:  [pictureT, pictureT],
        // output: pictureT
    // },
    // {
        // input:  [numberT, numberT, pictureT, pictureT],
        // output: pictureT,
    // },
// ]);

// function _Quartet(): void {
    // let s = pop() as Picture;
    // let r = pop() as Picture;
    // let q = pop() as Picture;
    // let p = pop() as Picture;
    // pop();              // The function.
    // push(Picture.quartet(p, q, r, s));
// }
// let Quartet = new FGCallNative("Quartet", _Quartet,
    // new FunctionT(
        // [pictureT, pictureT, pictureT, pictureT],
        // pictureT,
    // )
// );

// function _Cycle(): void {
    // let p = pop() as Picture;
    // pop();              // The function.
    // push(Picture.cycle(p));
// }
// let Cycle = new FGCallNative("Cycle", _Cycle,
    // new FunctionT([pictureT], pictureT)
// );

// function _MapPic(): void {
    // let target = pop() as Picture;
    // let src = pop() as Picture;
    // pop();              // The function.
    // src.map_to(target);
    // draw_onScreen();
// }
// let MapPic = new FGCallNative("MapPic", _MapPic,
    // new FunctionT([pictureT, pictureT], nothingT)
// );

// function _Pic(): void {
    // let w = (pop() as FGNumber).value;
    // let h = (pop() as FGNumber).value;
    // pop();              // The function.
    // let pic = new Picture(w, h);
    // push(pic);
// }
// let Pic = new FGCallNative("Pic", _Pic,
    // new FunctionT([numberT, numberT], pictureT)
// );

// function _R(): void {
    // let h = (pop() as FGNumber).value;
    // let w = (pop() as FGNumber).value;
    // let y = (pop() as FGNumber).value;
    // let x = (pop() as FGNumber).value;
    // pop();              // The function.
    // let rect = new Rect(x, y, w, h);
    // push(rect);
// }
// let R = new FGCallNative("R", _R,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

// function _R_WithCenter(): void {
    // let h = (pop() as FGNumber).value;
    // let w = (pop() as FGNumber).value;
    // let y = (pop() as FGNumber).value;
    // let x = (pop() as FGNumber).value;
    // pop();              // The function.
    // let rect = new Rect(x-w/2, y-h/2, w, h);
    // push(rect);
// }
// let R_WithCenter = new FGCallNative("R_WithCenter", _R_WithCenter,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

// function _R_FromPoints(): void {
    // let q = pop() as Point;
    // let p = pop() as Point;
    // pop();              // The function.
    // let x = Math.min(p.x, q.x);
    // let y = Math.min(p.y, q.y);
    // let w = Math.abs(p.x - q.x);
    // let h = Math.abs(p.y - q.y);
    // let rect = new Rect(x, y, w, h);
    // push(rect);
// }
// let R_FromPoints = new FGCallNative("R_FromPoints", _R_FromPoints,
    // new FunctionT(
        // [pointT, pointT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

function _segment(ver: number): void {
    if (ver === 0) {
        let y2 = (pop() as FGNumber).value;
        let x2 = (pop() as FGNumber).value;
        let y1 = (pop() as FGNumber).value;
        let x1 = (pop() as FGNumber).value;
        pop();              // The function.
        push(new Segment(x1, y1, x2, y2));
    }
    else if (ver === 1) {
        let q = pop() as Point;
        let p = pop() as Point;
        pop();              // The function.
        push(new Segment(p.x, p.y, q.x, q.y));
    }
}
let segment = new FGCallNative("segment", _segment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], segmentT),
        new FunctionT([pointT, pointT], segmentT),
    ])
);

function _length(ver: number): void {
    if (ver === 0) {
        let s = pop() as Segment;
        pop();              // The function.
        push(new FGNumber(s.length()));
    }
    else if (ver === 1) {
        let s = pop() as RichSegment;
        pop();              // The function.
        push(new FGNumber(s.length()));
    }
}
let length = new FGCallNative("length", _length,
    new OverloadT([
        new FunctionT([segmentT], numberT),
        new FunctionT([richSegmentT], numberT),
    ])
);

function _rsegment(ver: number): void {
    if (ver === 0) {
        let y2 = (pop() as FGNumber).value;
        let x2 = (pop() as FGNumber).value;
        let y1 = (pop() as FGNumber).value;
        let x1 = (pop() as FGNumber).value;
        pop();              // The function.
        let p = new RichPoint(x1, y1);
        p.label = "P";
        let q = new RichPoint(x2, y2);
        q.label = "Q";
        push(new RichSegment(p, q));
    }
    else if (ver === 1) {
        let q = pop() as RichPoint;
        let p = pop() as RichPoint;
        pop();              // The function.
        push(new RichSegment(p, q));
    }
}
let rsegment = new FGCallNative("rsegment", _rsegment,
    new OverloadT([
        new FunctionT([numberT, numberT, numberT, numberT], richSegmentT),
        new FunctionT([richPointT, richPointT], richSegmentT),
    ])
);

// function _Midpoint(): void {
    // let segment = pop() as Segment;
    // pop();              // The function.
    // let point = segment.midpoint();
    // push(point);
// }
// let Midpoint = new FGCallNative("Midpoint", _Midpoint,
    // new FunctionT([segmentT], pointT)
// );

// function _help(): void {
    // pop();              // The function.
    // vm_output( welcome );
// }
// let help = new FGCallNative("help",  _help,
    // new FunctionT([], nothingT)
// );

// function _clear(): void {
    // pop();              // The function.
    // canvas.clear();
    // on_scrn = [];
    // label_on_scrn = [];
// }
// let clear = new FGCallNative("clear",  _clear,
    // new FunctionT([], nothingT)
// );

export type Method = {
    [name: string]: { type: Type, value: Value },
}

export type Names = {
    [name: string]: { type: Type, value: Value, mut?: boolean, methods?: Method },
};

export let nativeNames: Names = {
    // UI objects.
    "canvas": { type: canvasT, value: canvas },
    "repl":   { type: replT, value: repl },

    // Build-in fish components from paper "Functional Geometry" by Peter Henderson, 1982.
    "fishp": { type: pictureT, value: fish.p },
    "fishq": { type: pictureT, value: fish.q },
    "fishr": { type: pictureT, value: fish.r },
    "fishs": { type: pictureT, value: fish.s },

    // "help":   { type: help.sig, value: help },
    "print":  { type: print.sig, value: print },
    // "Push":   { type: Push.sig, value: Push },
    // "RGB":    { type: RGB.sig, value: RGB },
    // "printf": { type: printf.sig, value: printf },
    // "show":   { type: show.sig, value: show },
    // "padl":   { type: padl.sig, value: padl },
    // "Type":   { type: TypeFn.sig, value: TypeFn },
    "draw":   { type: draw.sig, value: draw },
    "label":  { type: label.sig, value: label },
    // "Fill":   { type: Fill.sig, value: Fill },
    // "clear":  { type: clear.sig, value: clear },
    // "Paint":  { type: Paint.sig, value: Paint },
    // "Ccurv":   { type: Ccurv.sig, value: Ccurv },
    // "Descart": { type: Descart.sig, value: Descart },
    // "ComplexDescart": { type: ComplexDescart.sig, value: ComplexDescart },
    // "E":      { type: E.sig, value: E },
    "circle":    { type: circle.sig, value: circle },
    "rcircle":   { type: rcircle.sig, value: rcircle },
    "intersect": { type: intersect.sig, value: intersect },
    "pt":        { type: pt.sig, value: pt },
    "rpt":       { type: rpt.sig, value: rpt },
    "segment":   { type: segment.sig, value: segment },
    "rsegment":  { type: rsegment.sig, value: rsegment },
    "length":    { type: length.sig, value: length },
    // "Pic":    { type: Pic.sig, value: Pic },
    // "Cw":     { type: Cw.sig, value: Cw },
    // "Ccw":    { type: Ccw.sig, value: Ccw },
    // "FlipH":  { type: FlipH.sig, value: FlipH },
    // "FlipV":  { type: FlipV.sig, value: FlipV },
    // "Above":  { type: functionT, value: Above },
    // "Beside": { type: functionT, value: Beside },
    // "Quartet": { type: Quartet.sig, value: Quartet },
    // "Cycle":  { type: Cycle.sig, value: Cycle },
    // "MapPic": { type: MapPic.sig, value: MapPic },
    // "R":      { type: R.sig, value: R, methods: {
        // "FromPoints": { type: R_FromPoints.sig, value: R_FromPoints },
        // "WithCenter": { type: R_WithCenter.sig, value: R_WithCenter },
    // }},
    // "Midpoint": { type: Midpoint.sig, value: Midpoint },
    // "sqrt": { type: sqrt.sig, value: sqrt },
    // "abs": { type: abs.sig, value: abs },
};
