import { names } from "./vm.js";
console.log("in module loader");
const stds = ["fish"];
export function load_module(name) {
    if (!stds.includes(name))
        return false;
    return load(name);
}
function load(name) {
    let success = true;
    switch (name) {
        case "fish": {
            import(`./fish/mod.js`)
                .then((module) => {
                console.log(module);
                console.log(module.modNames);
                Object.assign(names, module.modNames);
                console.log(names);
            })
                .catch((error) => {
                console.log(error);
                success = false;
            });
            break;
        }
    }
    return success;
}
