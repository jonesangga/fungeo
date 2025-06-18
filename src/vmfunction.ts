import { pop, push, vm_output } from "./vm.js"
import { type Value, type GeoObj, type RichGeoObj, type Fillable, Kind, FGCallNative, FGCallUser, FGNumber, FGString, FGList } from "./value.js"
import { FGColor } from "./literal/color.js"
import canvas from "./ui/canvas.js"
import Circle from "./geo/circle.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import { Point, RichPoint } from "./geo/point.js"
import Rect from "./geo/rect.js"
import { rectStruct } from "./geo/rect.js"
import { pointStruct, richPointStruct } from "./geo/point.js"
import { circleStruct } from "./geo/circle.js"
import Segment from "./geo/segment.js"
import { welcome } from "./data/help.js"
import { type Type, ListT, UnionT, anyT, pictureT, FunctionT,
         ellipseT, segmentT, nothingT, stringT, numberT,
         colorT, canvasT, replT, NothingT, AnyT } from "./literal/type.js"

import fish from "./data/fish.js"
import repl from "./ui/repl.js"

const geoUnion = new UnionT([ellipseT, pictureT, pointStruct.value, richPointStruct.value, rectStruct.value, segmentT, circleStruct.value]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointStruct.value, richPointStruct.value, rectStruct.value, segmentT, circleStruct.value, geoList]);
export const richgeoT = new UnionT([richPointStruct.value]);
const fillableT = new UnionT([circleStruct.value, ellipseT, rectStruct.value]);

function _print(): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() + "\n" );
}
let print = new FGCallNative("print", _print,
    new FunctionT([anyT], nothingT)
);

function _printf(): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() );
}
let printf = new FGCallNative("printf", _printf,
    new FunctionT([anyT], nothingT)
);

function _sqrt(): void {
    let value = pop() as FGNumber;
    pop();              // The function.
    push(new FGNumber( Math.sqrt(value.value) ));
}
let sqrt = new FGCallNative("sqrt", _sqrt,
    new FunctionT([numberT], numberT)
);

function _abs(): void {
    let value = pop() as FGNumber;
    pop();              // The function.
    push(new FGNumber( Math.abs(value.value) ));
}
let abs = new FGCallNative("abs", _abs,
    new FunctionT([numberT], numberT)
);

function _show(): void {
    let value = pop();
    pop();              // The function.
    push(new FGString( value.to_str() ));
}
let show = new FGCallNative("show", _show,
    new FunctionT([numberT], stringT)
);

function _padl(): void {
    let filler = (pop() as FGString).value;
    let width = (pop() as FGNumber).value;
    let text = (pop() as FGString).value;
    pop();              // The function.

    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
let padl = new FGCallNative("padl", _padl,
    new FunctionT([stringT, numberT, stringT], stringT)
);

function _RGB(): void {
    let b = (pop() as FGNumber).value;
    let g = (pop() as FGNumber).value;
    let r = (pop() as FGNumber).value;
    pop();              // The function.
    push(new FGColor(r, g, b));
}
let RGB = new FGCallNative("RGB", _RGB,
    new FunctionT([numberT, numberT, numberT], colorT)
);

// TODO: Think about this again. We lose the type information because that is on table not on stack or on the value.
function _TypeFn(): void {
    let value = pop();
    pop();              // The function.
    push((value as FGCallNative).typeof());
}
let TypeFn = new FGCallNative("TypeFn", _TypeFn,
    new FunctionT([anyT], stringT)
);

// TODO: not type safe, change to use generic.
function _Push(): void {
    let el = pop();
    let list = pop() as FGList;
    pop();              // The function.
    list.value.push(el);
}
let Push = new FGCallNative("Push", _Push,
    new FunctionT([new ListT(anyT), anyT], nothingT)
);

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
    return [Kind.Circle, Kind.Ellipse, Kind.Picture, Kind.Point, Kind.Rect, Kind.RichPoint, Kind.Segment].includes(v.kind);
}

function isRichGeo(v: Value): v is RichGeoObj {
    return [Kind.RichPoint].includes(v.kind);
}

function _draw(): void {
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
    new FunctionT([geoT], nothingT)
);

function _label(): void {
    let label = (pop() as FGString).value;
    let v = pop() as RichGeoObj;
    pop();              // The function.
    v.label = label;
    draw_onScreen();
}
let label = new FGCallNative("label", _label,
    new FunctionT([richgeoT, stringT], nothingT)
);

function _Fill(): void {
    console.log("in _Fill()");
    let v = pop() as Fillable;
    let color = pop() as FGColor;
    pop();              // The function.
    v.fillStyle = color.to_hex();
    draw_onScreen();
}
let Fill = new FGCallNative("Fill", _Fill,
    new FunctionT([colorT, fillableT], nothingT)
);

function _circle(): void {
    let r = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let c = new Circle(x, y, r);
    push(c);
}
let circle = new FGCallNative("circle", _circle,
    new FunctionT([numberT, numberT, numberT], circleStruct.value)
);

