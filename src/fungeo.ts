import { repl } from "./ui/repl.js"
import { scanner } from "./scanner.js"
import { compiler } from "./compiler.js"
import { Chunk } from "./chunk.js"
import { vm } from "./vm.js"

repl.place(100, 100);

// let source = "a = 2\nprint a\nl = L 100 100 200 200; draw l";
// let source = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
// scanner.init(source);
// let result = scanner.all_string();
// console.log(result);

let chunk = new Chunk("testing");
let source = "";
source = " a = 2 Print 2";
let compilerResult = compiler.compile(source, chunk);
console.log(chunk.disassemble());

vm.init();

function main(source: string): void {
    let chunk = new Chunk("program");
    let result = compiler.compile(source, chunk);

    if (result.success) {
        console.log(chunk.disassemble());
        let vmresult = vm.interpret(chunk);
        if (vmresult.success)
            repl.ok(vmresult.message)
        else
            repl.error(vmresult.message)
        // console.log(vmresult);
    }
    else {
        repl.error(result.message as string);
    }
}

repl.set_callback(main);
