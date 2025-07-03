;
export const OpName = {
    [100]: "Add",
    [110]: "AddList",
    [120]: "AddStr",
    [200]: "Call",
    [210]: "CkExc",
    [212]: "CkExcD",
    [215]: "CkInc",
    [217]: "CkIncD",
    [300]: "Div",
    [380]: "Eq",
    [390]: "GEq",
    [395]: "GetLoc",
    [500]: "GetGlob",
    [510]: "GetMeth",
    [520]: "GetProp",
    [530]: "GT",
    [595]: "Inc",
    [600]: "Index",
    [610]: "IsDiv",
    [615]: "Jmp",
    [616]: "JmpBack",
    [620]: "JmpF",
    [680]: "Len",
    [690]: "LEq",
    [700]: "List",
    [800]: "Load",
    [805]: "Loop",
    [810]: "LT",
    [850]: "Member",
    [900]: "Mul",
    [1000]: "Neg",
    [1010]: "NEq",
    [1020]: "New",
    [1100]: "Not",
    [1150]: "Ok",
    [1200]: "Pop",
    [1300]: "Ret",
    [1400]: "Set",
    [1410]: "SetLoc",
    [1415]: "SetLocG",
    [1430]: "SetProp",
    [1450]: "Struct",
    [1500]: "Sub",
    [1600]: "Use",
};
export class Chunk {
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
        if (offset > 0 && this.lines[offset] === this.lines[offset - 1])
            result += "   | ";
        else
            result += padl4(this.lines[offset]) + " ";
        let instruction = this.code[offset];
        let name = OpName[instruction];
        switch (instruction) {
            case 100:
            case 110:
            case 120:
            case 300:
            case 380:
            case 390:
            case 530:
            case 600:
            case 610:
            case 680:
            case 690:
            case 805:
            case 810:
            case 850:
            case 900:
            case 1000:
            case 1010:
            case 1100:
            case 1150:
            case 1200:
            case 1500: {
                result += name + "\n";
                return [result, offset + 1];
            }
            case 1450: {
                let index = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(index)}\n`;
                return [result, offset + 2];
            }
            case 200: {
                let index = this.code[offset + 1];
                let ver = this.code[offset + 2];
                result += `${padr7(name)} ${padl4(index)} ver ${ver}\n`;
                return [result, offset + 3];
            }
            case 500:
            case 510:
            case 520:
            case 800:
            case 1020:
            case 1600: {
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
            case 210:
            case 212:
            case 215:
            case 217:
            case 395:
            case 595:
            case 1300:
            case 1410:
            case 1415: {
                let index = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(index)}\n`;
                return [result, offset + 2];
            }
            case 1400:
            case 1430: {
                let index = this.code[offset + 1];
                let varname = this.values[index].to_str();
                result += `${padr7(name)} ${padl4(index)} '${varname}'\n`;
                return [result, offset + 2];
            }
            case 700: {
                let length = this.code[offset + 1];
                result += `${padr7(name)} ${padl4(length)}\n`;
                return [result, offset + 2];
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
