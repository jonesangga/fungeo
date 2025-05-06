import { repl } from "./ui/repl.js";
import { compiler } from "./compiler.js";
import { Chunk } from "./chunk.js";
repl.place(100, 100);
let chunk = new Chunk("testing");
let source = "";
source = "truth = !2";
let compilerResult = compiler.compile(source, chunk);
console.log(chunk.disassemble());
