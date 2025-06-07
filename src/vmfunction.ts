import { pop, push, vm_output, call, run } from "./vm.js"
import { CallT, type GeoObj, type Fillable, FGCallNative, FGCallUser, FGCurry, FGNumber, FGString, FGList } from "./value.js"
import { FGColor } from "./literal/color.js"
import canvas from "./ui/canvas.js"
import Circle from "./geo/circle.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import Point from "./geo/point.js"
import Rect from "./geo/rect.js"
import { rectStruct } from "./geo/rect.js"
import { pointStruct } from "./geo/point.js"
import { circleStruct } from "./geo/circle.js"
import Segment from "./geo/segment.js"
import { welcome } from "./data/help.js"
import { ListT, UnionT, anyT, pictureT,
         ellipseT, segmentT, nothingT, stringT, numberT,
         colorT, CallNativeT, NothingT, AnyT } from "./literal/type.js"

const geoUnion = new UnionT([ellipseT, pictureT, pointStruct.value, rectStruct.value, segmentT, circleStruct.value]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, pictureT, pointStruct.value, rectStruct.value, segmentT, circleStruct.value, geoList]);
const fillableT = new UnionT([circleStruct.value, ellipseT, rectStruct.value]);

function _Print(): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() + "\n" );
}
export let Print = new FGCallNative("Print", CallT.Function, _Print,
    [anyT],
    nothingT,
);
export const PrintT = new CallNativeT(
    [new AnyT()],
    new NothingT()
);

function _Printf(): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() );
}
export let Printf = new FGCallNative("Printf", CallT.Function, _Printf,
    [anyT],
    nothingT,
);

function _Sqrt(): void {
    let value = pop() as FGNumber;
    pop();              // The function.
    push(new FGNumber( Math.sqrt(value.value) ));
}
export let Sqrt = new FGCallNative("Sqrt", CallT.Function, _Sqrt,
    [numberT],
    numberT,
);

function _Abs(): void {
    let value = pop() as FGNumber;
    pop();              // The function.
    push(new FGNumber( Math.abs(value.value) ));
}
export let Abs = new FGCallNative("Abs", CallT.Function, _Abs,
    [numberT],
    numberT,
);

function _Show(): void {
    let value = pop();
    pop();              // The function.
    push(new FGString( value.to_str() ));
}
export let Show = new FGCallNative("Show", CallT.Function, _Show,
    [numberT],
    stringT,
);

function _Padl(): void {
    let filler = (pop() as FGString).value;
    let width = (pop() as FGNumber).value;
    let text = (pop() as FGString).value;
    pop();              // The function.

    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
export let Padl = new FGCallNative("Padl", CallT.Function, _Padl,
    [stringT, numberT, stringT],
    stringT,
);

function _RGB(): void {
    let b = (pop() as FGNumber).value;
    let g = (pop() as FGNumber).value;
    let r = (pop() as FGNumber).value;
    pop();              // The function.
    push(new FGColor(r, g, b));
}
export let RGB = new FGCallNative("RGB", CallT.Function, _RGB,
    [numberT, numberT, numberT],
    colorT,
);

// TODO: Think about this again. We lose the type information because that is on table not on stack or on the value.
function _Type(): void {
    let value = pop();
    pop();              // The function.
    push((value as FGCallNative).typeof());
}
export let Type = new FGCallNative("Type", CallT.Function, _Type,
    [anyT],
    stringT,
);

// TODO: not type safe, change to use generic.
function _Push(): void {
    let el = pop();
    let list = pop() as FGList;
    pop();              // The function.
    list.value.push(el);
}
export let Push = new FGCallNative("Push", CallT.Function, _Push,
    [new ListT(anyT), anyT],
    nothingT,
);

function _Map(): void {
    console.log("in _Map()");
    let list = pop() as FGList;
    let callback = pop();
    console.log(list, callback);
    pop();              // The function.
    if (callback instanceof FGCallNative) {
        console.log("callback is FGCallNative");
        let result = [];
        for (let i = 0; i < list.value.length; i++) {
            push(list.value[i]);    // dummy
            push(list.value[i]);
            callback.value();
            result.push(pop());
        }
        push(new FGList(result, callback.output));
    } else if (callback instanceof FGCallUser) {
        console.log("callback is FGCallUser");
        let result = [];
        for (let i = 0; i < list.value.length; i++) {
            push(list.value[i]);    // dummy
            push(list.value[i]);
            call(callback, callback.input.length);
            run(true);
            result.push(pop());
        }
        push(new FGList(result, callback.output));
    } else if (callback instanceof FGCurry) {
        console.log("callback is FGCurry");
        let result = [];
        for (let i = 0; i < list.value.length; i++) {
            push(list.value[i]);    // dummy
            for (let j = 0; j < callback.args.length; j++)
                push(callback.args[j]);
            push(list.value[i]);
            call(callback.fn as unknown as FGCallUser, callback.fn.input.length);
            run(true);
            result.push(pop());
        }
        push(new FGList(result, callback.fn.output));
    }
}
export let Map = new FGCallNative("Map", CallT.Function, _Map,
    [anyT, new ListT(anyT)],
    new ListT(anyT),
);

let on_scrn: GeoObj[] = [];

function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
}

