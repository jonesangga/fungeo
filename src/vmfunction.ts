import { pop, push, vmoutput } from "./vm.js"
import { Kind, FGCallable } from "./value.js"

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