function _C_FromPoints(): void {
    let q = pop() as Point;
    let p = pop() as Point;
    pop();              // The function.
    let r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
    let c = new Circle(p.x, p.y, r);
    push(c);
}
let C_FromPoints = new FGCallNative("C_FromPoints", _C_FromPoints,
    new FunctionT([pointStruct.value, pointStruct.value], circleStruct.value)
);

function _Ccurv(): void {
    let bend = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
const Ccurv = new FGCallNative("Ccurv", _Ccurv,
    new FunctionT([numberT, numberT, numberT], circleStruct.value)
);

// TODO: Clean up
function _Descart(): void {
    let c3 = pop() as Circle;
    let c2 = pop() as Circle;
    let c1 = pop() as Circle;
    pop();              // The function.
    let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    push(list);
}
const Descart = new FGCallNative("Descart", _Descart,
    new FunctionT(
        [circleStruct.value, circleStruct.value, circleStruct.value],
        new ListT(numberT),
    )
);

// TODO: Clean up
function _ComplexDescart(): void {
    let curv = pop() as FGNumber;
    let c3 = pop() as Circle;
    let c2 = pop() as Circle;
    let c1 = pop() as Circle;
    pop();              // The function.
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleStruct.value);
    push(circles);
}
const ComplexDescart = new FGCallNative("ComplexDescart", _ComplexDescart,
    new FunctionT(
        [circleStruct.value, circleStruct.value, circleStruct.value, numberT],
        new ListT(circleStruct.value),
    )
);

function _E(): void {
    let ry = (pop() as FGNumber).value;
    let rx = (pop() as FGNumber).value;
    let y  = (pop() as FGNumber).value;
    let x  = (pop() as FGNumber).value;
    pop();              // The function.
    let e = new Ellipse(x, y, rx, ry);
    push(e);
}
let E = new FGCallNative("E", _E,
    new FunctionT(
        [numberT, numberT, numberT, numberT],
        ellipseT,
    )
);

// Create a Point.
// TODO: Think about that pointStruct.value.
function _pt(): void {
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    push(new Point(x, y));
}
let pt = new FGCallNative("pt", _pt,
    new FunctionT(
        [numberT, numberT],
        pointStruct.value,
    )
);

function _rpt(): void {
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    push(new RichPoint(x, y));
}
let rpt = new FGCallNative("rpt", _rpt,
    new FunctionT(
        [numberT, numberT],
        richPointStruct.value,
    )
);

function _Paint(): void {
    let geo = pop() as GeoObj;
    let pic = pop() as Picture;
    pop();              // The function.
    pic.objs.push(geo);
    draw_onScreen();
}
let Paint = new FGCallNative("Paint", _Paint,
    new FunctionT([pictureT, geoT], nothingT)
);

function _Cw(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.cw());
}
let Cw = new FGCallNative("Cw", _Cw,
    new FunctionT([pictureT], pictureT)
);

function _Ccw(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.ccw());
}
let Ccw = new FGCallNative("Ccw", _Ccw,
    new FunctionT([pictureT], pictureT)
);

function _FlipH(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.fliph());
}
let FlipH = new FGCallNative("FlipH", _FlipH,
    new FunctionT([pictureT], pictureT)
);

function _FlipV(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.flipv());
}
let FlipV = new FGCallNative("FlipV", _FlipV,
    new FunctionT([pictureT], pictureT)
);

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

function _Quartet(): void {
    let s = pop() as Picture;
    let r = pop() as Picture;
    let q = pop() as Picture;
    let p = pop() as Picture;
    pop();              // The function.
    push(Picture.quartet(p, q, r, s));
}
let Quartet = new FGCallNative("Quartet", _Quartet,
    new FunctionT(
        [pictureT, pictureT, pictureT, pictureT],
        pictureT,
    )
);

function _Cycle(): void {
    let p = pop() as Picture;
    pop();              // The function.
    push(Picture.cycle(p));
}
let Cycle = new FGCallNative("Cycle", _Cycle,
    new FunctionT([pictureT], pictureT)
);

function _MapPic(): void {
    let target = pop() as Picture;
    let src = pop() as Picture;
    pop();              // The function.
    src.map_to(target);
    draw_onScreen();
}
let MapPic = new FGCallNative("MapPic", _MapPic,
    new FunctionT([pictureT, pictureT], nothingT)
);

function _Pic(): void {
    let w = (pop() as FGNumber).value;
    let h = (pop() as FGNumber).value;
    pop();              // The function.
    let pic = new Picture(w, h);
    push(pic);
}
let Pic = new FGCallNative("Pic", _Pic,
    new FunctionT([numberT, numberT], pictureT)
);

function _R(): void {
    let h = (pop() as FGNumber).value;
    let w = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let rect = new Rect(x, y, w, h);
    push(rect);
}
let R = new FGCallNative("R", _R,
    new FunctionT(
        [numberT, numberT, numberT, numberT],
        rectStruct.value,
    )
);

