// @jonesangga, 12-04-2025, MIT License.

import { Kind, KindName, FGFunction, type Value } from "./value.js"

export const enum Op {
    Add     = 100,
    AddStr  = 120,
    CallNat = 200,
    CallUsr = 205,
    Cond    = 210,
    Div     = 300,
    Eq      = 380,
    GEq     = 390,
    GetLoc  = 395,
    GetNat  = 400,   // Get nativeNames.
    GetUsr  = 500,   // Get userNames.
    GT      = 530,
    Inc     = 595,
    Index   = 600,
    IsDiv   = 610,
    Jmp     = 615,
    JmpBack = 616,
    JmpF    = 620,
    LEq     = 690,
    List    = 700,
    Load    = 800,
    LT      = 810,
    Mul     = 900,
    Neg     = 1000,
    NEq     = 1010,
    Not     = 1100,
    Ok      = 1290,
    Pop     = 1200,
    Ret     = 1300,
    Set     = 1400,
    SetLoc  = 1410,
    Sub     = 1500,
};

export const OpName: {
    [N in (keyof typeof Op) as (typeof Op)[N]]: N
} = {
    [Op.Add]: "Add",
    [Op.AddStr]: "AddStr",
    [Op.CallNat]: "CallNat",
    [Op.CallUsr]: "CallUsr",
    [Op.Cond]: "Cond",
    [Op.Div]: "Div",
    [Op.Eq]: "Eq",
    [Op.GEq]: "GEq",
    [Op.GetLoc]: "GetLoc",
    [Op.GetNat]: "GetNat",
    [Op.GetUsr]: "GetUsr",
    [Op.GT]: "GT",
    [Op.Inc]: "Inc",
    [Op.Index]: "Index",
    [Op.IsDiv]: "IsDiv",
    [Op.Jmp]: "Jmp",
    [Op.JmpBack]: "JmpBack",
    [Op.JmpF]: "JmpF",
    [Op.LEq]: "LEq",
    [Op.List]: "List",
    [Op.Load]: "Load",
    [Op.LT]: "LT",
    [Op.Mul]: "Mul",
    [Op.Neg]: "Neg",
    [Op.NEq]: "NEq",
    [Op.Not]: "Not",
    [Op.Ok]: "Ok",
    [Op.Pop]: "Pop",
    [Op.Ret]: "Ret",
    [Op.Set]: "Set",
    [Op.SetLoc]: "SetLoc",
    [Op.Sub]: "Sub",
};

export class Chunk {
    code: number[] = [];
    lines: number[] = [];
    values: Value[] = [];

    constructor(public name: string) {}

    write(op: number, line: number): void {
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

        if (offset > 0 && this.lines[offset] === this.lines[offset - 1])
            result += "   | ";
        else
            result += padl4(this.lines[offset]) + " ";

        let instruction = this.code[offset];
        let name = OpName[instruction as Op];
        switch (instruction) {
            case Op.Add:
            case Op.AddStr:
            case Op.Div:
            case Op.Eq:
            case Op.GEq:
            case Op.GT:
            case Op.IsDiv:
            case Op.LEq:
            case Op.LT:
            case Op.Mul:
            case Op.Neg:
            case Op.NEq:
            case Op.Not:
            case Op.Ok:
            case Op.Pop:
            case Op.SetLoc:
            case Op.Sub: {
                result += name + "\n";
                return [result, offset + 1];
            }

            case Op.CallNat:
            case Op.CallUsr: {
                let index = this.code[offset + 1];
                let fn = this.values[index] as FGFunction;
                let ver = this.code[offset + 2];
                result += `${ padr7(name) } ${ padl4(index) } '${ fn.name } v${ ver }'\n`;
                return [result, offset + 3];
            }

            case Op.GetNat:
            case Op.GetUsr:
            case Op.Load: {
                let index = this.code[offset + 1];
                result += `${ padr7(name) } ${ padl4(index) } '${ this.values[index].to_str() }'\n`;
                return [result, offset + 2];
            }

            case Op.Jmp:
            case Op.JmpBack:
            case Op.JmpF: {
                let jump = this.code[offset + 1];
                result += `${ padr7(name) } ${ padl4(offset) } -> ${ offset + 2 + jump }\n`;
                return [result, offset + 2];
            }

            case Op.Cond:
            case Op.GetLoc:
            case Op.Inc:
            case Op.Ret: {
                let index = this.code[offset + 1];
                result += `${ padr7(name) } ${ padl4(index) }\n`;
                return [result, offset + 2];
            }

            case Op.Set: {
                let nameId     = this.code[offset + 1];
                let kind: Kind = this.code[offset + 2];

                result += `${ padr7(name) } ${ padl4(nameId) } '`;
                result += this.values[nameId].to_str();
                result += `: ${ KindName[kind] }'\n`;
                return [result, offset + 3];
            }

            default: {
                result += `Unknown code ${ instruction }\n`;
                return [result, offset + 1];
            }
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

// Padding right 7 characters.
function padr7(s: string): string {
    return (s+'       ').slice(0, 7);
}
