import { pop, push, vmoutput } from "./vm.js";
import { KindName, FGCallable, FGString } from "./value.js";
function _Print(n) {
    let value = pop();
    vmoutput(value.to_str() + "\n");
}
export let Print = new FGCallable(_Print, [
    {
        input: [200],
        output: 100,
    },
]);
function _Printf(n) {
    let value = pop();
    vmoutput(value.to_str());
}
export let Printf = new FGCallable(_Printf, [
    {
        input: [200],
        output: 100,
    },
]);
function _Show(n) {
    let value = pop();
    push(new FGString(value.to_str()));
}
export let Show = new FGCallable(_Show, [
    {
        input: [500],
        output: 600,
    },
]);
function _Padl(n) {
    let filler = pop().value;
    let width = pop().value;
    let text = pop().value;
    let result = (filler.repeat(width) + text).slice(-width);
    push(new FGString(result));
}
export let Padl = new FGCallable(_Padl, [
    {
        input: [600, 500, 600],
        output: 600,
    },
]);
function _Type(n) {
    let value = pop();
    push(new FGString(KindName[value.kind]));
}
export let Type = new FGCallable(_Type, [
    {
        input: [200],
        output: 600,
    },
]);
