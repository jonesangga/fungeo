import { KindName } from "./value.js";
var Op;
(function (Op) {
    Op[Op["Add"] = 100] = "Add";
    Op[Op["AddStr"] = 120] = "AddStr";
    Op[Op["CallNat"] = 200] = "CallNat";
    Op[Op["Cond"] = 210] = "Cond";
    Op[Op["Div"] = 300] = "Div";
    Op[Op["Eq"] = 380] = "Eq";
    Op[Op["GEq"] = 390] = "GEq";
    Op[Op["GetLoc"] = 395] = "GetLoc";
    Op[Op["GetNat"] = 400] = "GetNat";
    Op[Op["GetUsr"] = 500] = "GetUsr";
    Op[Op["GT"] = 530] = "GT";
    Op[Op["Inc"] = 595] = "Inc";
    Op[Op["Index"] = 600] = "Index";
    Op[Op["IsDiv"] = 610] = "IsDiv";
    Op[Op["Jmp"] = 615] = "Jmp";
    Op[Op["JmpBack"] = 616] = "JmpBack";
    Op[Op["JmpF"] = 620] = "JmpF";
    Op[Op["LEq"] = 690] = "LEq";
    Op[Op["List"] = 700] = "List";
    Op[Op["Load"] = 800] = "Load";
    Op[Op["LT"] = 810] = "LT";
    Op[Op["Mul"] = 900] = "Mul";
    Op[Op["Neg"] = 1000] = "Neg";
    Op[Op["NEq"] = 1010] = "NEq";
    Op[Op["Not"] = 1100] = "Not";
    Op[Op["Pop"] = 1200] = "Pop";
    Op[Op["Ret"] = 1300] = "Ret";
    Op[Op["Set"] = 1400] = "Set";
    Op[Op["SetLoc"] = 1410] = "SetLoc";
    Op[Op["Sub"] = 1500] = "Sub";
})(Op || (Op = {}));
;
const OpName = {
    [100]: "Add",
    [120]: "AddStr",
    [200]: "CallNat",
    [210]: "Cond",
    [300]: "Div",
    [380]: "Eq",
    [390]: "GEq",
    [395]: "GetLoc",
    [400]: "GetNat",
    [500]: "GetUsr",
    [530]: "GT",
    [595]: "Inc",
    [600]: "Index",
    [610]: "IsDiv",
    [615]: "Jmp",
    [616]: "JmpBack",
    [620]: "JmpF",
    [690]: "LEq",
    [700]: "List",
    [800]: "Load",
    [810]: "LT",
    [900]: "Mul",
    [1000]: "Neg",
    [1010]: "NEq",
    [1100]: "Not",
    [1200]: "Pop",
    [1300]: "Ret",
    [1400]: "Set",
    [1410]: "SetLoc",
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
            case 615:
            case 616:
            case 620: {
                let jump = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(offset)} -> ${offset + 2 + jump}\n`;
                return [result, offset + 2];
            }
            case 395: {
                let index = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(index)}\n`;
                return [result, offset + 2];
            }
            case 100:
            case 120:
            case 210:
            case 300:
            case 380:
            case 390:
            case 530:
            case 595:
            case 610:
            case 690:
            case 810:
            case 900:
            case 1000:
            case 1010:
            case 1100:
            case 1200:
            case 1300:
            case 1410:
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
