import { names } from "./vm.js";
console.log("in module loader");
const stds = ["fish"];
export async function get_module(name) {
    if (stds.includes(name)) {
        let success = true;
        let got = {};
        switch (name) {
            case "fish": {
                await import(`./fish/mod.js`)
                    .then((module) => {
                    console.log("in get_module: ", got);
                    Object.assign(got, module.fishNames);
                })
                    .catch((error) => {
                    console.log(error);
                    success = false;
                });
                break;
            }
        }
        if (success) {
            return {
                ok: true,
                value: got,
            };
        }
        else {
            return {
                ok: false,
                error: new Error("unknown error"),
            };
        }
    }
    return {
        ok: false,
        error: new Error("unknown error"),
    };
}
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
                Object.assign(names, module.fishNames);
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
