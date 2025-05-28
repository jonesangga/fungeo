import { pop, push, vm_output } from "./vm.js"
import { CallT, Kind, type GeoObj, geoKind, KindName, FGCallNative, FGNumber, FGString, FGList } from "./value.js"
import canvas from "./ui/canvas.js"
import Circle from "./geo/circle.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import Point from "./geo/point.js"
import Rect from "./geo/rect.js"
import Segment from "./geo/segment.js"
import { welcome } from "./data/help.js"
import { ListT, NumberT, CircleT, geoT, anyT, circleT, pointT, pictureT, rectT, ellipseT, segmentT, nothingT, stringT, booleanT, numberT } from "./type.js"

function _Print(n: number): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() + "\n" );
}
export let Print = new FGCallNative("Print", CallT.Function, _Print, [
    {
        input:  [anyT],
        output: nothingT,
    },
]);

function _Printf(n: number): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() );
}
export let Printf = new FGCallNative("Printf", CallT.Function, _Printf, [
    {
        input:  [anyT],
        output: nothingT,
    },
]);

function _Show(n: number): void {
    let value = pop();
    pop();              // The function.
    push(new FGString( value.to_str() ));
}
export let Show = new FGCallNative("Show", CallT.Function, _Show, [
    {
        input:  [numberT],
        output: stringT,
    },
]);

function _Padl(n: number): void {
    let filler = (pop() as FGString).value;
    let width = (pop() as FGNumber).value;
    let text = (pop() as FGString).value;
    pop();              // The function.

    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
export let Padl = new FGCallNative("Padl", CallT.Function, _Padl, [
    {
        input:  [stringT, numberT, stringT],
        output: stringT,
    },
]);

// TODO: Think about this again. We lose the type information because that is on table not on stack or on the value.
function _Type(n: number): void {
    let value = pop();
    pop();              // The function.
    push(new FGString(KindName[value.kind]));
}
export let Type = new FGCallNative("Type", CallT.Function, _Type, [
    {
        input:  [anyT],
        output: stringT,
    },
]);

let on_scrn: GeoObj[] = [];

function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
}

function _Draw(n: number): void {
    let v = pop() as GeoObj;
    pop();              // The function.
    on_scrn.push(v);
    draw_onScreen();
}
export let Draw = new FGCallNative("Draw", CallT.Function, _Draw, [
    {
        input:  [geoT],
        output: nothingT,
    },
]);

function _C(n: number): void {
    if (n === 0) {
        let r = (pop() as FGNumber).value;
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        let c = new Circle(x, y, r);
        push(c);
    } else {
        let q = pop() as Point;
        let p = pop() as Point;
        pop();              // The function.
        let r = Math.sqrt((q.x - p.x)**2 + (q.y - p.y)**2);
        let c = new Circle(p.x, p.y, r);
        push(c);
    }
}
export let C = new FGCallNative("C", CallT.Function, _C, [
    {
        input:  [numberT, numberT, numberT],
        output: circleT,
    },
    {
        input:  [pointT, pointT],
        output: circleT,
    },
]);

function _Ccurv(n: number): void {
    let bend = (pop() as FGNumber).value;
    let y = (pop() as FGNumber).value;
    let x = (pop() as FGNumber).value;
    pop();              // The function.
    let c = Circle.with_bend(x, y, bend);
    push(c);
}
export const Ccurv = new FGCallNative("Ccurv", CallT.Function, _Ccurv, [
    {
        input:  [numberT, numberT, numberT],
        output: circleT,
    },
]);

// TODO: Clean up
function _Descart(n: number): void {
    let c3 = pop() as Circle;
    let c2 = pop() as Circle;
    let c1 = pop() as Circle;
    pop();              // The function.
    let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    push(list);
}
export const Descart = new FGCallNative("Descart", CallT.Function, _Descart, [
    {
        input:  [circleT, circleT, circleT],
        output: new ListT(numberT),
    },
]);

// TODO: Clean up
function _ComplexDescart(n: number): void {
    let curv = pop() as FGNumber;
    let c3 = pop() as Circle;
    let c2 = pop() as Circle;
    let c1 = pop() as Circle;
    pop();              // The function.
    let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleT);
    push(circles);
}
export const ComplexDescart = new FGCallNative("ComplexDescart", CallT.Function, _ComplexDescart, [
    {
        input:  [circleT, circleT, circleT, numberT],
        output: new ListT(circleT),
    },
]);

function _E(n: number): void {
    let ry = (pop() as FGNumber).value;
    let rx = (pop() as FGNumber).value;
    let y  = (pop() as FGNumber).value;
    let x  = (pop() as FGNumber).value;
    pop();              // The function.
    let e = new Ellipse(x, y, rx, ry);
    push(e);
}
export let E = new FGCallNative("E", CallT.Function, _E, [
    {
        input:  [numberT, numberT, numberT, numberT],
        output: ellipseT,
    },
]);

function _P(n: number): void {
    if (n === 0) {
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        let point = new Point(x, y);
        push(point);
    }
}
export let P = new FGCallNative("P", CallT.Function, _P, [
    {
        input:  [numberT, numberT],
        output: pointT,
    },
]);

function _Paint(n: number): void {
    let geo = pop() as GeoObj;
    let pic = pop() as Picture;
    pop();              // The function.
    pic.objs.push(geo);
    draw_onScreen();
}
export let Paint = new FGCallNative("Paint", CallT.Function, _Paint, [
    {
        input:  [pictureT, geoT],
        output: nothingT,
    },
]);

function _Cw(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.cw());
}
export let Cw = new FGCallNative("Cw", CallT.Function, _Cw, [
    {
        input:  [pictureT],
        output: pictureT,
    },
]);

