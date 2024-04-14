import {Node, ParameterDeclaration} from "ts-morph";

export function hasBodyOrQueryDecorator(param: ParameterDeclaration) {
    if (
        Node.isDecorator(param.getDecorator('Body')) ||
        Node.isDecorator(param.getDecorator('Query'))
    ) {
        return true;
    }
    return false;
}

export function hasParamDecorator(param: ParameterDeclaration) {
    if (
        Node.isDecorator(param.getDecorator('Param'))
    ) {
        return true;
    }
    return false;
}

export function isComplexParam(param: ParameterDeclaration) {
    if (param.getType().getSymbol()) {
        return true;
    }
    return false;
}

export function hasClassType(param: ParameterDeclaration){
    if (param.getType().isClass())
        return true;
    return false;
}
