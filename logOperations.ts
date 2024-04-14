import {
  Decorator,
  MethodDeclaration,
  PropertyDeclaration,
  Symbol,
  SourceFile, ParameterDeclaration,
} from 'ts-morph';

export function logNoApiOperation(file: SourceFile, method: MethodDeclaration) {
  const lineInfo = file.getLineAndColumnAtPos(method.getStart());
  const logText =
    `${file.getFilePath()}:${lineInfo.line}:${lineInfo.column}` +
    'The endpoint method has no ApiOperation tag to describe endpoint informations';
  console.log(logText);
}

export function logNoApiProperty(declaration: PropertyDeclaration) {
  const file = declaration.getSourceFile();
  const lineInfo = file.getLineAndColumnAtPos(declaration.getStart());
  const propName = declaration.getName();
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    `The '${propName}' field does not have ApiProperty tag to describe information's`;
  console.log(logText);
  return logText;
}

export function logEndpointEmptySummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint is empty';
  console.log(logText);
}

export function logInvalidEndpointSummary(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Summary of endpoint did not match given pattern';
  console.log(logText);
}

export function logInvalidEndpointDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint did not match given pattern';
  console.log(logText);
}

export function logEndpointEmptyDescription(
  lineInfo: { line: number; column: number },
  file: SourceFile,
) {
  const logText =
    `file://${file.getFilePath()}:${lineInfo.line}:${lineInfo.column} ` +
    'Description of endpoint is empty';
  console.log(logText);
}

export function logApiPropertyNullField(apiPropertyDecorator: Decorator, apiPropertyFieldName: string, field: Symbol){
  const lineInfo = apiPropertyDecorator
      .getSourceFile()
      .getLineAndColumnAtPos(apiPropertyDecorator.getStartLinePos());

  console.log(
      `file://${apiPropertyDecorator.getSourceFile().getFilePath()}:${lineInfo.line}:${
          lineInfo.column
      }`,
      `The '${field.getName()}' field does not have ${apiPropertyFieldName}`,
  );
}

export function logApiPropertyNotMatchField(apiPropertyDecorator: Decorator, apiPropertyFieldName: string, field: Symbol){
  const lineInfo = apiPropertyDecorator
      .getSourceFile()
      .getLineAndColumnAtPos(apiPropertyDecorator.getStartLinePos());


  console.log(
      `file://${apiPropertyDecorator.getSourceFile().getFilePath()}:${lineInfo.line}:${
          lineInfo.column
      }`,
      `${apiPropertyFieldName} value of '${field.getName()}' field did not match given pattern`,
  );
}

export function logNoApiParamDecorator(method: MethodDeclaration){
  const lineInfo = method.getSourceFile().getLineAndColumnAtPos(method.getStartLinePos());
  const filePath = method.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`'${method.getName()}' method does not have ApiParam decorator but it has parameter with @Param decorator`);
}

export function logNoMatchedApiParamDecorator(method: MethodDeclaration, apiParamOfMethod: ParameterDeclaration){
  const lineInfo = method.getSourceFile().getLineAndColumnAtPos(method.getStartLinePos());
  const filePath = method.getSourceFile().getFilePath();

  console.log(`file://${filePath}:${lineInfo.line}:${lineInfo.column}`,`'${method.getName()}' method does not have ApiParam decorator that matched with '${apiParamOfMethod.getName()}' param`);
}
