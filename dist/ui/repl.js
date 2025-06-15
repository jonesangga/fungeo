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
let fontSize = 16;
const controller = document.createElement("div");
document.body.appendChild(controller);
controller.style.position = "absolute";
controller.style.top = "0px";
controller.style.left = "0px";
controller.style.display = "flex";
controller.style.flexDirection = "column";
controller.style.zIndex = "999";
const buttonArea = document.createElement("div");
controller.appendChild(buttonArea);
const colorOk = "#caf8dc";
const colorError = "#fee";
let offsetX = 0;
let offsetY = 0;
let history = [{ code: "" }];
let historyViewIdx = 1;
let savedCode = "";
const dragBtn = document.createElement("button");
buttonArea.appendChild(dragBtn);
dragBtn.innerHTML = "drag";
dragBtn.addEventListener("mousedown", drag_btn_cb);
function drag_btn_cb(e) {
    if (e.button === 0) {
        let b = controller.getBoundingClientRect();
        offsetX = e.clientX - b.left;
        offsetY = e.clientY - b.top;
        window.addEventListener("mousemove", mousemove_cb);
        e.preventDefault();
    }
}
function mousemove_cb(e) {
    if (e.buttons === 0) {
        window.removeEventListener("mousemove", mousemove_cb);
    }
    else {
        controller.style.left = e.pageX - offsetX + "px";
        controller.style.top = e.pageY - offsetY + "px";
    }
}
const minusBtn = document.createElement("button");
buttonArea.appendChild(minusBtn);
minusBtn.innerHTML = "-";
const plusBtn = document.createElement("button");
buttonArea.appendChild(plusBtn);
plusBtn.innerHTML = "+";
minusBtn.addEventListener("mousedown", minus_btn_cb);
plusBtn.addEventListener("mousedown", plus_btn_cb);
function minus_btn_cb() {
    if (fontSize <= 10)
        return;
    fontSize--;
    update_font_size();
}
function plus_btn_cb() {
    if (fontSize >= 30)
        return;
    fontSize++;
    update_font_size();
}
function update_font_size() {
    terminal.style.fontSize = fontSize + "px";
    buttonArea.style.fontSize = fontSize + "px";
    inputArea.style.fontSize = fontSize + "px";
    input_area_resize();
}
const inputArea = document.createElement("textarea");
controller.appendChild(inputArea);
inputArea.cols = 20;
inputArea.rows = 1;
inputArea.wrap = "off";
inputArea.focus();
inputArea.addEventListener("input", input_area_resize);
inputArea.addEventListener("keydown", input_area_binding);
function input_area_resize() {
    inputArea.style.height = "auto";
    inputArea.style.height = inputArea.scrollHeight + "px";
    inputArea.style.width = "auto";
    inputArea.style.width = inputArea.scrollWidth + "px";
}
input_area_resize();
function input_area_binding(e) {
    if (!e.shiftKey)
        return;
    if (e.key === "ArrowUp" && !e.repeat) {
        e.preventDefault();
        if (historyViewIdx <= 1)
            return;
        if (historyViewIdx === history.length)
            savedCode = inputArea.value;
        historyViewIdx--;
        inputArea.value = history[historyViewIdx].code;
        input_area_resize();
    }
    else if (e.key === "ArrowDown" && !e.repeat) {
        e.preventDefault();
        if (historyViewIdx >= history.length)
            return;
        if (historyViewIdx === history.length - 1) {
            historyViewIdx++;
            inputArea.value = savedCode;
        }
        else {
            historyViewIdx++;
            inputArea.value = history[historyViewIdx].code;
        }
        input_area_resize();
    }
    else if (e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        let source = inputArea.value.trim();
        if (source === "")
            return;
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
const resultArea = document.createElement("pre");
controller.appendChild(resultArea);
resultArea.style.marginTop = "10px";
resultArea.style.border = "1px solid #000";
resultArea.style.textWrap = "wrap";
resultArea.style.background = "#eee";
resultArea.style.visibility = "hidden";
const termBtn = document.createElement("button");
buttonArea.appendChild(termBtn);
termBtn.innerHTML = "terminal";
termBtn.addEventListener("mousedown", term_btn_cb);
function term_btn_cb() {
    resultArea.style.visibility = "hidden";
    terminal.style.visibility = showTerminal ? "hidden" : "visible";
    showTerminal = !showTerminal;
}
const terminal = document.createElement("div");
document.body.appendChild(terminal);
terminal.style.position = "absolute";
terminal.style.top = "0px";
terminal.style.left = "0px";
terminal.style.width = "600px";
terminal.style.height = "100vh";
terminal.style.border = "1px solid #000";
terminal.style.background = "#eee";
terminal.style.overflow = "auto";
terminal.style.whiteSpace = "pre";
let showTerminal = true;
function terminal_update() {
    terminal.scrollTop = terminal.scrollHeight;
}
function terminal_push(text, bg) {
    const div = document.createElement("div");
    terminal.appendChild(div);
    div.innerHTML = text;
    div.style.borderBottom = "1px solid #000";
    if (typeof bg !== "undefined")
        div.style.background = bg;
}
const repl = {
    kind: 2500,
    reset() {
        history = [{ code: "" }];
        historyViewIdx = 1;
        savedCode = "";
        terminal.innerHTML = "";
    },
    to_str() {
        return "repl";
    },
    callback(source) {
        console.log(source);
        if (source === "") {
            resultArea.style.visibility = "hidden";
        }
        else if (source.length <= 5) {
            this.ok("ok: source length is " + source.length);
        }
        else {
            this.error("error: source length is " + source.length);
        }
    },
    set_callback(fn) {
        this.callback = fn;
    },
    from_script(source) {
        source = source.trim();
        if (source === "")
            return;
        inputArea.value = "";
        input_area_resize();
        if (history[history.length - 1].code !== source)
            history.push({ code: source });
        historyViewIdx = history.length;
        terminal_push(source);
        this.callback(source);
        terminal_update();
    },
    place(x, y) {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        controller.style.left = x + "px";
        controller.style.top = y + "px";
    },
    ok(message) {
        if (message === "")
            return;
        terminal_push(message, colorOk);
        history[history.length - 1].output = message;
        if (!showTerminal) {
            resultArea.style.visibility = "visible";
            resultArea.style.background = colorOk;
            resultArea.innerHTML = message;
        }
    },
    error(message) {
        terminal_push(message, colorError);
        history[history.length - 1].output = message;
        if (!showTerminal) {
            resultArea.style.visibility = "visible";
            resultArea.style.background = colorError;
            resultArea.innerHTML = message;
        }
    }
};
export default repl;