function _Draw(): void {
    let v = pop();
    pop();              // The function.
    if (v instanceof FGList) {
        for (let i of v.value) {
            on_scrn.push(i as GeoObj);
        }
    }
    else {
        on_scrn.push(v as GeoObj);
    }
    draw_onScreen();
}
export let Draw = new FGCallNative("Draw", CallT.Function, _Draw,
    [geoT],
    nothingT,
);

function _Fill(): void {
    console.log("in _Fill()");
    let v = pop() as Fillable;
    let color = pop() as FGColor;
    pop();              // The function.
    v.fillStyle = color.to_hex();
    draw_onScreen();
}
export let Fill = new FGCallNative("Fill", CallT.Function, _Fill,
    [colorT, fillableT],
    nothingT,
);

function _C(): void {
    let r = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let c = new Circle(x, y, r);
    push(c);
}
export let C = new FGCallNative("C", CallT.Function, _C,
    [numberT, numberT, numberT],
    circleStruct.value,
);

function _C_FromPoints(): void {
    let q = pop() as Point;
    let p = pop() as Point;
    pop();              // The function.
    let r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
    let c = new Circle(p.x, p.y, r);
    push(c);
}
export let C_FromPoints = new FGCallNative("C_FromPoints", CallT.Function, _C_FromPoints,
    [pointStruct.value, pointStruct.value],
    circleStruct.value,
);

