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
