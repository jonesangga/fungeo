import { names } from "./vm.js";

console.log("in module loader");

const stds = ["fish"];

export function load_module(name: string): boolean {
    if (!stds.includes(name)) return false;
    return load(name);
}

function load(name: string): boolean {
    let success = true;
    switch (name) {
        case "fish": {
            import(`./fish/mod.js`)
                .then((module) => {
                    console.log(module);
                    console.log(module.modNames);
                    Object.assign(names, module.modNames);
                    console.log(names);
                    // names["fishp"] = { type: pictureT, value: module.fish.p };
                    // names["fishq"] = { type: pictureT, value: module.fish.q };
                    // names["fishr"] = { type: pictureT, value: module.fish.r };
                    // names["fishs"] = { type: pictureT, value: module.fish.s };
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
