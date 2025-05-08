import { repl } from "./ui/repl.js";
import { compiler } from "./compiler.js";
import { Chunk } from "./chunk.js";
import { vm } from "./vm.js";
repl.place(100, 100);
let chunk = new Chunk("testing");
let source = "";
source = " a = 2 Print 2";
let compilerResult = compiler.compile(source, chunk);
console.log(chunk.disassemble());
vm.init();
function main(source) {
    let chunk = new Chunk("program");
    let result = compiler.compile(source, chunk);
    if (result.success) {
        console.log(chunk.disassemble());
        let vmresult = vm.interpret(chunk);
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
