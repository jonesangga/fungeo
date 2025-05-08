import { pop, vmoutput } from "./vm.js";
import { FGCallable } from "./value.js";
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
