import { names } from "./vm.js";
import { pictureT } from "./literal/type.js";
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
            import(`./data/fish.js`)
                .then((module) => {
                console.log(module);
                names["fishp"] = { type: pictureT, value: module.fish.p };
                names["fishq"] = { type: pictureT, value: module.fish.q };
                names["fishr"] = { type: pictureT, value: module.fish.r };
                names["fishs"] = { type: pictureT, value: module.fish.s };
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
