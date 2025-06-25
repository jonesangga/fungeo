import repl from "./repl.js";
import { vm } from "../vm.js";
const files = [
    ["book 1 prop 1", "demo1.fg"],
];
export let showDemoSelect = false;
const demoSelect = document.createElement("select");
document.body.appendChild(demoSelect);
demoSelect.style.position = "absolute";
demoSelect.style.fontSize = "16px";
demoSelect.style.visibility = showDemoSelect ? "visible" : "hidden";
export function toggleDemo() {
    demoSelect.style.visibility = showDemoSelect ? "hidden" : "visible";
    showDemoSelect = !showDemoSelect;
}
let option = "<option value='-1'>Demo (will reset)</option>";
for (let i = 0; i < files.length; i++) {
    option += `<option value="${i}">${files[i][0]}</option>`;
}
demoSelect.innerHTML = option;
demoSelect.onchange = () => {
    let value = parseInt(demoSelect.value);
    if (value === -1)
        return;
    get_data("demo/" + files[value][1]);
};
function get_data(file) {
    fetch(file)
        .then((res) => res.text())
        .then((text) => {
        vm.init();
        repl.reset();
        repl.from_script(text);
    })
        .catch((e) => console.error(e));
}
