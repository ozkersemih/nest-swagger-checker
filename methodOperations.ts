import {
  Decorator,
  Node,
  ParameterDeclaration,
  PropertyDeclaration,
  Symbol,
} from 'ts-morph';
import { checkApiPropertyDecorator } from './decoratorOperations';
import { logNoApiProperty } from './logOperations';
import {isComplexType, isEnumType} from "./typeOperations";

export function checkMethodParam(methodParam: ParameterDeclaration) {
  const fieldsOfMethodParam = getFieldsOfParam(methodParam);
  fieldsOfMethodParam?.map((field) => {
    checkField(field);
  });
}

function checkPropertyParam(param: PropertyDeclaration) {
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
        decorator = declaration.getDecorator(decName);
      }
    }
  });
  return decorator;
}

function getFieldsOfParam(
  param: ParameterDeclaration | PropertyDeclaration,
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
