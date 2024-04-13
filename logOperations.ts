import {
  Decorator,
  MethodDeclaration,
  PropertyDeclaration,
  Symbol,
  SourceFile,
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
    `The '${propName}' field does not have ApiProperty tag to describe informations`;
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
      `${apiPropertyFieldName} value of '${field.getName()}' field did not match given pattern' `,
  );
}
