import { pop, push, vmoutput } from "./vm.js"
import { Kind, type GeoObj, geoKind, KindName, FGCallable, FGNumber, FGString } from "./value.js"
import Point from "./geo/point.js"
import Segment from "./geo/segment.js"
import { canvas } from "./ui/canvas.js"

function _Print(n: number): void {
    let value = pop();
    pop();              // The function.
    vmoutput( value.to_str() + "\n" );
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
    vmoutput( value.to_str() );
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

function _P(n: number): void {
    if (n === 0) {
        let y = (pop() as FGNumber).value;
        let x = (pop() as FGNumber).value;
        pop();              // The function.
        let point = new Point(x, y);
        console.log(point);
        push(point);
    }
}
export let P = new FGCallable("P", _P, [
    {
        input:  [Kind.Number, Kind.Number],
        output: Kind.Point,
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
