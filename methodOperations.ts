import {
  Decorator,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  PropertyDeclaration,
  PropertySignature,
  Symbol,
  Type,
} from 'ts-morph';
import { checkApiPropertyDecorator } from './decoratorOperations';
import { logNoApiProperty } from './logOperations';

export function checkMethodParams(method: MethodDeclaration) {
  method.getParameters().map((methodParam) => {
    console.log('Method Param:', methodParam.getName());
    checkMethodParam(methodParam);
  });
}

function checkMethodParam(methodParam: ParameterDeclaration) {
  if (isComplexParam(methodParam) && hasBodyOrQueryDecorator(methodParam)) {
    const fieldsOfMethodParam = getFieldsOfParam(methodParam);
    fieldsOfMethodParam?.map((field) => {
      checkField(field);
    });
  }
}

function checkPropertyParam(param: PropertyDeclaration | PropertySignature) {
  const fieldsOfProperty = getFieldsOfParam(param);
  fieldsOfProperty?.map((field) => {
    checkField(field);
  });
}

function checkField(field: Symbol) {
  const propertyDeclaration = getPropertyDeclarationOfField(field);
  const doesFieldIsClassProperty = propertyDeclaration !== undefined;
  if (!doesFieldIsClassProperty) {
    return;
  }
  if (
    isComplexType(propertyDeclaration.getType()) &&
    !isEnumType(propertyDeclaration.getType())
  ) {
    checkPropertyParam(propertyDeclaration as PropertyDeclaration);
  }

  const ApiPropertyDecorator = getDecoratorOfField(field, 'ApiProperty');
  if (!ApiPropertyDecorator) {
    logNoApiProperty(propertyDeclaration as PropertyDeclaration);
    return;
  }
  checkApiPropertyDecorator(ApiPropertyDecorator, field);
}

function getDecoratorOfField(propertyField: Symbol, decName: string) {
  let decorator: Decorator | undefined;
  propertyField.getDeclarations().map((declaration) => {
    if (Node.isPropertyDeclaration(declaration)) {
      if (declaration.getDecorator(decName)) {
        decorator = declaration.getDecorator(decName)!;
      }
    }
  });
  return decorator;
}

function isComplexParam(param: ParameterDeclaration) {
  if (param.getType().getSymbol()) {
    return true;
  }
  return false;
}

function isComplexType(type: Type) {
  if (type.isArray()) {
    if (type.getArrayElementType()?.getSymbol()) {
      return true;
    }
  } else if (type.getSymbol()) {
    return true;
  }
  return false;
}

function isEnumType(type: Type) {
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

function hasBodyOrQueryDecorator(param: ParameterDeclaration) {
  if (
    Node.isDecorator(param.getDecorator('Body')) ||
    Node.isDecorator(param.getDecorator('Query'))
  ) {
    return true;
  }
  return false;
}

function getFieldsOfParam(
  param: ParameterDeclaration | PropertyDeclaration | PropertySignature,
) {
  if (param.getType().isArray()) {
    return param.getType().getArrayElementType()?.getProperties();
  }
  return param.getType().getProperties();
}

function getPropertyDeclarationOfField(field: Symbol) {
  return field
    .getDeclarations()
    .filter((declaration) => Node.isPropertyDeclaration(declaration))[0];
}