function _Ccw(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.ccw());
}
export let Ccw = new FGCallNative("Ccw", CallT.Function, _Ccw, [
    {
        input:  [pictureT],
        output: pictureT,
    },
]);

function _FlipH(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.fliph());
}
export let FlipH = new FGCallNative("FlipH", CallT.Function, _FlipH, [
    {
        input:  [pictureT],
        output: pictureT,
    },
]);

function _FlipV(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.flipv());
}
export let FlipV = new FGCallNative("FlipV", CallT.Function, _FlipV, [
    {
        input:  [pictureT],
        output: pictureT,
    },
]);

function _Above(n: number): void {
    if (n === 0) {
        let bottom = pop() as Picture;
        let top = pop() as Picture;
        pop();              // The function.
        push(Picture.above(1, 1, top, bottom));
    } else {
        let bottom = pop() as Picture;
        let top = pop() as Picture;
        let rbottom = (pop() as FGNumber).value;
        let rtop = (pop() as FGNumber).value;
        pop();              // The function.
        push(Picture.above(rtop, rbottom, top, bottom));
    }
}
export let Above = new FGCallNative("Above", CallT.Function, _Above, [
    {
        input:  [pictureT, pictureT],
        output: pictureT,
    },
    {
        input:  [numberT, numberT, pictureT, pictureT],
        output: pictureT,
    },
]);

function _Beside(n: number): void {
    if (n === 0) {
        let right = pop() as Picture;
        let left = pop() as Picture;
        pop();              // The function.
        push(Picture.beside(1, 1, left, right));
    } else {
        let right = pop() as Picture;
        let left = pop() as Picture;
        let rright = (pop() as FGNumber).value;
        let rleft = (pop() as FGNumber).value;
        pop();              // The function.
        push(Picture.beside(rleft, rright, left, right));
    }
}
export let Beside = new FGCallNative("Beside", CallT.Function, _Beside, [
    {
        input:  [pictureT, pictureT],
        output: pictureT
    },
    {
        input:  [numberT, numberT, pictureT, pictureT],
        output: pictureT,
    },
]);

function _Quartet(n: number): void {
    let s = pop() as Picture;
    let r = pop() as Picture;
    let q = pop() as Picture;
    let p = pop() as Picture;
    pop();              // The function.
    push(Picture.quartet(p, q, r, s));
}
export let Quartet = new FGCallNative("Quartet", CallT.Function, _Quartet, [
    {
        input:  [pictureT, pictureT, pictureT, pictureT],
        output: pictureT,
    },
]);

function _Cycle(n: number): void {
    let p = pop() as Picture;
    pop();              // The function.
    push(Picture.cycle(p));
}
export let Cycle = new FGCallNative("Cycle", CallT.Function, _Cycle, [
    {
        input:  [pictureT],
        output: pictureT,
    },
]);

function _MapPic(n: number): void {
    let target = pop() as Picture;
    let src = pop() as Picture;
    pop();              // The function.
    src.map_to(target);
    draw_onScreen();
}
export let MapPic = new FGCallNative("MapPic", CallT.Function, _MapPic, [
    {
        input:  [pictureT, pictureT],
        output: nothingT,
    },
]);

function _Pic(n: number): void {
    let w = (pop() as FGNumber).value;
    let h = (pop() as FGNumber).value;
    pop();              // The function.
    let pic = new Picture(w, h);
    push(pic);
}
export let Pic = new FGCallNative("Pic", CallT.Function, _Pic, [
    {
        input:  [numberT, numberT],
        output: pictureT,
    },
]);

function _R(n: number): void {
    if (n === 0) {
        let h = (pop() as FGNumber).value;
        let w = (pop() as FGNumber).value;
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        let rect = new Rect(x, y, w, h);
        push(rect);
    } else {
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
}
export let R = new FGCallNative("R", CallT.Function, _R, [
    {
        input:  [numberT, numberT, numberT, numberT],
        output: rectT,
    },
    {
        input:  [pointT, pointT],
        output: rectT,
    },
]);

function _Seg(n: number): void {
    if (n === 0) {
        let y2 = (pop() as FGNumber).value;
        let x2 = (pop() as FGNumber).value;
        let y1 = (pop() as FGNumber).value;
        let x1 = (pop() as FGNumber).value;
        pop();              // The function.
        let seg = new Segment(x1, y1, x2, y2);
        push(seg);
    } else {
        let q = pop() as Point;
        let p = pop() as Point;
        pop();              // The function.
        let seg = new Segment(p.x, p.y, q.x, q.y);
        push(seg);
    }
}
export let Seg = new FGCallNative("Seg", CallT.Function, _Seg, [
    {
        input:  [numberT, numberT, numberT, numberT],
        output: segmentT,
    },
    {
        input:  [pointT, pointT],
        output: segmentT,
    },
]);

function _Midpoint(n: number): void {
    let segment = pop() as Segment;
    pop();              // The function.
    let point = segment.midpoint();
    push(point);
}
export let Midpoint = new FGCallNative("Midpoint", CallT.Function, _Midpoint, [
    {
        input:  [segmentT],
        output: pointT,
    },
]);

function _Help(n: number): void {
    pop();              // The function.
    vm_output( welcome );
}
export let Help = new FGCallNative("Help", CallT.Procedure, _Help, [
    {
        input:  [],
        output: nothingT,
    },
]);

function _Clear(n: number): void {
    pop();              // The function.
    canvas.clear();
    on_scrn = [];
}
export let Clear = new FGCallNative("Clear", CallT.Procedure, _Clear, [
    {
        input:  [],
        output: nothingT,
    },
]);
