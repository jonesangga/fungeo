import { repl } from "./ui/repl.js"
import { TokenT, TokenTName, scanner } from "./scanner.js"

repl.place(100, 100);

let source = "a = 2\nprint a\nl = L 100 100 200 200; draw l";
scanner.init(source);
let result = scanner.all_string();
// let result = scanner.all();

console.log(result);
