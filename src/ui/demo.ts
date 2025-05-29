import repl from "./repl.js"
import { vm } from "../vm.js"

const files = [
    ["demo1", "demo1.fg"],
    ["demo2", "demo2.fg"],
    ["demo3", "demo3.fg"],
    ["demo4", "demo4.fg"],
];

const selectEl = document.createElement("select");
document.body.appendChild(selectEl);
selectEl.style.position = "absolute";
selectEl.style.fontSize = "16px";
let option = "<option value='-1'>Demo (will reset)</option>";

for (let i = 0; i < files.length; i++) {
    option += `<option value="${ i }">${ files[i][0] }</option>`;
}

selectEl.innerHTML = option;
selectEl.onchange = () => {
    let value = parseInt(selectEl.value);
    if (value === -1) return;
    get_data("demo/" + files[value][1]);
};

function get_data(file: string): void {
    fetch(file)
        .then((res) => res.text())
        .then((text) => {
            vm.init();
            repl.reset();
            repl.from_script(text)
        })
        .catch((e) => console.error(e));
}
