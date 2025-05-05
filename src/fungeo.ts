import { repl } from "./ui/repl.js"
import { scanner } from "./scanner.js"
import { compiler } from "./compiler.js"
import { Chunk } from "./chunk.js"

repl.place(100, 100);

// let source = "a = 2\nprint a\nl = L 100 100 200 200; draw l";
// let source = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
// scanner.init(source);
// let result = scanner.all_string();
// let result = scanner.all();
// console.log(result);

let chunk = new Chunk("testing");
let source = "a = 2";
let compilerResult = compiler.compile(source, chunk);
// console.log(chunk.to_string());
console.log(chunk.debug());
// console.log(chunk);
