// @jonesangga, 12-04-2025, MIT License.

import { Kind, KindName, type Value } from "./value.js"

const enum Op {
    Add,
    Call,
    Div,
    False,
    Get,
    Index,
    List,
    Load,
    Mul,
    Negate,
    Not,
    Pop,
    Ret,
    Set,
    Sub,
    True,
};

const OpName: { [key in Op]: string } = {
    [Op.Add]: "Add",
    [Op.Call]: "Call",
    [Op.Div]: "Div",
    [Op.False]: "False",
    [Op.Get]: "Get",
    [Op.Index]: "Index",
    [Op.List]: "List",
    [Op.Load]: "Load",
    [Op.Mul]: "Mul",
    [Op.Negate]: "Negate",
    [Op.Not]: "Not",
    [Op.Pop]: "Pop",
    [Op.Ret]: "Ret",
    [Op.Set]: "Set",
    [Op.Sub]: "Sub",
    [Op.True]: "True",
};

class Chunk {
    code: number[] = [];
    lines: number[] = [];
    values: Value[] = [];

    constructor(public name: string) {}

    write(op: Op, line: number): void {
        this.code.push(op);
        this.lines.push(line);
    }

    add_value(value: Value): number {
        this.values.push(value);
        return this.values.length - 1;
    }

    disassemble(): string {
        let result = `== ${ this.name } ==\n`;

        let res = "";
        for (let offset = 0; offset < this.code.length;) {
            [res, offset] = this.disassemble_instr(offset);
            result += res;
        }
        return result;
    }

    disassemble_instr(offset: number): [string, number] {
        let result = zpad4(offset) + " ";

        if (offset > 0 && this.lines[offset] === this.lines[offset - 1]) {
            result += "   | ";
        } else {
            result += padl4(this.lines[offset]) + " ";
        }

        let instruction = this.code[offset];
        let name = OpName[instruction as Op];
        switch (instruction) {
            case Op.Load:
                let index = this.code[offset + 1];
                result += `${ padr6(name) } ${ padl4(index) } '${ this.values[index].to_str() }'\n`;
                return [result, offset + 2];

            case Op.Ret:
                result += name + "\n";
                return [result, offset + 1];

            case Op.Set:
                let nameId     = this.code[offset + 1];
                let kind: Kind = this.code[offset + 2];

                result += `${ padr6(name) } ${ padl4(nameId) } '`;
                result += this.values[nameId].to_str();
                result += `: ${ KindName[kind] }'\n`;
                return [result, offset + 3];

            default:
                result += `Unknown code ${ instruction }\n`;
                return [result, offset + 1];
        }
    }
}

// Padding left with zero 4 characters.
function zpad4(n: number): string {
    return ('000'+n).slice(-4);
}

// Padding left 4 characters.
function padl4(n: number): string {
    return ('   '+n).slice(-4);
}

// Padding right 6 characters.
function padr6(s: string): string {
    return (s+'      ').slice(0, 6);
}

export { Op, OpName, Chunk };
