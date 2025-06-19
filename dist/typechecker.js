import { BinaryTable } from "./ast.js";
import { names } from "./vm.js";
import { FunctionT, numberT, PointT, stringT, booleanT, nothingT } from "./literal/type.js";
function error(line, message) {
    let result = "type: " + line + ": " + message;
    throw new Error(result);
}
function assertType(expected, got, line) {
    if (!expected.equal(got))
        error(line, `expected ${expected.to_str()}, got ${got.to_str()}`);
}
function resolveVar(name, line) {
    if (Object.hasOwn(names, name))
        return names[name].type;
    else if (Object.hasOwn(tempNames, name))
        return tempNames[name].type;
    else
        error(line, `undefined name ${name}`);
}
class TypeChecker {
    visitNumber(node) {
        return numberT;
    }
    visitString(node) {
        return stringT;
    }
    visitBoolean(node) {
        return booleanT;
    }
    visitBinary(node) {
        let type = BinaryTable[node.op].type;
        assertType(type, node.left.visit(this), node.left.line);
        assertType(type, node.right.visit(this), node.right.line);
        return type;
    }
    visitIdent(node) {
        return resolveVar(node.name, node.line);
    }
    visitAssign(node) {
        let varType = node.left.visit(this);
        let valueType = node.right.visit(this);
        assertType(varType, valueType, node.right.line);
        return nothingT;
    }
    visitVarDecl(node) {
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
    visitExprStmt(node) {
        return node.expr.visit(this);
    }
    visitGetProp(node) {
        let objType = node.obj.visit(this);
        if (!(objType instanceof PointT))
            error(node.line, "no obj");
        if (!Object.hasOwn(objType.field, node.prop))
            error(node.line, `no prop ${node.prop} in obj`);
        return objType.field[node.prop];
    }
    visitFile(node) {
        node.stmts.forEach(stmt => stmt.visit(this));
        return nothingT;
    }
    visitCall(node) {
        let fnType = node.callee.visit(this);
        console.log(fnType);
        if (!(fnType instanceof FunctionT))
            error(node.callee.line, `${node.callee} is not a function`);
        let input = [];
        let output = fnType.output;
        node.args.forEach(arg => input.push(arg.visit(this)));
        let got = new FunctionT(input, output);
        assertType(fnType, got, node.line);
        return fnType.output;
    }
}
let tempNames = {};
export function typecheck(ast) {
    tempNames = {};
    let typeChecker = new TypeChecker();
    try {
        ast.visit(typeChecker);
        return {
            ok: true,
            value: tempNames,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: (error instanceof Error) ? error : new Error("unknown error"),
        };
    }
}
