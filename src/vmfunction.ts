import { pop, push, vmoutput } from "./vm.js"
import { Kind, GeoObj, KindName, FGCallable, FGNumber, FGString } from "./value.js"
import Segment from "./geo/segment.js"

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
    // canvas.clear();
    for (let obj of on_scrn) {
        if (obj.kind === Kind.Segment)
            obj.draw();
    }
}

function _Draw(n: number): void {
    let v = pop() as GeoObj;
    pop();              // The function.
    switch (v.kind) {
        case Kind.Segment:
            on_scrn.push(v);
            break;
        // default:
            // assertNever(v);
    }
    draw_onScreen();
}
export let Draw = new FGCallable("Draw", _Draw, [
    {
        input:  [Kind.Segment],
        output: Kind.Nothing,
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
    }
}
export let Seg = new FGCallable("Seg", _Seg, [
    {
        input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
        output: Kind.Segment,
    },
]);
