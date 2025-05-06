import { repl } from "./ui/repl.js"
import { scanner } from "./scanner.js"
import { compiler } from "./compiler.js"
import { Chunk } from "./chunk.js"

repl.place(100, 100);

// let source = "a = 2\nprint a\nl = L 100 100 200 200; draw l";
// let source = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
// scanner.init(source);
// let result = scanner.all_string();
// console.log(result);

let chunk = new Chunk("testing");
let source = "";
// source = "num = 12 / 34"; // binary
// source = "a = 1 * 2 + 3";
source = "a = -(\"real\")";
let compilerResult = compiler.compile(source, chunk);
console.log(chunk.disassemble());
