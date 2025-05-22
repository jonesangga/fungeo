import { pop, push, vm_output } from "./vm.js"
import { Kind, type GeoObj, geoKind, KindName, FGCallable, FGNumber, FGString } from "./value.js"
import canvas from "./ui/canvas.js"
import Circle from "./geo/circle.js"
import Ellipse from "./geo/ellipse.js"
import Picture from "./geo/picture.js"
import Point from "./geo/point.js"
import Rect from "./geo/rect.js"
import Segment from "./geo/segment.js"

function _Print(n: number): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() + "\n" );
}
export let Print = new FGCallable("Print", _Print, [
    {
        input:  [Kind.Any],
        output: Kind.Nothing,
    },
]);

function _Printf(n: number): void {
    let value = pop();
    pop();              // The function.
    vm_output( value.to_str() );
}
export let Printf = new FGCallable("Printf", _Printf, [
    {
        input:  [Kind.Any],
        output: Kind.Nothing,
    },
]);

function _Show(n: number): void {
    let value = pop();
    pop();              // The function.
    push(new FGString( value.to_str() ));
}
export let Show = new FGCallable("Show", _Show, [
    {
        input:  [Kind.Number],
        output: Kind.String,
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
export let Padl = new FGCallable("Padl", _Padl, [
    {
        input:  [Kind.String, Kind.Number, Kind.String],
        output: Kind.String,
    },
]);

function _Type(n: number): void {
    let value = pop();
    pop();              // The function.
    push(new FGString(KindName[value.kind]));
}
export let Type = new FGCallable("Type", _Type, [
    {
        input:  [Kind.Any],
        output: Kind.String,
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
export let Draw = new FGCallable("Draw", _Draw, [
    {
        input:  [geoKind],
        output: Kind.Nothing,
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
export let C = new FGCallable("C", _C, [
    {
        input:  [Kind.Number, Kind.Number, Kind.Number],
        output: Kind.Circle,
    },
    {
        input:  [Kind.Point, Kind.Point],
        output: Kind.Circle,
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
export let E = new FGCallable("E", _E, [
    {
        input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
        output: Kind.Ellipse,
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
export let P = new FGCallable("P", _P, [
    {
        input:  [Kind.Number, Kind.Number],
        output: Kind.Point,
    },
]);

function _Paint(n: number): void {
    let geo = pop() as GeoObj;
    let pic = pop() as Picture;
    pop();              // The function.
    pic.objs.push(geo);
    draw_onScreen();
}
export let Paint = new FGCallable("Paint", _Paint, [
    {
        input:  [Kind.Picture, geoKind],
        output: Kind.Nothing,
    },
]);

function _Cw(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.cw());
}
export let Cw = new FGCallable("Cw", _Cw, [
    {
        input:  [Kind.Picture],
        output: Kind.Picture,
    },
]);

function _Ccw(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.ccw());
}
export let Ccw = new FGCallable("Ccw", _Ccw, [
    {
        input:  [Kind.Picture],
        output: Kind.Picture,
    },
]);

function _FlipH(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.fliph());
}
export let FlipH = new FGCallable("FlipH", _FlipH, [
    {
        input:  [Kind.Picture],
        output: Kind.Picture,
    },
]);

function _FlipV(n: number): void {
    let pic = pop() as Picture;
    pop();              // The function.
    push(pic.flipv());
}
export let FlipV = new FGCallable("FlipV", _FlipV, [
    {
        input:  [Kind.Picture],
        output: Kind.Picture,
    },
]);

function _Pic(n: number): void {
    let w = (pop() as FGNumber).value;
    let h = (pop() as FGNumber).value;
    pop();              // The function.
    let pic = new Picture(w, h);
    push(pic);
}
export let Pic = new FGCallable("Pic", _Pic, [
    {
        input:  [Kind.Number, Kind.Number],
        output: Kind.Picture,
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
export let R = new FGCallable("R", _R, [
    {
        input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
        output: Kind.Rect,
    },
    {
        input:  [Kind.Point, Kind.Point],
        output: Kind.Rect,
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
export let Seg = new FGCallable("Seg", _Seg, [
    {
        input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
        output: Kind.Segment,
    },
    {
        input:  [Kind.Point, Kind.Point],
        output: Kind.Segment,
    },
]);

function _Midpoint(n: number): void {
    let segment = pop() as Segment;
    pop();              // The function.
    let point = segment.midpoint();
    push(point);
}
export let Midpoint = new FGCallable("Midpoint", _Midpoint, [
    {
        input:  [Kind.Segment],
        output: Kind.Point,
    },
]);
