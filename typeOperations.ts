import {Symbol, Type} from "ts-morph";

export function isComplexType(type: Type) {
    if (type.isArray()) {
        if (type.getArrayElementType()?.getSymbol()) {
            return true;
        }
    } else if (type.getSymbol()) {
        return true;
    }
    return false;
}

export function isEnumType(type: Type) {
    let isEnum = false;
    type
        .getSymbol()
        ?.getDeclarations()
        .map((d) => {
            if (d.getKindName().includes('Enum')) {
                isEnum = true;
            }
        });
    return isEnum;
}

export function getPropertiesOfType(_type: Type): Symbol[]{
    if (_type.isArray()){
        _type.getArrayElementType()?.getProperties();
    }
    return _type.getProperties();
}
