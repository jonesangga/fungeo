import { repl } from "./ui/repl.js";
import { compiler } from "./compiler.js";
import { vm } from "./vm.js";
repl.place(100, 400);
vm.init();
function main(source) {
    let result = compiler.compile(source);
    if (result.success) {
        console.log(result.result.chunk.disassemble());
        let vmresult = vm.interpret(result.result);
        if (vmresult.success)
            repl.ok(vmresult.message);
        else
            repl.error(vmresult.message);
    }
    else {
        repl.error(result.message);
    }
}
repl.set_callback(main);
