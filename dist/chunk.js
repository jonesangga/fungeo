import { KindName } from "./value.js";
var Op;
(function (Op) {
    Op[Op["Add"] = 0] = "Add";
    Op[Op["Assign"] = 1] = "Assign";
    Op[Op["AssignGObj"] = 2] = "AssignGObj";
    Op[Op["Call"] = 3] = "Call";
    Op[Op["Constant"] = 4] = "Constant";
    Op[Op["Div"] = 5] = "Div";
    Op[Op["False"] = 6] = "False";
    Op[Op["Get"] = 7] = "Get";
    Op[Op["Index"] = 8] = "Index";
    Op[Op["List"] = 9] = "List";
    Op[Op["Mul"] = 10] = "Mul";
    Op[Op["Negate"] = 11] = "Negate";
    Op[Op["Not"] = 12] = "Not";
    Op[Op["Pop"] = 13] = "Pop";
    Op[Op["Return"] = 14] = "Return";
    Op[Op["Sub"] = 15] = "Sub";
    Op[Op["True"] = 16] = "True";
})(Op || (Op = {}));
;
const OpName = {
    [0]: "Add",
    [1]: "Assign",
    [2]: "AssignGObj",
    [3]: "Call",
    [4]: "Constant",
    [5]: "Div",
    [6]: "False",
    [7]: "Get",
    [8]: "Index",
    [9]: "List",
    [10]: "Mul",
    [11]: "Negate",
    [12]: "Not",
    [13]: "Pop",
    [14]: "Return",
    [15]: "Sub",
    [16]: "True",
};
class Chunk {
    name;
    code = [];
    lines = [];
    constants = [];
    constructor(name) {
        this.name = name;
    }
    write(op, line) {
        this.code.push(op);
        this.lines.push(line);
    }
    add_constant(value) {
        this.constants.push(value);
        return this.constants.length - 1;
    }
    debug() {
        let result = `== ${this.name} ==\n`;
        let res = "";
        for (let offset = 0; offset < this.code.length;) {
            [res, offset] = this.debug_ints(offset);
            result += res;
        }
        return result;
    }
    debug_ints(offset) {
        let result = "";
        result += zpad4(offset);
        if (offset > 0 &&
            this.lines[offset] === this.lines[offset - 1]) {
            result += "   | ";
        }
        else {
            result += pad4(this.lines[offset]) + " ";
        }
        let instruction = this.code[offset];
        let name = OpName[instruction];
        switch (instruction) {
            case 4:
                let index = this.code[offset + 1];
                result += `${pad16(name)} ${pad4(index)} '`;
                result += this.constants[index].to_str();
                result += "'\n";
                return [result, offset + 2];
            case 1:
                let nameId = this.code[offset + 1];
                let kind = this.code[offset + 2];
                result += `${pad16(name)} ${pad4(nameId)} '`;
                result += this.constants[nameId].to_str();
                result += `: ${KindName[kind]}'\n`;
                return [result, offset + 3];
            case 14:
                result += name + "\n";
                return [result, offset + 1];
            default:
                result += `Unknown opcode ${instruction}\n`;
                return [result, offset + 1];
        }
    }
}
function zpad4(n) {
    return ('000' + n).slice(-4);
}
function pad4(n) {
    return ('   ' + n).slice(-4);
}
function pad16(s) {
    return (s + '                ').slice(0, 16);
}
export { Chunk, Op, OpName };
