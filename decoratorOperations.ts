import {
  Decorator,
  MethodDeclaration,
  Node,
  Symbol,
} from 'ts-morph';
import {getConfig} from "./configOperations";
import { logApiPropertyNotMatchField, logApiPropertyNullField} from "./logOperations";

const config = getConfig();

export function methodHasInformationDecorator(
  method: MethodDeclaration,
  decorators: Decorator[],
): boolean {
  if (decorators.some((decorator) => decorator.getName() === 'ApiOperation')) {
    return true;
  }
  return false;
}

export function getPropertiesOfDecorator(decorator: Decorator) {
  const properties = {};
  const argumentObject = decorator.getArguments()[0];
  if (Node.isObjectLiteralExpression(argumentObject)) {
    argumentObject.getProperties().map((property) => {
      if (Node.isPropertyAssignment(property)) {
        const propertyKey = property.getName();
        const propertyValue = property.getInitializer();
        if (Node.isStringLiteral(propertyValue)) {
          properties[propertyKey] = propertyValue.getLiteralValue();
        } else {
          properties[propertyKey] = 'NOT_EMPTY';
        }
      }
    });
  }
  return properties;
}

export function checkApiPropertyDecorator(decorator: Decorator, field: Symbol) {
  const checkDesc = config.scopes.endpoint.payload.description.check;
  const checkExample = config.scopes.endpoint.payload.example.check;
  const checkType = config.scopes.endpoint.payload.type.check;

  const decoratorFields = getPropertiesOfDecorator(decorator);

  if (checkDesc) {
    checkApiPropertyDesc(decoratorFields['description'], field, decorator);
  }

  if (checkExample) {
    checkApiPropertyExample(decoratorFields['example'], field, decorator);
  }

  if (checkType) {
    checkApiPropertyType(decoratorFields['type'], field, decorator);
  }
}

function checkApiPropertyDesc(
  description: any,
  field: Symbol,
  decorator: Decorator,
) {
  if (isFieldOfDecoratorNull('description',decorator)){
    logApiPropertyNullField(decorator,'description',field);
  }

  const pattern = config.scopes.endpoint.payload.description.pattern;

  if (pattern && !isFieldOfDecoratorMatch('description',decorator,pattern)){
    logApiPropertyNotMatchField(decorator,'description',field)
  }
}

function checkApiPropertyExample(
  example: any,
  field: Symbol,
  decorator: Decorator,
) {
  if (isFieldOfDecoratorNull('example',decorator)){
    logApiPropertyNullField(decorator,'example',field)
  }
}

function checkApiPropertyType(_type: any, field: Symbol, decorator: Decorator) {
  if (isFieldOfDecoratorNull('type',decorator)){
    logApiPropertyNullField(decorator,'type',field)
  }
}

// ***** GENERIC ***** //
export function isFieldOfDecoratorNull(
  fieldName: string,
  decorator: Decorator,
) {
  const decoratorFields = getPropertiesOfDecorator(decorator);
  if (decoratorFields[fieldName]) {
    return false;
  }
  return true;
}

export function isFieldOfDecoratorEmpty(
  fieldName: string,
  decorator: Decorator,
) {
  const decoratorFields = getPropertiesOfDecorator(decorator);
  if (
    !isFieldOfDecoratorNull(fieldName, decorator) &&
    decoratorFields[fieldName] === ''
  ) {
    return true;
  }
  return false;
}

export function isFieldOfDecoratorMatch(
  fieldName: string,
  decorator: Decorator,
  pattern: RegExp,
) {
  const decoratorFields = getPropertiesOfDecorator(decorator);
  const patternRegex = new RegExp(pattern);
  if (
    !isFieldOfDecoratorEmpty(fieldName, decorator) &&
    patternRegex.test(decoratorFields[fieldName])
  ) {
    return true;
  }
  return false;
}
// ********** //
