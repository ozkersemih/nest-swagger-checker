"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertiesOfType = exports.isEnumType = exports.isComplexType = void 0;
function isComplexType(type) {
    if (type.isArray()) {
        if (type.getArrayElementType()?.getSymbol()) {
            return true;
        }
    }
    else if (type.getSymbol()) {
        return true;
    }
    return false;
}
exports.isComplexType = isComplexType;
function isEnumType(type) {
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
exports.isEnumType = isEnumType;
function getPropertiesOfType(_type) {
    if (_type.isArray()) {
        _type.getArrayElementType()?.getProperties();
    }
    return _type.getProperties();
}
exports.getPropertiesOfType = getPropertiesOfType;