function _R_WithCenter(): void {
    let h = (pop() as FGNumber).value;
    let w = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let rect = new Rect(x-w/2, y-h/2, w, h);
    push(rect);
}
let R_WithCenter = new FGCallNative("R_WithCenter", _R_WithCenter,
    new FunctionT(
        [numberT, numberT, numberT, numberT],
        rectStruct.value,
    )
);

function _R_FromPoints(): void {
    let q = pop() as Point;
    let p = pop() as Point;
    pop();              // The function.
    let x = Math.min(p.x, q.x);
    let y = Math.min(p.y, q.y);
    let w = Math.abs(p.x - q.x);
    let h = Math.abs(p.y - q.y);
    let rect = new Rect(x, y, w, h);
    push(rect);
}
let R_FromPoints = new FGCallNative("R_FromPoints", _R_FromPoints,
    new FunctionT(
        [pointStruct.value, pointStruct.value],
        rectStruct.value,
    )
);

function _seg(): void {
    let y2 = (pop() as FGNumber).value;
    let x2 = (pop() as FGNumber).value;
    let y1 = (pop() as FGNumber).value;
    let x1 = (pop() as FGNumber).value;
    pop();              // The function.
    let seg = new Segment(x1, y1, x2, y2);
    push(seg);
}
let seg = new FGCallNative("seg", _seg,
    new FunctionT(
        [numberT, numberT, numberT, numberT],
        segmentT,
    )
);

function _Seg_FromPoints(): void {
    let q = pop() as Point;
    let p = pop() as Point;
    pop();              // The function.
    let seg = new Segment(p.x, p.y, q.x, q.y);
    push(seg);
}
let Seg_FromPoints = new FGCallNative("Seg.FromPoints", _Seg_FromPoints,
    new FunctionT(
        [pointStruct.value, pointStruct.value],
        segmentT,
    )
);

function _Midpoint(): void {
    let segment = pop() as Segment;
    pop();              // The function.
    let point = segment.midpoint();
    push(point);
}
let Midpoint = new FGCallNative("Midpoint", _Midpoint,
    new FunctionT([segmentT], pointStruct.value)
);

function _help(): void {
    pop();              // The function.
    vm_output( welcome );
}
let help = new FGCallNative("help",  _help,
    new FunctionT([], nothingT)
);

function _clear(): void {
    pop();              // The function.
    canvas.clear();
    on_scrn = [];
}
let clear = new FGCallNative("clear",  _clear,
    new FunctionT([], nothingT)
);

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

    "help":   { type: help.sig, value: help },
    "print":  { type: print.sig, value: print },
    "Push":   { type: Push.sig, value: Push },
    "RGB":    { type: RGB.sig, value: RGB },
    "printf": { type: printf.sig, value: printf },
    "show":   { type: show.sig, value: show },
    "label":  { type: label.sig, value: label },
    "padl":   { type: padl.sig, value: padl },
    "Type":   { type: TypeFn.sig, value: TypeFn },
    "draw":   { type: draw.sig, value: draw },
    "Fill":   { type: Fill.sig, value: Fill },
    "clear":  { type: clear.sig, value: clear },
    "Paint":  { type: Paint.sig, value: Paint },
    "circle": { type: circle.sig, value: circle, methods: {
        "FromPoints": { type: C_FromPoints.sig, value: C_FromPoints },
    }},
    "Ccurv":   { type: Ccurv.sig, value: Ccurv },
    "Descart": { type: Descart.sig, value: Descart },
    "ComplexDescart": { type: ComplexDescart.sig, value: ComplexDescart },
    "E":      { type: E.sig, value: E },
    "pt":     { type: pt.sig, value: pt },
    "rpt":    { type: rpt.sig, value: rpt },
    "Pic":    { type: Pic.sig, value: Pic },
    "Cw":     { type: Cw.sig, value: Cw },
    "Ccw":    { type: Ccw.sig, value: Ccw },
    "FlipH":  { type: FlipH.sig, value: FlipH },
    "FlipV":  { type: FlipV.sig, value: FlipV },
    // "Above":  { type: functionT, value: Above },
    // "Beside": { type: functionT, value: Beside },
    "Quartet": { type: Quartet.sig, value: Quartet },
    "Cycle":  { type: Cycle.sig, value: Cycle },
    "MapPic": { type: MapPic.sig, value: MapPic },
    "R":      { type: R.sig, value: R, methods: {
        "FromPoints": { type: R_FromPoints.sig, value: R_FromPoints },
        "WithCenter": { type: R_WithCenter.sig, value: R_WithCenter },
    }},
    "seg":    { type: seg.sig, value: seg, methods: {
        "FromPoints": { type: Seg_FromPoints.sig, value: Seg_FromPoints },
    }},
    "Midpoint": { type: Midpoint.sig, value: Midpoint },
    "Rect": { type: rectStruct.value, value: rectStruct },
    "Point": { type: pointStruct.value, value: pointStruct },
    "Circle": { type: circleStruct.value, value: circleStruct },
    "sqrt": { type: sqrt.sig, value: sqrt },
    "abs": { type: abs.sig, value: abs },
};
