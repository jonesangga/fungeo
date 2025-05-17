import { repl } from "./ui/repl.js"
import { scanner } from "./scanner.js"
import { compiler } from "./compiler.js"
import { Chunk } from "./chunk.js"
import { vm } from "./vm.js"
import { FGFunction } from "./value.js"

repl.place(100, 400);

vm.init();

function main(source: string): void {
    let result = compiler.compile(source);

    if (result.ok) {
        console.log(result.value.chunk.disassemble());
        let vmresult = vm.interpret(result.value);
        if (vmresult.success)
            repl.ok(vmresult.message)
        else
            repl.error(vmresult.message)
    }
    else {
        repl.error(result.error.message);
    }
}

repl.set_callback(main);
