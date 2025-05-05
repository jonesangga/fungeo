import { repl } from "./ui/repl.js";
import { scanner } from "./scanner.js";
repl.place(100, 100);
let source = ` ! : := , $ = false [ ( - abc 123.456 + ] ) ; / * "real" true `;
scanner.init(source);
let result = scanner.all_string();
console.log(result);