function _Ccurv(): void {
    let bend = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
export const Ccurv = new FGCallNative("Ccurv", CallT.Function, _Ccurv,
    [numberT, numberT, numberT],
    circleStruct.value,
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
export const Descart = new FGCallNative("Descart", CallT.Function, _Descart,
    [circleStruct.value, circleStruct.value, circleStruct.value],
    new ListT(numberT),
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
export const ComplexDescart = new FGCallNative("ComplexDescart", CallT.Function, _ComplexDescart,
    [circleStruct.value, circleStruct.value, circleStruct.value, numberT],
    new ListT(circleStruct.value),
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
export let E = new FGCallNative("E", CallT.Function, _E,
    [numberT, numberT, numberT, numberT],
    ellipseT,
);

function _P(): void {
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let point = new Point(x, y);
    push(point);
}
export let P = new FGCallNative("P", CallT.Function, _P,
    [numberT, numberT],
    pointStruct.value,
);

function _Paint(): void {
    let geo = pop() as GeoObj;
    let pic = pop() as Picture;
    pop();              // The function.
    pic.objs.push(geo);
    draw_onScreen();
}
export let Paint = new FGCallNative("Paint", CallT.Function, _Paint,
    [pictureT, geoT],
    nothingT,
);

function _Cw(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.cw());
}
export let Cw = new FGCallNative("Cw", CallT.Function, _Cw,
    [pictureT],
    pictureT,
);

function _Ccw(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.ccw());
}
export let Ccw = new FGCallNative("Ccw", CallT.Function, _Ccw,
    [pictureT],
    pictureT,
);

function _FlipH(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.fliph());
}
export let FlipH = new FGCallNative("FlipH", CallT.Function, _FlipH,
    [pictureT],
    pictureT,
);

function _FlipV(): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.flipv());
}
export let FlipV = new FGCallNative("FlipV", CallT.Function, _FlipV,
    [pictureT],
    pictureT,
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
// export let Above = new FGCallNative("Above", CallT.Function, _Above, [
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
// export let Beside = new FGCallNative("Beside", CallT.Function, _Beside, [
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
export let Quartet = new FGCallNative("Quartet", CallT.Function, _Quartet,
    [pictureT, pictureT, pictureT, pictureT],
    pictureT,
);

function _Cycle(): void {
    let p = pop() as Picture;
    pop();              // The function.
    push(Picture.cycle(p));
}
export let Cycle = new FGCallNative("Cycle", CallT.Function, _Cycle,
    [pictureT],
    pictureT,
);

function _MapPic(): void {
    let target = pop() as Picture;
    let src = pop() as Picture;
    pop();              // The function.
    src.map_to(target);
    draw_onScreen();
}
export let MapPic = new FGCallNative("MapPic", CallT.Function, _MapPic,
    [pictureT, pictureT],
    nothingT,
);

function _Pic(): void {
    let w = (pop() as FGNumber).value;
    let h = (pop() as FGNumber).value;
    pop();              // The function.
    let pic = new Picture(w, h);
    push(pic);
}
export let Pic = new FGCallNative("Pic", CallT.Function, _Pic,
    [numberT, numberT],
    pictureT,
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
export let R = new FGCallNative("R", CallT.Function, _R,
    [numberT, numberT, numberT, numberT],
    // rectT,
    rectStruct.value,
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
export let R_WithCenter = new FGCallNative("R_WithCenter", CallT.Function, _R_WithCenter,
    [numberT, numberT, numberT, numberT],
    // rectT,
    rectStruct.value,
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
export let R_FromPoints = new FGCallNative("R_FromPoints", CallT.Function, _R_FromPoints,
    [pointStruct.value, pointStruct.value],
    // rectT,
    rectStruct.value,
);

function _Seg(): void {
    let y2 = (pop() as FGNumber).value;
    let x2 = (pop() as FGNumber).value;
    let y1 = (pop() as FGNumber).value;
    let x1 = (pop() as FGNumber).value;
    pop();              // The function.
    let seg = new Segment(x1, y1, x2, y2);
    push(seg);
}
export let Seg = new FGCallNative("Seg", CallT.Function, _Seg,
    [numberT, numberT, numberT, numberT],
    segmentT,
);

function _Seg_FromPoints(): void {
    let q = pop() as Point;
    let p = pop() as Point;
    pop();              // The function.
    let seg = new Segment(p.x, p.y, q.x, q.y);
    push(seg);
}
export let Seg_FromPoints = new FGCallNative("Seg.FromPoints", CallT.Function, _Seg_FromPoints,
    [pointStruct.value, pointStruct.value],
    segmentT,
);

function _Midpoint(): void {
    let segment = pop() as Segment;
    pop();              // The function.
    let point = segment.midpoint();
    push(point);
}
export let Midpoint = new FGCallNative("Midpoint", CallT.Function, _Midpoint,
    [segmentT],
    pointStruct.value,
);

function _Help(): void {
    pop();              // The function.
    vm_output( welcome );
}
export let Help = new FGCallNative("Help", CallT.Procedure, _Help,
    [],
    nothingT,
);

function _Clear(): void {
    pop();              // The function.
    canvas.clear();
    on_scrn = [];
}
export let Clear = new FGCallNative("Clear", CallT.Procedure, _Clear,
    [],
    nothingT,
);
