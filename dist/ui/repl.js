const container = document.createElement("div");
document.body.appendChild(container);
container.style.position = "absolute";
container.style.display = "flex";
container.style.top = "0px";
container.style.left = "0px";
container.style.background = "#ff0";
const holder = document.createElement("div");
container.appendChild(holder);
holder.style.position = "unset";
holder.style.width = "10px";
holder.style.height = "30px";
holder.style.background = "#000";
const input = document.createElement("textarea");
input.style.fontSize = "16px";
container.appendChild(input);
input.focus();
input.cols = 20;
input.rows = 1;
input.wrap = "off";
input.style.position = "unset";
input.style.minWidth = "560px";
input.style.maxWidth = "600px";
input.style.marginLeft = "5px";
input.style.padding = "0px 5px";
input.style.border = "1px solid #000";
input.style.background = "#eee";
input.style.overflow = "hidden";
const output = document.createElement("pre");
container.appendChild(output);
output.style.position = "absolute";
output.style.top = "25px";
output.style.left = "15px";
output.style.width = "250px";
output.style.border = "1px solid #000";
output.style.fontSize = "11px";
output.style.textWrap = "wrap";
output.style.visibility = "hidden";
const colorOk = "#70d196";
const colorFail = "#e85b5b";
let offsetX = 0;
let offsetY = 0;
let history = [{ code: "" }];
let historyViewIdx = 1;
let savedLine = "";
holder.addEventListener("mousedown", mousedown_cb);
function mousedown_cb(e) {
    if (e.button === 0) {
        let b = container.getBoundingClientRect();
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
        container.style.left = e.pageX - offsetX + "px";
        container.style.top = e.pageY - offsetY + "px";
    }
}
input.addEventListener("input", input_resize);
input.addEventListener("keydown", input_binding);
function input_reset() {
    input.style.height = "auto";
    input.style.height = "1lh";
    input.style.width = "210px";
    output.style.top = "calc(1lh + " + 10 + "px)";
}
function input_resize() {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    input.style.width = "auto";
    input.style.width = input.scrollWidth + "px";
    output.style.top = input.scrollHeight + 10 + "px";
}
input_resize();
function input_binding(e) {
    if (!e.shiftKey)
        return;
    if (e.key === "ArrowUp" && !e.repeat) {
        if (historyViewIdx > 1) {
            if (historyViewIdx === history.length) {
                savedLine = input.value;
            }
            historyViewIdx--;
            input.value = history[historyViewIdx].code;
            input_resize();
        }
        e.preventDefault();
    }
    else if (e.key === "ArrowDown" && !e.repeat) {
        if (historyViewIdx < history.length - 1) {
            historyViewIdx++;
            input.value = history[historyViewIdx].code;
        }
        else if (historyViewIdx === history.length - 1) {
            historyViewIdx++;
            input.value = savedLine;
        }
        input_resize();
    }
    else if (e.key === "Enter" && !e.repeat) {
        let source = input.value.trim();
        if (source !== "") {
            input.value = "";
            input_reset();
            if (history[history.length - 1].code !== source) {
                history.push({ code: source });
            }
            historyViewIdx = history.length;
            terminal_add_code(source);
            repl.callback(source);
            terminal_update();
        }
        e.preventDefault();
    }
}
const repl = {
    kind: 2500,
    to_str() { return "repl"; },
    callback(source) {
        console.log(source);
    },
    set_callback(fn) {
        this.callback = fn;
    },
    place(x, y) {
        if (x < 0 || y < 0 || x > 1000 || y > 1000) {
            console.log("invalid place");
            return;
        }
        container.style.left = x + "px";
        container.style.top = y + "px";
    },
    ok(message) {
        if (message === "")
            return;
        terminal_add_code(message, 1);
        history[history.length - 1].output = message;
        holder.style.background = colorOk;
        if (!terminalShow) {
            if (message === "") {
                output.style.visibility = "hidden";
            }
            else {
                output.style.visibility = "visible";
                output.style.borderColor = colorOk;
                output.innerHTML = message;
            }
        }
    },
    error(message) {
        terminal_add_code(message, 0);
        history[history.length - 1].output = message;
        holder.style.background = colorFail;
        if (!terminalShow) {
            output.style.visibility = "visible";
            output.style.borderColor = colorFail;
            output.innerHTML = message;
        }
    }
};
const terminal = document.createElement("div");
container.appendChild(terminal);
terminal.style.position = "absolute";
terminal.style.top = "-640px";
terminal.style.left = "0px";
terminal.style.width = "600px";
terminal.style.height = "630px";
terminal.style.border = "1px solid #000";
terminal.style.fontSize = "11px";
terminal.style.background = "#eee";
terminal.style.overflow = "auto";
terminal.style.fontFamily = "monospace";
terminal.style.whiteSpace = "pre";
let terminalShow = true;
function terminal_update() {
    terminal.scrollTop = terminal.scrollHeight;
}
function terminal_add_code(code, type) {
    const div = document.createElement("div");
    div.style.fontSize = "16px";
    div.style.borderBottom = "1px solid #000";
    if (type === 0) {
        div.style.background = "#fee";
    }
    else if (type === 1) {
        div.style.background = "#caf8dc";
    }
    div.innerHTML = code;
    terminal.appendChild(div);
}
export default repl;
