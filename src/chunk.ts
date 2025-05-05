// @jonesangga, 12-04-2025, MIT License.

import { Kind, KindName, Value } from "./value.js"

const enum Op {
    Add,
    Assign,
    AssignGObj,
    Call,
    Constant,
    Div,
    False,
    Get,
    Index,
    List,
    Mul,
    Negate,
    Not,
    Pop,
    Return,
    Sub,
    True,
};

const OpName: { [key in Op]: string } = {
    [Op.Add]: "Add",
    [Op.Assign]: "Assign",
    [Op.AssignGObj]: "AssignGObj",
    [Op.Call]: "Call",
    [Op.Constant]: "Constant",
    [Op.Div]: "Div",
    [Op.False]: "False",
    [Op.Get]: "Get",
    [Op.Index]: "Index",
    [Op.List]: "List",
    [Op.Mul]: "Mul",
    [Op.Negate]: "Negate",
    [Op.Not]: "Not",
    [Op.Pop]: "Pop",
    [Op.Return]: "Return",
    [Op.Sub]: "Sub",
    [Op.True]: "True",
};

class Chunk {
    code: number[] = [];
    lines: number[] = [];
    constants: Value[] = [];

    constructor(public name: string) {}

    write(op: Op, line: number): void {
        this.code.push(op);
        this.lines.push(line);
    }

    add_constant(value: Value): number {
        this.constants.push(value);
        return this.constants.length - 1;
    }

    debug(): string {
        let result = `== ${ this.name } ==\n`;

        let res = "";
        for (let offset = 0; offset < this.code.length;) {
            [res, offset] = this.debug_ints(offset);
            result += res;
        }
        return result;
    }

    debug_ints(offset: number): [string, number] {
        let result = "";
        result += zpad4(offset);

        if (offset > 0 && 
            this.lines[offset] === this.lines[offset - 1]) {
            result += "   | ";
        } else {
            result += pad4(this.lines[offset]) + " ";
        }

        let instruction = this.code[offset];
        let name = OpName[instruction as Op];
        switch (instruction) {
            case Op.Constant:
                let index = this.code[offset + 1];
                result += `${ pad16(name) } ${ pad4(index) } '`;
                result += this.constants[index as Op].to_str();
                result += "'\n";
                return [result, offset + 2];

            case Op.Assign:
                let nameId     = this.code[offset + 1];
                let kind: Kind = this.code[offset + 2];

                result += `${ pad16(name) } ${ pad4(nameId) } '`;
                result += this.constants[nameId].to_str();
                result += `: ${ KindName[kind] }'\n`;
                return [result, offset + 3];

            case Op.Return:
                result += name + "\n";
                return [result, offset + 1];

            default:
                result += `Unknown opcode ${ instruction }\n`;
                return [result, offset + 1];
        }
    }
}

function zpad4(n: number): string {
    return ('000'+n).slice(-4);
}

function pad4(n: number): string {
    return ('   '+n).slice(-4);
}

function pad16(s: string): string {
    return (s+'                ').slice(0,16);
}

export { Chunk, Op, OpName };
