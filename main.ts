import {
  Decorator,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  Project,
  PropertyDeclaration,
  SourceFile,
  StringLiteral,
  Symbol,
  Type,
} from "ts-morph";
import * as fs from "fs";
import path from "path";
import { readFileSync } from "fs";
import * as R from "ramda";

type Error = {
  file: string;
  line: number;
  col: number;
  description: string;
  node: Node;
};

type SwaggerAnalyzerOptions = {
  checkEndpointInformation: boolean;
  checkEndpointPayload: boolean;
  checkEndpointApiParam: boolean;

  fileIncludePattern: string;
  interactive: boolean;
};

type RunOptions = {
  overwrittenFiles: [string, string][];
};

export class SwaggerAnalyzer {
  options: Partial<SwaggerAnalyzerOptions>;
  state: Record<string, Error[]>;
  project: Project;

  constructor(options: Partial<SwaggerAnalyzerOptions>) {
    // Init options
    this.options = options;
    if (!this.options.fileIncludePattern) {
      this.options.fileIncludePattern = `${path.resolve("./")}/${
        this.getConfigField("scopes.file.pathPattern")
      }`;
    }

    this.options.checkEndpointInformation = this.getConfigField(
      "scopes.endpoint.description.check",
    );
    this.options.checkEndpointApiParam = this.getConfigField(
      "scopes.endpoint.params.check",
    );
    this.options.checkEndpointPayload = this.getConfigField(
      "scopes.endpoint.payload.check",
    );

    // Init state
    this.state = {};
    this.project = new Project();
    this.project.addSourceFilesAtPaths(
      this.options.fileIncludePattern ?? this.options.fileIncludePattern,
    );
  }

  // * Config operations

  externalConfigPath = `${path.resolve("./")}/.swautomaterc`;
  defaultConfigPath = `${__dirname}/config.json`;
  externalConfig = fs.existsSync(this.externalConfigPath)
    ? JSON.parse(readFileSync(this.externalConfigPath, "utf-8"))
    : {};
  internalConfig = JSON.parse(readFileSync(this.defaultConfigPath, "utf-8"));
  CONFIG = R.mergeDeepRight(this.internalConfig, this.externalConfig);

  getConfigField(configPath: string) {
    return this.getObjectOfJson(this.CONFIG, configPath, "");
  }

  getObjectOfJson(jsonObj, path: string, defaultValue: any) {
    return R.path(path.split("."), jsonObj) || defaultValue;
  }

  // * Global stuff

  emit(node: Node, errorText: string) {
    const file = node.getSourceFile();
    const filePath = file.getFilePath();
    const lineInfo = file.getLineAndColumnAtPos(node.getStart());

    if (this.options.interactive) {
      const annotatedPath =
        `file://${filePath}:${lineInfo.line}:${lineInfo.column}`;
      console.log(`${annotatedPath} ${errorText}`);
    }

    const error = {
      file: filePath,
      line: lineInfo.line,
      col: lineInfo.column,
      description: errorText,
      node,
    };

    const fileErrors = this.state[filePath];
    if (!fileErrors) {
      this.state[filePath] = [error];
    } else {
      fileErrors.push(error);
    }
  }

  clearState() {
    this.state = {};
  }

  run(runOptions?: RunOptions) {
    this.clearState();

    runOptions?.overwrittenFiles?.forEach(([path, content]) => {
      this.project.createSourceFile(path, content, { overwrite: true });
    });

    const controllerFiles = this.getControllerFiles(this.project);

    controllerFiles.forEach((file) => {
      file.getClasses().forEach((clazz) => {
        clazz.getMethods().forEach((method) => {
          if (this.options.checkEndpointInformation) {
            this.checkEndpointInformations(method);
          }

          if (this.options.checkEndpointPayload) {
            this.checkEndpointPayload(method);
          }

          if (this.options.checkEndpointApiParam) {
            this.checkEndpointParam(method);
          }

          // endpointHasBasicApiResponse();
          // does decorators include ApiResponse for at least
          // OK and Internal server error?

          // do ApiResponse decorators has correct title and desc
          // with given regex?
        });
      });
    });

    return this.state;
  }

  // * Endpoint informations

  checkEndpointInformations(method: MethodDeclaration) {
    const decorators = method.getDecorators();

    if (!this.hasMethodApiOperationDecorator(method, decorators)) {
      const errorText: string =
        "The endpoint method has no ApiOperation tag to describe endpoint informations";
      this.emit(method, errorText);
    }

    if (this.hasMethodApiOperationDecorator(method, decorators)) {
      this.checkInformationProps(method);
    }
  }

