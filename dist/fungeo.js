import { repl } from "./ui/repl.js";
import { compiler } from "./compiler.js";
import { vm } from "./vm.js";
repl.place(100, 400);
vm.init();
function main(source) {
    let result = compiler.compile(source);
    if (result.ok) {
        console.log(result.value.chunk.disassemble());
        let vmresult = vm.interpret(result.value);
        if (vmresult.success)
            repl.ok(vmresult.message);
        else
            repl.error(vmresult.message);
    }
    else {
        repl.error(result.error.message);
        console.log(result.error);
    }
}
repl.set_callback(main);
