import {
  Decorator,
  Node,
} from 'ts-morph';

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
