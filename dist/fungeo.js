import { __ } from "./common.js";
import "./ui/demo.js";
import repl from "./ui/repl.js";
import { defaultCanvas } from "./ui/canvas.js";
import { parse } from "./parser.js";
import { compile } from "./compile.js";
import { typecheck } from "./typechecker.js";
import { vm } from "./vm.js";
repl.place(50, 260);
defaultCanvas.place(650, 0);
vm.init();
function main(source) {
    const parseR = parse(source);
    if (!parseR.ok) {
        console.log(parseR.error);
        repl.error(parseR.error.message);
        return;
    }
    __(parseR.value.to_str(0));
    const typecheckR = typecheck(parseR.value);
    if (!typecheckR.ok) {
        console.log(typecheckR.error);
        repl.error(typecheckR.error.message);
        return;
    }
    const compileR = compile(parseR.value, typecheckR.value);
    if (!compileR.ok) {
        console.log(compileR.error);
        repl.error(compileR.error.message);
        return;
    }
    __(compileR.value.chunk.disassemble());
    const vmR = vm.interpret(compileR.value);
    if (vmR.ok)
        repl.ok(vmR.value);
    else {
        repl.error(vmR.error.message);
        console.log(vmR.error);
    }
}
repl.set_callback(main);
