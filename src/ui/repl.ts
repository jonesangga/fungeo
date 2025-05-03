// @jonesangga, 12-04-2025, MIT License.
//
//  container:  Contains three components below.
//  holder:     Drag it to move container.
//  input:      Textarea to input code.
//  output:     A small console for displaying the executed code output (if any),
//              and also error message. Hidden by default.

const container = document.createElement("div");
document.body.appendChild(container);
container.style.position   = "absolute";
container.style.display    = "flex";
container.style.top        = "0px";
container.style.left       = "0px";
container.style.background = "#ff0";

const holder = document.createElement("div");
container.appendChild(holder);
holder.style.position   = "unset";
holder.style.width      = "10px";
holder.style.height     = "20px";
holder.style.background = "#000";

const input = document.createElement("textarea");
container.appendChild(input);
input.focus();
input.cols = 20;
input.rows = 1;
input.wrap = "off";
input.style.position   = "unset";
input.style.minWidth   = "200px";
input.style.maxWidth   = "400px";
input.style.marginLeft = "5px";
input.style.padding    = "0px 5px";
input.style.border     = "1px solid #000";
input.style.background = "#eee";
input.style.overflow   = "hidden";

const output = document.createElement("pre");
container.appendChild(output);
output.style.position   = "absolute";
output.style.top        = "25px";
output.style.left       = "15px";
output.style.width      = "250px";
output.style.border     = "1px solid #000";
output.style.fontSize   = "11px";
output.style.textWrap   = "wrap";
output.style.visibility = "hidden";

const colorOk   = "#70d196"; // Soft green.
const colorFail = "#e85b5b"; // Soft red.
let offsetX = 0;
let offsetY = 0;
let history: string[] = [""];
let historyViewIdx    = 1;
let savedLine         = ""; // Save line when going to view history.

holder.addEventListener("mousedown", mousedown_cb); // Note: "mousedown" not fired multiple times when holding down.

function mousedown_cb(e: any): void {
    // We only support mouse left button.
    if (e.button === 0) {
        let b = container.getBoundingClientRect();
        offsetX = e.clientX - b.left;
        offsetY = e.clientY - b.top;
        window.addEventListener("mousemove", mousemove_cb);
        e.preventDefault();
    }
}

function mousemove_cb(e: any): void {
    if (e.buttons === 0) {
        window.removeEventListener("mousemove", mousemove_cb);
    } else {
        container.style.left = e.pageX - offsetX + "px";
        container.style.top  = e.pageY - offsetY + "px";
    }
}

input.addEventListener("input", input_resize);
input.addEventListener("keydown", input_binding);

function input_reset(): void {
    input.style.height = "auto"
    input.style.height = "1lh";
    input.style.width  = "210px"; // min-width + padding-left + padding-right.
    output.style.top   = "calc(1lh + " + 10 + "px)";
}

function input_resize(): void {
    input.style.height = "auto"
    input.style.height = input.scrollHeight + "px";
    input.style.width  = "auto"
    input.style.width  = input.scrollWidth + "px";
    output.style.top   = input.scrollHeight + 10 + "px";
}
input_resize();

function input_binding(e: any): void {
    if (!e.shiftKey) return;

    if (e.key === "ArrowUp" && !e.repeat) {
        if (historyViewIdx > 1) {
            if (historyViewIdx === history.length) {
                savedLine = input.value;
            }
            historyViewIdx--;
            input.value = history[historyViewIdx];
            input_resize();
        }
        e.preventDefault(); // To prevent cursor moves to beginning of text.
    }
    else if (e.key === "ArrowDown" && !e.repeat) {
        if (historyViewIdx < history.length - 1) {
            historyViewIdx++;
            input.value = history[historyViewIdx];
        } else if (historyViewIdx === history.length - 1) {
            historyViewIdx++;
            input.value = savedLine;
        }
        input_resize(); // To prevent cursor moves to end of text.

    }
    else if (e.key === "Enter" && !e.repeat) {
        let source = input.value.trim();
        if (source !== "") {
            input.value = "";

            // For testing. Delete later.
            if (source.length < 5)
                repl.error("too small alkja a la aj ak a aj aj lajflkajfajelajelakf awej aejfa lejf");
            else
                repl.ok("nice");
            // main(source);

            if (history[history.length - 1] !== source) {
                history.push(source);
            }
            // replHistory.add(source);
            historyViewIdx = history.length;
            input_reset();
        }
        e.preventDefault();
    }
}


const repl = {
    place(x: number, y: number): void {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        container.style.left = x + "px";
        container.style.top  = y + "px";
    },

    ok(message: string): void {
        holder.style.background = colorOk;
        if (message === "") {
            output.style.visibility  = "hidden";
        } else {
            output.style.visibility  = "visible";
            output.style.borderColor = colorOk;
            output.innerHTML = message;
        }
    },
 
    error(message: string): void {
        holder.style.background  = colorFail;
        output.style.visibility  = "visible";
        output.style.borderColor = colorFail;
        output.innerHTML = message;
    }
}

export { repl };
