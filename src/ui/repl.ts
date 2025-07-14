// @jonesangga, 12-04-2025, MIT License.
//
// This module contains 2 main things: controller and terminal.
// Controller contains 3 things: buttonArea, inputArea, and resultArea.
//   buttonArea:
//     dragBtn:  Drag it to move the controller.
//     plusBtn:  Increase UI font size.
//     minusBtn: Decrease UI font size.
//     termBtn:  Toggle terminal.
//   inputArea:  Place to input code.
//   resultArea: When terminal is hidden, displays the output or error message of the last executed code.
// Terminal contains all histories, outputs and errors. Hidden by default.

import { welcome } from "../data/help.js";
import { showDemoSelect, toggleDemo } from "./demo.js";

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
body {
    font-family: monospace;
    font-size: 16px;
}
textarea {
    margin-top: 10px;
    min-width:  300px;
    max-width:  600px;
    background: #eee;
    border:     1px solid #000;
    overflow:   hidden;
    font-size:  inherit;
}
button {
    font-size:    inherit;
    font-family:  inherit;
    margin-right: 10px;
}`);

document.adoptedStyleSheets.push(sheet);

let fontSize = 16; // For all font in UI.

const controller = document.createElement("div");
document.body.appendChild(controller);
controller.style.position      = "absolute";
controller.style.top           = "0px";
controller.style.left          = "0px";
controller.style.display       = "flex";
controller.style.flexDirection = "column";
controller.style.zIndex        = "999";

const buttonArea = document.createElement("div");
controller.appendChild(buttonArea);

const colorOk = "#caf8dc"; // Soft green.
const colorError = "#fee"; // Soft red.
let offsetX = 0;
let offsetY = 0;
let history: { code: string, output?: string }[] = [{ code: "" }];
let historyViewIdx = 1;
let savedCode = "";     // Save line before starting to view history.

//--------------------------------------------------------------------
// Drag buttons to move repl.

const dragBtn = document.createElement("button");
buttonArea.appendChild(dragBtn);
dragBtn.innerHTML = "drag";

dragBtn.addEventListener("mousedown", drag_btn_cb); // Note: "mousedown" is not fired multiple times when holding down.

// Only handle mouse left button.
function drag_btn_cb(e: any): void {
    if (e.button === 0) {
        let b = controller.getBoundingClientRect();
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
        controller.style.left = e.pageX - offsetX + "px";
        controller.style.top  = e.pageY - offsetY + "px";
    }
}

//--------------------------------------------------------------------
// +/- buttons to increase/decrease font size.

const minusBtn = document.createElement("button");
buttonArea.appendChild(minusBtn);
minusBtn.innerHTML = "-";

const plusBtn = document.createElement("button");
buttonArea.appendChild(plusBtn);
plusBtn.innerHTML = "+";

minusBtn.addEventListener("mousedown", minus_btn_cb);
plusBtn.addEventListener("mousedown", plus_btn_cb);

function minus_btn_cb(): void {
    if (fontSize <= 10) return;
    fontSize--;
    update_font_size();
}

function plus_btn_cb(): void {
    if (fontSize >= 30) return;
    fontSize++;
    update_font_size();
}

function update_font_size() {
    terminal.style.fontSize = fontSize + "px";
    buttonArea.style.fontSize = fontSize + "px";
    inputArea.style.fontSize   = fontSize + "px";
    input_area_resize();
}

//--------------------------------------------------------------------
// Input Area.

const inputArea = document.createElement("textarea");
controller.appendChild(inputArea);
inputArea.cols = 20;
inputArea.rows = 1;
inputArea.wrap = "off";
inputArea.focus();

inputArea.addEventListener("input", input_area_resize);
inputArea.addEventListener("keydown", input_area_binding);

function input_area_resize(): void {
    inputArea.style.height = "auto"
    inputArea.style.height = inputArea.scrollHeight + "px";
    inputArea.style.width  = "auto"
    inputArea.style.width  = inputArea.scrollWidth + "px";
}
input_area_resize();

function input_area_binding(e: any): void {
    if (!e.shiftKey) return;    // Since all supported bindings include Shift key.

    if (e.key === "ArrowUp" && !e.repeat) {
        e.preventDefault();                 // To prevent cursor moving to beginning of text.
        if (historyViewIdx <= 1) return;    // We are at the top of history.

        // Save the code that user currently write before starting viewing the history.
        if (historyViewIdx === history.length)
            savedCode = inputArea.value;

        historyViewIdx--;
        inputArea.value = history[historyViewIdx].code;
        input_area_resize();
    }
    else if (e.key === "ArrowDown" && !e.repeat) {
        e.preventDefault();                             // To prevent cursor moving to end of text.
        if (historyViewIdx >= history.length) return;   // We are at the bottom of history.

        if (historyViewIdx === history.length - 1) {
            historyViewIdx++;
            inputArea.value = savedCode;    // Put back the saved code.
        } else {
            historyViewIdx++;
            inputArea.value = history[historyViewIdx].code;
        }
        input_area_resize();
    }
    else if (e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        let source = inputArea.value.trim();
        if (source === "") return;

        inputArea.value = "";
        input_area_resize();

        if (history[history.length - 1].code !== source)
            history.push({ code: source });

        historyViewIdx = history.length;
        terminal_push(source);

        repl.callback(source);
        terminal_update();
    }
}

//--------------------------------------------------------------------
// Output Area for displaying program's output or error message
// when terminal is not shown.

const resultArea = document.createElement("pre");
controller.appendChild(resultArea);
resultArea.style.marginTop  = "10px";
resultArea.style.border     = "1px solid #000";
resultArea.style.textWrap   = "wrap";
resultArea.style.background = "#eee";
resultArea.style.visibility = "hidden";

//--------------------------------------------------------------------
// Termninal

const termBtn = document.createElement("button");
buttonArea.appendChild(termBtn);
termBtn.innerHTML = "terminal";

termBtn.addEventListener("mousedown", term_btn_cb);

function term_btn_cb(): void {
    resultArea.style.visibility = "hidden";
    if (showTerminal) {
        terminal.style.visibility = "hidden";
        termBtn.style.border = "revert";
    }
    else {
        terminal.style.visibility = "visible";
        termBtn.style.border = "4px solid #000";
    }
    showTerminal = !showTerminal;
}

let showTerminal = true;

const terminal = document.createElement("div");
document.body.appendChild(terminal);
terminal.style.position   = "absolute";
terminal.style.top        = "0px";
terminal.style.left       = "0px";
terminal.style.width      = "600px";
terminal.style.height     = "100vh";
terminal.style.border     = "1px solid #000";
terminal.style.background = "#eee";
terminal.style.overflow   = "auto";
terminal.style.whiteSpace = "pre";
terminal.style.visibility = showTerminal ? "visible" : "hidden";

function terminal_update(): void {
    terminal.scrollTop = terminal.scrollHeight;
}

function terminal_push(text: string, bg?: string): void {
    const div = document.createElement("div");
    terminal.appendChild(div);
    div.innerHTML = text;
    div.style.borderBottom = "1px solid #000";

    if (typeof bg !== "undefined")
        div.style.background = bg;
}

terminal_push(welcome, colorOk);

//--------------------------------------------------------------------
// Demo.

const demoBtn = document.createElement("button");
buttonArea.appendChild(demoBtn);
demoBtn.innerHTML = "demo";

demoBtn.addEventListener("mousedown", demo_btn_cb);

function demo_btn_cb(): void {
    if (showDemoSelect)
        demoBtn.style.border = "revert";
    else
        demoBtn.style.border = "4px solid #000";
    toggleDemo();
}

//--------------------------------------------------------------------

const repl = {
    reset(): void {
        history = [{ code: "" }];
        historyViewIdx     = 1;
        savedCode          = ""; // Save line when going to view history.
        terminal.innerHTML = "";
    },

    to_str(): string {
        return "repl";
    },

    // This is a default callback. Used only for testing.
    // You should set your own callback using set_callback() below.

    callback(source: string): void {
        console.log(source);
        if (source === "") {
            resultArea.style.visibility = "hidden";
        } else if (source.length <= 5) {
            this.ok("ok: source length is " + source.length);
        } else {
            this.error("error: source length is " + source.length);
        }
    },

    set_callback(fn: (source: string) => void): void {
        this.callback = fn;
    },

    // This is only for testing using input and output files.
    from_script(source: string): void {
        source = source.trim();
        if (source === "") return;

        inputArea.value = "";
        input_area_resize();

        if (history[history.length - 1].code !== source)
            history.push({ code: source });

        historyViewIdx = history.length;
        terminal_push(source);

        this.callback(source);
        terminal_update();
    },

    place(x: number, y: number): void {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        controller.style.left = x + "px";
        controller.style.top  = y + "px";
    },

    ok(message: string): void {
        if (message === "") return;
        terminal_push(message, colorOk);
        history[history.length - 1].output = message;

        if (!showTerminal) {
            resultArea.style.visibility = "visible";
            resultArea.style.background = colorOk;
            resultArea.innerHTML        = message;
        }
    },
 
    error(message: string): void {
        terminal_push(message, colorError);
        history[history.length - 1].output = message;

        if (!showTerminal) {
            resultArea.style.visibility = "visible";
            resultArea.style.background = colorError;
            resultArea.innerHTML        = message;
        }
    }
}

export default repl;
