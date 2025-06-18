// @jonesangga, 12-04-2025, MIT License.

import { AST, AssignNode, BinaryNode, BinaryTable, BooleanNode, CallNode, ExprStmtNode, FileNode, FnNode, NumberNode,
         StringNode, VarDeclNode, VarNode, Visitor } from "./ast.js";
import { names } from "./vm.js"
import { type Type, FunctionT, numberT, stringT, booleanT, nothingT } from "./literal/type.js"

function error(line: number, message: string): never {
    let result = "type: " + line + ": " + message;
    throw new Error(result);
}

function assertType(expected: Type, got: Type, line: number): void {
    if (!expected.equal(got))
        error(line, `expected ${ expected.to_str() }, got ${ got.to_str() }`);
}

function resolveVar(name: string, line: number): Type {
    if (Object.hasOwn(names, name))
        return names[name].type;
    else if (Object.hasOwn(tempNames, name))
        return tempNames[name].type;
    else
        error(line, `undefined name ${ name }`);
}

class TypeChecker implements Visitor<Type> {
    visitNumber(node: NumberNode): Type {
        return numberT;
    }

    visitString(node: StringNode): Type {
        return stringT;
    }

    visitBoolean(node: BooleanNode): Type {
        return booleanT;
    }

    visitBinary(node: BinaryNode): Type {
        let type = BinaryTable[node.op].type;
        assertType(type, node.left.visit(this), node.left.line);
        assertType(type, node.right.visit(this), node.right.line);
        return type;
    }

    visitFn(node: FnNode): Type {
        return resolveVar(node.name, node.line);
    }

    visitVar(node: VarNode): Type {
        return resolveVar(node.name, node.line);
    }

    visitAssign(node: AssignNode): Type {
        let varType = resolveVar(node.name, node.line);
        let valueType = node.value.visit(this);
        assertType(varType, valueType, node.value.line);
        return nothingT;
    }

    visitVarDecl(node: VarDeclNode): Type {
        if (Object.hasOwn(tempNames, node.name) ||
                Object.hasOwn(names, node.name)) {
            error(node.line, `${node.name} already defined`);
        }
        let type = node.init.visit(this);
        if (type.equal(nothingT))
            error(node.init.line, `cannot assign to nothingT`);
        tempNames[node.name] = { type };
        return nothingT;
    }

    visitExprStmt(node: ExprStmtNode): Type {
        return node.expr.visit(this);
    }

    visitFile(node: FileNode): Type {
        node.stmts.forEach(stmt => stmt.visit(this));
        return nothingT;
    }

    visitCall(node: CallNode): Type {
        let fnType = node.callee.visit(this);
        console.log(fnType);
        if (!(fnType instanceof FunctionT))
            error(node.callee.line, `${node.callee} is not a function`);
        let input: Type[] = [];
        let output = fnType.output;
        node.args.forEach(arg => input.push(arg.visit(this)));
        let got = new FunctionT(input, output);
        assertType(fnType, got, node.line);
        return fnType.output;
    }
}

// TODO: Change this later.
let tempNames: Record<string, { type: Type, mut?: boolean }> = {};

type Result<T> =
    | { ok: true, value: T }
    | { ok: false, error: Error };

export function typecheck(ast: FileNode): Result<typeof tempNames> {
    tempNames = {};         // Reset temporary name table.

    let typeChecker = new TypeChecker();
    try {
        ast.visit(typeChecker);
        return {
            ok: true,
            value: tempNames,
        };
    }
    catch(error: unknown) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
