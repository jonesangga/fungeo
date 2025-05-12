import { pop, push, vmoutput } from "./vm.js"
import { Kind, KindName, FGCallable, FGString } from "./value.js"

function _Print(n: number): void {
    let value = pop();
    vmoutput( value.to_str() + "\n" );
}
export let Print = new FGCallable(_Print, [
    {
        input:  [Kind.Any],
        output: Kind.Nothing,
    },
]);

function _Printf(n: number): void {
    let value = pop();
    vmoutput( value.to_str() );
}
export let Printf = new FGCallable(_Printf, [
    {
        input:  [Kind.Any],
        output: Kind.Nothing,
    },
]);

function _Show(n: number): void {
    let value = pop();
    push(new FGString( value.to_str() ));
}
export let Show = new FGCallable(_Show, [
    {
        input:  [Kind.Number],
        output: Kind.String,
    },
]);

function _Type(n: number): void {
    let value = pop();
    push(new FGString(KindName[value.kind]));
}
export let Type = new FGCallable(_Type, [
    {
        input:  [Kind.Any],
        output: Kind.String,
    },
]);
