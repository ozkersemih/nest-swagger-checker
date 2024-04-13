import {Symbol, Node, Decorator, PropertyDeclaration} from "ts-morph";
import {logApiPropertyNotMatchField, logApiPropertyNullField, logNoApiProperty} from "./logOperations";
import {getConfig} from "./configOperations";
import {getPropertiesOfDecorator, isFieldOfDecoratorMatch, isFieldOfDecoratorNull} from "./decoratorOperations";
import {getPropertiesOfType, isComplexType, isEnumType} from "./typeOperations";

const config = getConfig();

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
        logNoApiProperty(propertyDeclaration as PropertyDeclaration);
        return;
    }

    checkApiPropertyDecoratorValuesOfProperty(property,apiPropertyDecorator);
}

function checkApiPropertyDecoratorValuesOfProperty(property: Symbol, apiPropertyDecorator: Decorator){
    const checkDesc = config.scopes.endpoint.payload.description.check;
    const checkExample = config.scopes.endpoint.payload.example.check;
    const checkType = config.scopes.endpoint.payload.type.check;

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
        logApiPropertyNullField(decorator,'description',field);
    }

    const pattern = config.scopes.endpoint.payload.description.pattern;

    if (pattern && !isFieldOfDecoratorMatch('description',decorator,pattern)){
        logApiPropertyNotMatchField(decorator,'description',field)
    }
}

function checkExampleOfProperty(
    example: any,
    field: Symbol,
    decorator: Decorator,
) {
    if (isFieldOfDecoratorNull('example',decorator)){
        logApiPropertyNullField(decorator,'example',field)
    }
}

function checkTypeOfProperty(_type: any, field: Symbol, decorator: Decorator) {
    if (isFieldOfDecoratorNull('type',decorator)){
        logApiPropertyNullField(decorator,'type',field)
    }
}