  checkEndpointPayload(endpointMethod: MethodDeclaration) {
    const payloadParametersOfMethod = endpointMethod.getParameters().filter(
      (parameter) => {
        if (
          this.hasBodyOrQueryDecorator(parameter) &&
          this.isComplexParam(parameter) && this.hasClassType(parameter)
        ) {
          return parameter;
        }
      },
    );
    payloadParametersOfMethod.map((payloadParam) =>
      this.checkMethodParam(payloadParam)
    );
  }

  checkEndpointParam(endpointMethod: MethodDeclaration) {
    const apiParamParametersOfMethod = endpointMethod.getParameters().filter(
      (methodParameter) => {
        if (this.hasParamDecorator(methodParameter)) {
          return methodParameter;
        }
      },
    );
    apiParamParametersOfMethod.map((apiParamParameter) =>
      this.checkApiParamParameterOfMethod(apiParamParameter, endpointMethod)
    );
  }

  checkInformationProps(method: MethodDeclaration) {
    const apiOperationDec = method.getDecorator("ApiOperation");

    this.checkSummary(apiOperationDec);
    this.checkDescription(apiOperationDec);
  }

  checkSummary(apiOperationDec: Decorator) {
    const shouldCheckSummaryEmptiness = this.getConfigField(
      "scopes.endpoint.summary.checkEmpty",
    );
    const shouldCheckSummaryPattern =
      this.getConfigField("scopes.endpoint.summary.pattern") ? true : false;

    if (
      shouldCheckSummaryEmptiness &&
      this.isFieldOfDecoratorEmpty("summary", apiOperationDec)
    ) {
      const errorText = "Summary of endpoint is empty";
      this.emit(apiOperationDec, errorText);
    }

    if (shouldCheckSummaryPattern) {
      const patternRegex = new RegExp(
        `${this.getConfigField("scopes.endpoint.summary.pattern")}`,
      );
      if (
        !this.isFieldOfDecoratorMatch("summary", apiOperationDec, patternRegex)
      ) {
        const errorText: string =
          "Summary of endpoint did not match given pattern";
        this.emit(apiOperationDec, errorText);
      }
    }
  }

  checkDescription(apiOperationDec: Decorator) {
    const shouldCheckDescriptionEmptiness = this.getConfigField(
      "scopes.endpoint.description.checkEmpty",
    );
    const shouldCheckDescPattern =
      this.getConfigField("scopes.endpoint.description.pattern") ? true : false;

    if (
      shouldCheckDescriptionEmptiness &&
      this.isFieldOfDecoratorEmpty("description", apiOperationDec)
    ) {
      const errorText: string = "Description of endpoint is empty";
      this.emit(apiOperationDec, errorText);
    }

    if (shouldCheckDescPattern) {
      const patternRegex = new RegExp(
        `${this.getConfigField("scopes.endpoint.description.pattern")}`,
      );
      if (
        !this.isFieldOfDecoratorMatch(
          "description",
          apiOperationDec,
          patternRegex,
        )
      ) {
        const errorText: string =
          "Description of endpoint did not match given pattern";
        this.emit(apiOperationDec, errorText);
      }
    }
  }

  // * Decorator operations

