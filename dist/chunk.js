import { KindName } from "./value.js";
var Op;
(function (Op) {
    Op[Op["Add"] = 0] = "Add";
    Op[Op["Call"] = 1] = "Call";
    Op[Op["Div"] = 2] = "Div";
    Op[Op["False"] = 3] = "False";
    Op[Op["GetNat"] = 4] = "GetNat";
    Op[Op["GetUsr"] = 5] = "GetUsr";
    Op[Op["Index"] = 6] = "Index";
    Op[Op["List"] = 7] = "List";
    Op[Op["Load"] = 8] = "Load";
    Op[Op["Mul"] = 9] = "Mul";
    Op[Op["Neg"] = 10] = "Neg";
    Op[Op["Not"] = 11] = "Not";
    Op[Op["Pop"] = 12] = "Pop";
    Op[Op["Ret"] = 13] = "Ret";
    Op[Op["Set"] = 14] = "Set";
    Op[Op["Sub"] = 15] = "Sub";
    Op[Op["True"] = 16] = "True";
})(Op || (Op = {}));
;
const OpName = {
    [0]: "Add",
    [1]: "Call",
    [2]: "Div",
    [3]: "False",
    [4]: "GetNat",
    [5]: "GetUsr",
    [6]: "Index",
    [7]: "List",
    [8]: "Load",
    [9]: "Mul",
    [10]: "Neg",
    [11]: "Not",
    [12]: "Pop",
    [13]: "Ret",
    [14]: "Set",
    [15]: "Sub",
    [16]: "True",
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
            case 5:
            case 8:
                let index = this.code[offset + 1];
                result += `${padr6(name)} ${padl4(index)} '${this.values[index].to_str()}'\n`;
                return [result, offset + 2];
            case 0:
            case 2:
            case 10:
            case 11:
            case 9:
            case 13:
            case 15:
                result += name + "\n";
                return [result, offset + 1];
            case 14:
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
