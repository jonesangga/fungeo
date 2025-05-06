import { KindName } from "./value.js";
var Op;
(function (Op) {
    Op[Op["Add"] = 0] = "Add";
    Op[Op["Call"] = 1] = "Call";
    Op[Op["Div"] = 2] = "Div";
    Op[Op["False"] = 3] = "False";
    Op[Op["Get"] = 4] = "Get";
    Op[Op["Index"] = 5] = "Index";
    Op[Op["List"] = 6] = "List";
    Op[Op["Load"] = 7] = "Load";
    Op[Op["Mul"] = 8] = "Mul";
    Op[Op["Neg"] = 9] = "Neg";
    Op[Op["Not"] = 10] = "Not";
    Op[Op["Pop"] = 11] = "Pop";
    Op[Op["Ret"] = 12] = "Ret";
    Op[Op["Set"] = 13] = "Set";
    Op[Op["Sub"] = 14] = "Sub";
    Op[Op["True"] = 15] = "True";
})(Op || (Op = {}));
;
const OpName = {
    [0]: "Add",
    [1]: "Call",
    [2]: "Div",
    [3]: "False",
    [4]: "Get",
    [5]: "Index",
    [6]: "List",
    [7]: "Load",
    [8]: "Mul",
    [9]: "Neg",
    [10]: "Not",
    [11]: "Pop",
    [12]: "Ret",
    [13]: "Set",
    [14]: "Sub",
    [15]: "True",
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
            case 4:
            case 7:
                let index = this.code[offset + 1];
                result += `${padr6(name)} ${padl4(index)} '${this.values[index].to_str()}'\n`;
                return [result, offset + 2];
            case 0:
            case 2:
            case 9:
            case 10:
            case 8:
            case 12:
            case 14:
                result += name + "\n";
                return [result, offset + 1];
            case 13:
                let nameId = this.code[offset + 1];
                let kind = this.code[offset + 2];
                result += `${padr6(name)} ${padl4(nameId)} '`;
                result += this.values[nameId].to_str();
                result += `: ${KindName[kind]}'\n`;
                return [result, offset + 3];
            default:
                result += `Unknown code ${instruction}\n`;
                return [result, offset + 1];
        }
    }
}
function zpad4(n) {
    return ('000' + n).slice(-4);
}
function padl4(n) {
    return ('   ' + n).slice(-4);
}
function padr6(s) {
    return (s + '      ').slice(0, 6);
}
export { Op, OpName, Chunk };
