import {Symbol, Node, Decorator, PropertyDeclaration} from "ts-morph";
import {collectError} from "./logOperations";
import {getConfigField} from "./configOperations";
import {getPropertiesOfDecorator, isFieldOfDecoratorMatch, isFieldOfDecoratorNull} from "./decoratorOperations";
import {getPropertiesOfType, isComplexType, isEnumType} from "./typeOperations";

export function getPropertyDeclarationOfProperty(property: Symbol) {
  return property
    .getDeclarations()
    .filter((declaration) => Node.isPropertyDeclaration(declaration))[0];
}

export function getDecoratorOfProperty(propertyField: Symbol, decName: string) {
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

export function checkProperty(property: Symbol) {
  const propertyDeclaration = getPropertyDeclarationOfProperty(property);

  const doesFieldIsClassProperty = propertyDeclaration !== undefined;
  if (!doesFieldIsClassProperty) {
    return;
  }

  if (
    isComplexType(propertyDeclaration.getType()) &&
      !isEnumType(propertyDeclaration.getType())
  ) {
    const propertiesOfProperty = getPropertiesOfType(propertyDeclaration.getType());
    propertiesOfProperty?.map((property) => checkProperty(property));
  }

  checkApiPropertyDecoratorOfProperty(property);
}

export function checkApiPropertyDecoratorOfProperty(property: Symbol){
  const propertyDeclaration = getPropertyDeclarationOfProperty(property);
  const apiPropertyDecorator = getDecoratorOfProperty(property, 'ApiProperty');

  if (!apiPropertyDecorator) {
    collectError(propertyDeclaration, `The '${(propertyDeclaration as PropertyDeclaration).getName()}' field does not have ApiProperty tag to describe information's`)
    return;
  }

  checkApiPropertyDecoratorValuesOfProperty(property,apiPropertyDecorator);
}

function checkApiPropertyDecoratorValuesOfProperty(property: Symbol, apiPropertyDecorator: Decorator){
  const checkDesc = getConfigField('scopes.endpoint.payload.description.check');
  const checkExample = getConfigField('scopes.endpoint.payload.example.check');
  const checkType = getConfigField('scopes.endpoint.payload.type.check');

  const decoratorProperties = getPropertiesOfDecorator(apiPropertyDecorator);

  if (checkDesc) {
    checkDescriptionOfProperty(decoratorProperties['description'], property, apiPropertyDecorator)
  }

  if (checkExample) {
    checkExampleOfProperty(decoratorProperties['example'],property,apiPropertyDecorator);
  }

  if (checkType) {
    checkTypeOfProperty(decoratorProperties['type'],property,apiPropertyDecorator);
  }
}

function checkDescriptionOfProperty(
  description: any,
  field: Symbol,
  decorator: Decorator,
) {
  if (isFieldOfDecoratorNull('description',decorator)){
    const errorText:string = `The '${field.getName()}' field does not have 'description'`
    collectError(decorator,errorText)
    return;
  }

  const pattern = getConfigField('scopes.endpoint.payload.description.pattern');

  if (pattern && !isFieldOfDecoratorMatch('description',decorator,pattern)){
    const errorText:string = `'description' value of '${field.getName()}' field did not match given pattern`
    collectError(decorator,errorText)
  }
}

function checkExampleOfProperty(
  example: any,
  field: Symbol,
  decorator: Decorator,
) {
  if (isFieldOfDecoratorNull('example',decorator)){
    const errorText:string = `The '${field.getName()}' field does not have 'example'`
    collectError(decorator,errorText)
  }
}

function checkTypeOfProperty(_type: any, field: Symbol, decorator: Decorator) {
  if (isFieldOfDecoratorNull('type',decorator)){
    const errorText:string = `The '${field.getName()}' field does not have 'type'`
    collectError(decorator,errorText)
  }
}
