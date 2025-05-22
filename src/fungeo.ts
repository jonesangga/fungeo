import repl from "./ui/repl.js"
import canvas from "./ui/canvas.js"
import { scanner } from "./scanner.js"
import { compiler } from "./compiler.js"
import { Chunk } from "./chunk.js"
import { vm } from "./vm.js"
import { FGFunction } from "./value.js"

repl.place(0, 400);
canvas.place(250, 0);

vm.init();

function main(source: string): void {
    let result = compiler.compile(source);

    if (result.ok) {
        console.log(result.value.chunk.disassemble());

        let vmresult = vm.interpret(result.value);
        if (vmresult.ok)
            repl.ok(vmresult.value);
        else {
            repl.error(vmresult.error.message);
            console.log(vmresult.error);
        }
    }
    else {
        repl.error(result.error.message);
        console.log(result.error);
    }
}

repl.set_callback(main);
