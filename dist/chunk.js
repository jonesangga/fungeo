import { KindName } from "./value.js";
var Op;
(function (Op) {
    Op[Op["Add"] = 100] = "Add";
    Op[Op["AddStr"] = 120] = "AddStr";
    Op[Op["CallNat"] = 200] = "CallNat";
    Op[Op["Div"] = 300] = "Div";
    Op[Op["GetNat"] = 400] = "GetNat";
    Op[Op["GetUsr"] = 500] = "GetUsr";
    Op[Op["Index"] = 600] = "Index";
    Op[Op["List"] = 700] = "List";
    Op[Op["Load"] = 800] = "Load";
    Op[Op["Mul"] = 900] = "Mul";
    Op[Op["Neg"] = 1000] = "Neg";
    Op[Op["Not"] = 1100] = "Not";
    Op[Op["Pop"] = 1200] = "Pop";
    Op[Op["Ret"] = 1300] = "Ret";
    Op[Op["Set"] = 1400] = "Set";
    Op[Op["Sub"] = 1500] = "Sub";
})(Op || (Op = {}));
;
const OpName = {
    [100]: "Add",
    [120]: "AddStr",
    [200]: "CallNat",
    [300]: "Div",
    [400]: "GetNat",
    [500]: "GetUsr",
    [600]: "Index",
    [700]: "List",
    [800]: "Load",
    [900]: "Mul",
    [1000]: "Neg",
    [1100]: "Not",
    [1200]: "Pop",
    [1300]: "Ret",
    [1400]: "Set",
    [1500]: "Sub",
};
class Chunk {
    name;
    code = [];
    lines = [];
    values = [];
    constructor(name) {
        this.name = name;
    }
    write(op, line) {
        this.code.push(op);
        this.lines.push(line);
    }
    add_value(value) {
        this.values.push(value);
        return this.values.length - 1;
    }
    disassemble() {
        let result = `== ${this.name} ==\n`;
        let res = "";
        for (let offset = 0; offset < this.code.length;) {
            [res, offset] = this.disassemble_instr(offset);
            result += res;
        }
        return result;
    }
    disassemble_instr(offset) {
        let result = zpad4(offset) + " ";
        if (offset > 0 && this.lines[offset] === this.lines[offset - 1]) {
            result += "   | ";
        }
        else {
            result += padl4(this.lines[offset]) + " ";
        }
        let instruction = this.code[offset];
        let name = OpName[instruction];
        switch (instruction) {
            case 200: {
                let index = this.code[offset + 1];
                let ver = this.code[offset + 2];
                result += `${padr7(name)} ${padl4(index)} 'v${ver}'\n`;
                return [result, offset + 3];
            }
            case 400:
            case 500:
            case 800: {
                let index = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(index)} '${this.values[index].to_str()}'\n`;
                return [result, offset + 2];
            }
            case 100:
            case 120:
            case 300:
            case 1000:
            case 1100:
            case 900:
            case 1300:
            case 1500: {
                result += name + "\n";
                return [result, offset + 1];
            }
            case 1400: {
                let nameId = this.code[offset + 1];
                let kind = this.code[offset + 2];
                result += `${padr7(name)} ${padl4(nameId)} '`;
                result += this.values[nameId].to_str();
                result += `: ${KindName[kind]}'\n`;
                return [result, offset + 3];
            }
            default: {
                result += `Unknown code ${instruction}\n`;
                return [result, offset + 1];
            }
        }
    }
}
function zpad4(n) {
    return ('000' + n).slice(-4);
}
function padl4(n) {
    return ('   ' + n).slice(-4);
}
function padr7(s) {
    return (s + '       ').slice(0, 7);
}
export { Op, OpName, Chunk };