  getPropertiesOfDecorator(decorator: Decorator) {
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
            properties[propertyKey] = "NOT_EMPTY";
          }
        }
      });
    }
    return properties;
  }

  isFieldOfDecoratorNull(
    fieldName: string,
    decorator: Decorator,
  ) {
    const decoratorFields = this.getPropertiesOfDecorator(decorator);
    if (decoratorFields[fieldName]) {
      return false;
    }
    return true;
  }

  isFieldOfDecoratorEmpty(
    fieldName: string,
    decorator: Decorator,
  ) {
    const decoratorFields = this.getPropertiesOfDecorator(decorator);
    if (
      !this.isFieldOfDecoratorNull(fieldName, decorator) &&
      decoratorFields[fieldName] === ""
    ) {
      return true;
    }
    return false;
  }

  isFieldOfDecoratorMatch(
    fieldName: string,
    decorator: Decorator,
    pattern: RegExp,
  ) {
    const decoratorFields = this.getPropertiesOfDecorator(decorator);
    const patternRegex = new RegExp(pattern);
    if (
      !this.isFieldOfDecoratorEmpty(fieldName, decorator) &&
      patternRegex.test(decoratorFields[fieldName])
    ) {
      return true;
    }
    return false;
  }

  // * File Operations

  hasFileControllerDecorator(file: SourceFile): boolean {
    let hasFileController = false;
    const classes = file.getClasses();
    classes.forEach((clazz) => {
      const decorators = clazz.getDecorators();
      if (
        decorators.some((decorator) => decorator.getName() === "Controller")
      ) {
        hasFileController = true;
      }
    });
    return hasFileController;
  }

  getControllerFiles(project: Project): SourceFile[] {
    const allFiles = project.getSourceFiles();
    const controllerFiles = allFiles.filter((file) => {
      if (this.hasFileControllerDecorator(file)) {
        return file;
      }
    });
    return controllerFiles;
  }

  // * Parameter operations

  hasBodyOrQueryDecorator(param: ParameterDeclaration) {
    if (
      Node.isDecorator(param.getDecorator("Body")) ||
      Node.isDecorator(param.getDecorator("Query"))
    ) {
      return true;
    }
    return false;
  }

  hasParamDecorator(param: ParameterDeclaration) {
    if (
      Node.isDecorator(param.getDecorator("Param"))
    ) {
      return true;
    }
    return false;
  }

  isComplexParam(param: ParameterDeclaration) {
    if (param.getType().getSymbol()) {
      return true;
    }
    return false;
  }

  hasClassType(param: ParameterDeclaration) {
    if (param.getType().isClass()) {
      return true;
    }
    return false;
  }

  // * Method operations

  checkMethodParam(methodParam: ParameterDeclaration) {
    const propertiesOfMethodParam = this.getPropertiesOfType(
      methodParam.getType(),
    );
    propertiesOfMethodParam?.map((property) => {
      this.checkProperty(property);
    });
  }

  checkApiParamParameterOfMethod(
    apiParamOfMethod: ParameterDeclaration,
    method: MethodDeclaration,
  ) {
    if (!this.hasMethodApiParamDecorator(method)) {
      const errorText: string =
        `'${method.getName()}' method does not have ApiParam decorator but it has parameter with @Param decorator`;
      this.emit(method, errorText);
      return;
    }

    if (!this.hasMethodApiParamDecoratorForApiParam(method, apiParamOfMethod)) {
      const errorText: string =
        `'${method.getName()}' method does not have ApiParam decorator that matched with '${apiParamOfMethod.getName()}' param`;
      this.emit(method, errorText);
      return;
    }

    const matchedApiParamDecorator = this.getMatchedApiParamDecorator(
      method.getDecorators().filter((decorator) =>
        decorator.getName() === "ApiParam"
      ),
      apiParamOfMethod,
    );

    const shouldCheckParamDescription = this.getConfigField(
      "scopes.endpoint.params.description.check",
    );
    if (
      shouldCheckParamDescription &&
      this.isFieldOfDecoratorNull("description", matchedApiParamDecorator)
    ) {
      const errorText: string =
        `ApiParam decorator of '${apiParamOfMethod.getName()}' parameter does not have 'description'`;
      this.emit(matchedApiParamDecorator, errorText);
    }

    const paramDescriptionPattern = this.getConfigField(
      "scopes.endpoint.params.description.pattern",
    );
    if (
      paramDescriptionPattern &&
      !this.isFieldOfDecoratorMatch(
        "description",
        matchedApiParamDecorator,
        paramDescriptionPattern,
      )
    ) {
      const errorText: string =
        `'description' in ApiParam decorator of '${apiParamOfMethod.getName()}' parameter did not match with given pattern`;
      this.emit(matchedApiParamDecorator, errorText);
    }

    const shouldCheckParamExample = this.getConfigField(
      "scopes.endpoint.params.example.check",
    );
    if (
      shouldCheckParamExample &&
      this.isFieldOfDecoratorNull("example", matchedApiParamDecorator)
    ) {
      const errorText: string =
        `'example' in ApiParam decorator of '${apiParamOfMethod.getName()}' parameter did not match with given pattern`;
      this.emit(matchedApiParamDecorator, errorText);
    }
  }

  hasMethodApiOperationDecorator(
    method: MethodDeclaration,
    decorators: Decorator[],
  ): boolean {
    if (
      decorators.some((decorator) => decorator.getName() === "ApiOperation")
    ) {
      return true;
    }
    return false;
  }

  hasMethodApiParamDecorator(
    method: MethodDeclaration,
  ): boolean {
    if (
      method.getDecorators().some((decorator) =>
        decorator.getName() === "ApiParam"
      )
    ) {
      return true;
    }
    return false;
  }

  hasMethodApiParamDecoratorForApiParam(
    method: MethodDeclaration,
    apiParamParameter: ParameterDeclaration,
  ): boolean {
    const apiParamDecorators = method.getDecorators().filter((decorator) =>
      decorator.getName() === "ApiParam"
    );
    if (!apiParamDecorators) {
      return false;
    }

    const matched = this.getMatchedApiParamDecorator(
      apiParamDecorators,
      apiParamParameter,
    );

    if (matched) return true;
    return false;
  }

  getMatchedApiParamDecorator(
    apiParamDecorators: Decorator[],
    apiParamParameter: ParameterDeclaration,
  ) {
    const matched = apiParamDecorators.filter((apiParamDecorator) => {
      const decoratorProperties = this.getPropertiesOfDecorator(
        apiParamDecorator,
      );
      const argumentValueOfApiParam = (apiParamParameter.getDecorator("Param")
        .getArguments()[0] as StringLiteral).getLiteralValue();
      if (decoratorProperties["name"] === argumentValueOfApiParam) {
        return apiParamDecorator;
      }
    });
    return matched[0] ?? undefined;
  }

  // * Property operations

  getPropertyDeclarationOfProperty(property: Symbol) {
    return property
      .getDeclarations()
      .filter((declaration) => Node.isPropertyDeclaration(declaration))[0];
  }

  getDecoratorOfProperty(propertyField: Symbol, decName: string) {
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

  checkProperty(property: Symbol) {
    const propertyDeclaration = this.getPropertyDeclarationOfProperty(property);

    const doesFieldIsClassProperty = propertyDeclaration !== undefined;
    if (!doesFieldIsClassProperty) {
      return;
    }

    if (
      this.isComplexType(propertyDeclaration.getType()) &&
      !this.isEnumType(propertyDeclaration.getType())
    ) {
      const propertiesOfProperty = this.getPropertiesOfType(
        propertyDeclaration.getType(),
      );
      propertiesOfProperty?.map((property) => this.checkProperty(property));
    }

    this.checkApiPropertyDecoratorOfProperty(property);
  }

  checkApiPropertyDecoratorOfProperty(property: Symbol) {
    const propertyDeclaration = this.getPropertyDeclarationOfProperty(property);
    const apiPropertyDecorator = this.getDecoratorOfProperty(
      property,
      "ApiProperty",
    );

    if (!apiPropertyDecorator) {
      this.emit(
        propertyDeclaration,
        `The '${
          (propertyDeclaration as PropertyDeclaration).getName()
        }' field does not have ApiProperty tag to describe information's`,
      );
      return;
    }

    this.checkApiPropertyDecoratorValuesOfProperty(
      property,
      apiPropertyDecorator,
    );
  }

  checkApiPropertyDecoratorValuesOfProperty(
    property: Symbol,
    apiPropertyDecorator: Decorator,
  ) {
    const checkDesc = this.getConfigField(
      "scopes.endpoint.payload.description.check",
    );
    const checkExample = this.getConfigField(
      "scopes.endpoint.payload.example.check",
    );
    const checkType = this.getConfigField("scopes.endpoint.payload.type.check");

    const decoratorProperties = this.getPropertiesOfDecorator(
      apiPropertyDecorator,
    );

    if (checkDesc) {
      this.checkDescriptionOfProperty(
        decoratorProperties["description"],
        property,
        apiPropertyDecorator,
      );
    }

    if (checkExample) {
      this.checkExampleOfProperty(
        decoratorProperties["example"],
        property,
        apiPropertyDecorator,
      );
    }

    if (checkType) {
      this.checkTypeOfProperty(
        decoratorProperties["type"],
        property,
        apiPropertyDecorator,
      );
    }
  }

  checkDescriptionOfProperty(
    description: any,
    field: Symbol,
    decorator: Decorator,
  ) {
    if (this.isFieldOfDecoratorNull("description", decorator)) {
      const errorText: string =
        `The '${field.getName()}' field does not have 'description'`;
      this.emit(decorator, errorText);
      return;
    }

    const pattern = this.getConfigField(
      "scopes.endpoint.payload.description.pattern",
    );

    if (
      pattern &&
      !this.isFieldOfDecoratorMatch("description", decorator, pattern)
    ) {
      const errorText: string =
        `'description' value of '${field.getName()}' field did not match given pattern`;
      this.emit(decorator, errorText);
    }
  }

  checkExampleOfProperty(
    example: any,
    field: Symbol,
    decorator: Decorator,
  ) {
    if (this.isFieldOfDecoratorNull("example", decorator)) {
      const errorText: string =
        `The '${field.getName()}' field does not have 'example'`;
      this.emit(decorator, errorText);
    }
  }

  checkTypeOfProperty(_type: any, field: Symbol, decorator: Decorator) {
    if (this.isFieldOfDecoratorNull("type", decorator)) {
      const errorText: string =
        `The '${field.getName()}' field does not have 'type'`;
      this.emit(decorator, errorText);
    }
  }

  // * Type operations

  isComplexType(type: Type) {
    if (type.isArray()) {
      if (type.getArrayElementType()?.getSymbol()) {
        return true;
      }
    } else if (type.getSymbol()) {
      return true;
    }
    return false;
  }

  isEnumType(type: Type) {
    let isEnum = false;
    type
      .getSymbol()
      ?.getDeclarations()
      .map((d) => {
        if (d.getKindName().includes("Enum")) {
          isEnum = true;
        }
      });
    return isEnum;
  }

  getPropertiesOfType(_type: Type): Symbol[] {
    if (_type.isArray()) {
      _type.getArrayElementType()?.getProperties();
    }
    return _type.getProperties();
  }
}
