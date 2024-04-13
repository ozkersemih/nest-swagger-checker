import {
  Decorator,
  MethodDeclaration,
  ParameterDeclaration,
} from 'ts-morph';
import {
  checkProperty,
} from "./propertyOperations";
import {getPropertiesOfType} from "./typeOperations";

export function checkMethodParam(methodParam: ParameterDeclaration) {
  const propertiesOfMethodParam = getPropertiesOfType(methodParam.getType());
  propertiesOfMethodParam?.map((property) => {
    checkProperty(property);
  });
}

export function hasMethodApiOperationDecorator(
    method: MethodDeclaration,
    decorators: Decorator[],
): boolean {
  if (decorators.some((decorator) => decorator.getName() === 'ApiOperation')) {
    return true;
  }
  return false;
}

